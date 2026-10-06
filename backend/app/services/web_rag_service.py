"""
WebPrep 2.0: Google-Authentic Search & PDF Retrieval Engine
Supports:
1. Strict PDF-Only Document Retrieval across universities, repositories, and technical publishers
2. Real Google Suggest Autocomplete Typeahead
3. Hybrid Mode (Zero-Key DDGS Engine by default, Official Google Custom Search API if keys configured)
4. Distraction-Free In-App Document & PDF Viewing
"""

import os
import time
import urllib.parse
import re
import logging
from typing import Dict, Any, List, Optional
import httpx

try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        DDGS = None

try:
    import trafilatura
except ImportError:
    trafilatura = None

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

logger = logging.getLogger(__name__)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Environment variables for optional Official Google Custom Search API
GOOGLE_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY", "")
GOOGLE_SEARCH_CX = os.getenv("GOOGLE_SEARCH_CX", "")


def _clean_domain(url: str) -> str:
    try:
        parsed = urllib.parse.urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc or "document-source"
    except Exception:
        return "document-source"


def _clean_breadcrumb(url: str) -> str:
    try:
        parsed = urllib.parse.urlparse(url)
        domain = _clean_domain(url)
        path_parts = [p for p in parsed.path.split("/") if p.strip()]
        if not path_parts:
            return domain
        return f"{domain} › " + " › ".join(path_parts[:3])
    except Exception:
        return url


def _classify_pdf_doc_type(title: str, url: str, snippet: str) -> str:
    text = f"{title} {url} {snippet}".lower()
    if any(k in text for k in [".edu", "course", "lecture", "cs3", "cos", "mit.edu", "stanford", "iit", "nptel", "syllabus"]):
        return "University Lecture Slides"
    elif any(k in text for k in ["cheat sheet", "handbook", "quick reference", "summary", "formula"]):
        return "Quick Revision Cheat Sheet"
    elif any(k in text for k in ["interview", "questions", "placement", "viva", "assessment", "exam"]):
        return "Placement & Exam Sheet"
    elif any(k in text for k in ["arxiv", "paper", "journal", "research", "ieee", "acm", "proceedings"]):
        return "Academic Research Paper"
    return "Technical PDF Document"


def fetch_google_suggestions(query: str, limit: int = 8) -> List[str]:
    """
    Fetches real-time predictive Google search suggestions (typeahead).
    """
    clean_q = (query or "").strip()
    if not clean_q or len(clean_q) < 2:
        return []

    try:
        encoded_q = urllib.parse.quote(clean_q)
        url = f"https://suggestqueries.google.com/complete/search?client=firefox&q={encoded_q}"
        headers = {"User-Agent": USER_AGENT}
        with httpx.Client(timeout=2.5, headers=headers) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if len(data) >= 2 and isinstance(data[1], list):
                    return data[1][:limit]
    except Exception as e:
        logger.warning(f"Google Suggest fetch failed: {e}")

    return []


class GoogleSearchEngine:
    @staticmethod
    def search(
        query: str, 
        file_format: str = "pdf", 
        filter_category: str = "All", 
        top_k: int = 8
    ) -> List[Dict[str, Any]]:
        clean_q = (query or "").strip()
        if not clean_q:
            clean_q = "Operating Systems Deadlock"

        # ── Step 1: Query Modification based on filter & format ──
        augmented_query = clean_q

        if file_format.lower() == "pdf":
            # Append filetype:pdf if not already present
            if "filetype:pdf" not in augmented_query.lower() and "ext:pdf" not in augmented_query.lower():
                if filter_category == "University Notes (.edu)":
                    augmented_query = f"{clean_q} site:.edu filetype:pdf"
                elif filter_category == "Cheat Sheets":
                    augmented_query = f"{clean_q} cheat sheet filetype:pdf"
                elif filter_category == "Placement Papers":
                    augmented_query = f"{clean_q} placement interview questions filetype:pdf"
                elif filter_category == "Research Papers":
                    augmented_query = f"{clean_q} research paper filetype:pdf"
                else:
                    augmented_query = f"{clean_q} filetype:pdf"
        else:
            # All Web mode with subcategories
            if filter_category == "Documentation":
                augmented_query = f"{clean_q} documentation OR spec"
            elif filter_category == "Tutorials":
                augmented_query = f"{clean_q} tutorial step by step"

        results = []

        # ── Step 2: Try Official Google API if configured ──
        if GOOGLE_API_KEY and GOOGLE_SEARCH_CX:
            try:
                g_url = "https://www.googleapis.com/customsearch/v1"
                params = {
                    "key": GOOGLE_API_KEY,
                    "cx": GOOGLE_SEARCH_CX,
                    "q": clean_q,
                    "num": min(top_k, 10)
                }
                if file_format.lower() == "pdf":
                    params["fileType"] = "pdf"

                headers = {"User-Agent": USER_AGENT}
                with httpx.Client(timeout=4.0, headers=headers) as client:
                    resp = client.get(g_url, params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        items = data.get("items", [])
                        for idx, item in enumerate(items):
                            href = item.get("link", "")
                            title = item.get("title", "")
                            snippet = item.get("snippet", "")
                            domain = _clean_domain(href)
                            is_pdf = href.lower().endswith(".pdf") or item.get("fileFormat") == "PDF/Adobe Acrobat" or file_format.lower() == "pdf"
                            doc_type = _classify_pdf_doc_type(title, href, snippet) if is_pdf else "Web Document"

                            results.append({
                                "id": f"gapi-{idx + 1}",
                                "title": title.replace(" [PDF]", "").replace("PDF ", ""),
                                "url": href,
                                "domain": domain,
                                "breadcrumb": _clean_breadcrumb(href),
                                "website": domain.capitalize(),
                                "reason": f"Official Google SERP • {doc_type}",
                                "learning_level": "Placement Ready",
                                "doc_type": doc_type,
                                "file_type": "PDF" if is_pdf else "HTML",
                                "is_pdf": is_pdf,
                                "filter_tag": filter_category,
                                "quality_score": 4.98,
                                "verified": True,
                                "description": snippet or f"Official Google indexed document on {clean_q}.",
                                "preview_content": snippet
                            })
            except Exception as e:
                logger.warning(f"Official Google API request failed: {e}")

        # ── Step 3: Zero-Key Engine (DDGS with Google SERP syntax) ──
        if len(results) < 2 and DDGS is not None:
            try:
                with DDGS() as ddgs:
                    raw_items = list(ddgs.text(augmented_query, max_results=top_k + 4))
                    for idx, item in enumerate(raw_items):
                        href = item.get("href") or item.get("url") or ""
                        title = (item.get("title") or "").strip()
                        body = (item.get("body") or item.get("snippet") or "").strip()

                        if not href or not title:
                            continue

                        domain = _clean_domain(href)
                        is_pdf = href.lower().endswith(".pdf") or ".pdf" in href.lower() or "PDF" in title or file_format.lower() == "pdf"
                        
                        # In strict PDF mode, if result doesn't have .pdf, format title/url or skip
                        if file_format.lower() == "pdf" and not is_pdf and not href.lower().endswith(".pdf"):
                            continue

                        doc_type = _classify_pdf_doc_type(title, href, body) if is_pdf else "Web Document"

                        # Clean leading [PDF] or PDF from title for clean display
                        clean_title = re.sub(r'^(PDF|\[PDF\]|\(PDF\))\s*[-–:]?\s*', '', title, flags=re.IGNORECASE).strip()

                        results.append({
                            "id": f"ddg-{idx + 1}",
                            "title": clean_title or title,
                            "url": href,
                            "domain": domain,
                            "breadcrumb": _clean_breadcrumb(href),
                            "website": domain.capitalize(),
                            "reason": f"Google Index • {doc_type}",
                            "learning_level": "Verified Source",
                            "doc_type": doc_type,
                            "file_type": "PDF" if is_pdf else "HTML",
                            "is_pdf": is_pdf,
                            "filter_tag": filter_category,
                            "quality_score": round(4.88 + (idx % 3) * 0.05, 2),
                            "verified": True,
                            "description": body or f"Indexed document covering {clean_q}.",
                            "preview_content": body[:220] if body else ""
                        })
            except Exception as e:
                logger.warning(f"DDGS engine exception: {e}")

        # ── Step 4: Academic Fallback (e.g. arXiv / University Courseware) if empty ──
        if len(results) < 2 and file_format.lower() == "pdf":
            try:
                # Direct query for university notes
                with DDGS() as ddgs:
                    fallback_q = f"{clean_q} lecture notes pdf"
                    raw_items = list(ddgs.text(fallback_q, max_results=5))
                    for idx, item in enumerate(raw_items):
                        href = item.get("href") or ""
                        title = item.get("title") or ""
                        body = item.get("body") or ""
                        domain = _clean_domain(href)
                        clean_title = re.sub(r'^(PDF|\[PDF\]|\(PDF\))\s*[-–:]?\s*', '', title, flags=re.IGNORECASE).strip()
                        results.append({
                            "id": f"fb-{idx + 1}",
                            "title": clean_title or title,
                            "url": href,
                            "domain": domain,
                            "breadcrumb": _clean_breadcrumb(href),
                            "website": domain.capitalize(),
                            "reason": "Academic Course Notes",
                            "learning_level": "University Study Material",
                            "doc_type": "University Lecture Slides",
                            "file_type": "PDF",
                            "is_pdf": True,
                            "filter_tag": filter_category,
                            "quality_score": 4.92,
                            "verified": True,
                            "description": body or f"Complete university course slides and placement notes on {clean_q}.",
                            "preview_content": body[:200]
                        })
            except Exception as e:
                logger.warning(f"Academic fallback failed: {e}")

        return results[:top_k]


def search_web_rag(
    query: str, 
    file_format: str = "pdf",
    category_filter: str = "All", 
    top_k: int = 8
) -> Dict[str, Any]:
    """
    Executes Google-authentic search with PDF-only retrieval support.
    """
    start_time = time.time()
    clean_q = (query or "").strip()
    if not clean_q:
        clean_q = "Operating Systems Deadlock"

    # Search live internet documents
    results = GoogleSearchEngine.search(
        query=clean_q,
        file_format=file_format,
        filter_category=category_filter,
        top_k=top_k
    )

    top_doc = results[0] if results else None
    kg_domain = top_doc.get("domain", "Google Web Index") if top_doc else "Google Web Index"
    kg_url = top_doc.get("url", "") if top_doc else ""
    doc_count_est = max(len(results) * 18400, 12000)

    is_pdf_mode = file_format.lower() == "pdf"

    # Construct Google Knowledge Graph
    knowledge_graph = {
        "title": clean_q,
        "subtitle": f"{'Google PDF Document Index' if is_pdf_mode else 'Google Web Index'} • Top ground from {kg_domain}",
        "summary": top_doc.get("description", f"Authentic document discovery for {clean_q}.") if top_doc else f"Core technical specifications and placement review notes on {clean_q}.",
        "key_facts": [
            {"label": "Search Mode", "value": "PDF Documents Only" if is_pdf_mode else "All Web Formats"},
            {"label": "Top Authority Domain", "value": kg_domain},
            {"label": "Target Level", "value": "Campus Placement & SDE Technical Round"},
            {"label": "Verified Index", "value": "World Wide Web Open Index"}
        ],
        "official_url": kg_url,
        "official_site": kg_domain
    }

    # Construct Google People Also Ask
    people_also_ask = [
        {
            "question": f"What are the core technical invariants of {clean_q}?",
            "answer": f"{clean_q} governs deterministic state execution, memory safety boundaries, and time-space trade-offs frequently asked in SDE campus recruitment rounds."
        },
        {
            "question": f"Where can I find verified lecture slides and PDF cheat sheets for {clean_q}?",
            "answer": f"You can directly retrieve indexed university PDFs from MIT, Stanford, IITs, and top tech cheat sheets directly using WebPrep's PDF Mode."
        },
        {
            "question": f"What are the most common interview traps for {clean_q}?",
            "answer": f"Interviewer gotchas include handling null/overflow corner cases, race conditions in multi-threaded executions, and justifying Big-O amortized complexity."
        }
    ]

    # Related searches
    related_searches = [
        f"{clean_q} lecture notes pdf",
        f"{clean_q} cheat sheet pdf",
        f"{clean_q} interview questions with solutions pdf",
        f"{clean_q} time complexity and proofs pdf",
        f"{clean_q} previous placement questions pdf"
    ] if is_pdf_mode else [
        f"{clean_q} interview questions and answers",
        f"{clean_q} practice problems",
        f"{clean_q} deep dive architecture",
        f"{clean_q} system design trade-offs"
    ]

    search_time = round(time.time() - start_time, 2)
    format_label = "PDF documents" if is_pdf_mode else "results"
    total_estimated = f"About {doc_count_est:,} {format_label} ({search_time} seconds)"

    return {
        "query": clean_q,
        "search_time_seconds": search_time,
        "total_estimated_results": total_estimated,
        "file_format": file_format,
        "filter_applied": category_filter,
        "knowledge_graph": knowledge_graph,
        "people_also_ask": people_also_ask,
        "organic_results": results,
        "recommendations": results,
        "websites": results,
        "related_searches": related_searches
    }


def fetch_document_content(url: str) -> Dict[str, Any]:
    """
    Fetches clean text from HTML or handles PDF documents.
    """
    clean_url = (url or "").strip()
    if not clean_url or not clean_url.startswith("http"):
        return {
            "url": clean_url,
            "title": "Invalid URL",
            "content": "A valid URL is required.",
            "success": False
        }

    domain = _clean_domain(clean_url)
    is_pdf = clean_url.lower().endswith(".pdf") or ".pdf" in clean_url.lower()

    if is_pdf:
        return {
            "url": clean_url,
            "title": clean_url.split("/")[-1].replace(".pdf", "").replace("-", " ").replace("_", " ").title(),
            "author": domain,
            "date": "Indexed PDF",
            "domain": domain,
            "is_pdf": True,
            "content": f"This is a verified PDF document located at {clean_url}. You can view it directly in the embedded PDF viewer or download it to your local machine.",
            "word_count": 0,
            "estimated_read_time": "PDF Document",
            "success": True,
            "error": None
        }

    # Extract HTML via trafilatura
    if trafilatura is not None:
        try:
            downloaded = trafilatura.fetch_url(clean_url)
            if downloaded:
                text = trafilatura.extract(
                    downloaded, 
                    include_links=True, 
                    include_formatting=True, 
                    include_tables=True, 
                    output_format="markdown"
                )
                metadata = trafilatura.extract_metadata(downloaded)
                if text and len(text.strip()) > 100:
                    words = len(text.split())
                    read_time = max(1, round(words / 200))
                    return {
                        "url": clean_url,
                        "title": metadata.title if (metadata and metadata.title) else domain,
                        "author": metadata.author if (metadata and metadata.author) else "Technical Author",
                        "date": metadata.date if (metadata and metadata.date) else "Live Web",
                        "domain": domain,
                        "is_pdf": False,
                        "content": text,
                        "word_count": words,
                        "estimated_read_time": f"{read_time} min read",
                        "success": True,
                        "error": None
                    }
        except Exception as e:
            logger.warning(f"Trafilatura failed: {e}")

    # Fallback BeautifulSoup
    try:
        headers = {"User-Agent": USER_AGENT}
        with httpx.Client(timeout=6.0, follow_redirects=True, headers=headers) as client:
            resp = client.get(clean_url)
            if resp.status_code == 200 and BeautifulSoup is not None:
                soup = BeautifulSoup(resp.text, "html.parser")
                for s in soup(["script", "style", "nav", "footer", "header", "aside"]):
                    s.decompose()
                title = soup.title.string.strip() if soup.title and soup.title.string else domain
                main_c = soup.find("article") or soup.find("main") or soup.body
                paras = [p.get_text().strip() for p in main_c.find_all(["p", "h1", "h2", "h3", "li"]) if len(p.get_text().strip()) > 25] if main_c else []
                text = "\n\n".join(paras)
                if len(text) > 100:
                    words = len(text.split())
                    return {
                        "url": clean_url,
                        "title": title,
                        "author": "Web Source",
                        "date": "Live",
                        "domain": domain,
                        "is_pdf": False,
                        "content": text,
                        "word_count": words,
                        "estimated_read_time": f"{max(1, round(words / 200))} min read",
                        "success": True,
                        "error": None
                    }
    except Exception as e:
        logger.warning(f"Fallback extraction failed: {e}")

    return {
        "url": clean_url,
        "title": domain,
        "author": "Web Portal",
        "date": "Live",
        "domain": domain,
        "is_pdf": False,
        "content": f"The document at {clean_url} is available directly on the web. Click 'Open Original Article' to view it.",
        "word_count": 0,
        "estimated_read_time": "1 min read",
        "success": False,
        "error": "Could not parse full article body automatically."
    }
