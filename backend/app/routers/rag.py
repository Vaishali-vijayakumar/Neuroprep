from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.youtube_rag_service import search_youtube_video_rag
from app.services.pdf_rag_service import search_pdf_rag
from app.services.web_rag_service import search_web_rag, fetch_document_content, fetch_google_suggestions

router = APIRouter(tags=["Video, PDF & Web RAG Engine"])

class FetchDocRequest(BaseModel):
    url: str = Field(..., description="Target document URL to retrieve and extract")

class FetchDocResponse(BaseModel):
    url: str
    title: Optional[str] = ""
    author: Optional[str] = ""
    date: Optional[str] = ""
    domain: Optional[str] = ""
    is_pdf: Optional[bool] = False
    content: Optional[str] = ""
    word_count: Optional[int] = 0
    estimated_read_time: Optional[str] = "1 min read"
    success: bool = True
    error: Optional[str] = None

class VideoRagRequest(BaseModel):
    query: str = Field(..., description="Technical topic or natural language question")
    top_k: Optional[int] = Field(6, description="Number of candidate videos to retrieve")

class VideoRagResponse(BaseModel):
    query: str
    topic_name: Optional[str] = ""
    answer: Optional[str] = ""
    video_id: Optional[str] = ""
    video_title: Optional[str] = ""
    channel: Optional[str] = ""
    views: Optional[str] = "2.4M views"
    rating: Optional[str] = "4.9/5"
    deep_link_url: Optional[str] = ""
    embed_url: Optional[str] = ""
    search_time_seconds: Optional[float] = 0.42
    total_estimated_results: Optional[str] = ""
    videos: Optional[List[Dict[str, Any]]] = []

class PdfRagRequest(BaseModel):
    query: str = Field(..., description="Technical topic or subject name for PDF retrieval")
    top_k: Optional[int] = Field(6, description="Number of candidate documents to retrieve")

class PdfRagResponse(BaseModel):
    query: str
    topic_name: Optional[str] = ""
    search_time_seconds: Optional[float] = 0.35
    total_estimated_results: Optional[str] = ""
    documents: Optional[List[Dict[str, Any]]] = []

class WebRagRequest(BaseModel):
    query: str = Field(..., description="Technical topic or natural language question for Web search")
    file_format: Optional[str] = Field("pdf", description="Target file format ('pdf' or 'all')")
    category_filter: Optional[str] = Field("All", description="Search filter category")
    top_k: Optional[int] = Field(8, description="Number of candidate documents to retrieve")

class WebRagResponse(BaseModel):
    query: str
    search_time_seconds: Optional[float] = 0.38
    total_estimated_results: Optional[str] = ""
    file_format: Optional[str] = "pdf"
    filter_applied: Optional[str] = "All"
    knowledge_graph: Optional[Dict[str, Any]] = None
    people_also_ask: Optional[List[Dict[str, str]]] = []
    organic_results: Optional[List[Dict[str, Any]]] = []
    recommendations: Optional[List[Dict[str, Any]]] = []
    websites: Optional[List[Dict[str, Any]]] = []
    related_searches: Optional[List[str]] = []

@router.get("/suggest")
async def get_google_suggestions(q: str = ""):
    """Live Google Suggest typeahead autocomplete endpoint."""
    return {"query": q, "suggestions": fetch_google_suggestions(q, limit=8)}

@router.post("/search-video", response_model=VideoRagResponse)
async def search_video_rag(request: VideoRagRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return search_youtube_video_rag(request.query, top_k=request.top_k or 6)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video RAG failed: {str(e)}")

@router.get("/search-video", response_model=VideoRagResponse)
async def search_video_rag_get(query: str = "", top_k: int = 6):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return search_youtube_video_rag(query, top_k=top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video RAG failed: {str(e)}")

@router.post("/search-pdf", response_model=PdfRagResponse)
async def search_pdf_rag_post(request: PdfRagRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return search_pdf_rag(request.query, top_k=request.top_k or 6)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF RAG failed: {str(e)}")

@router.post("/search-web", response_model=WebRagResponse)
async def search_web_rag_post(request: WebRagRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return search_web_rag(
            query=request.query,
            file_format=request.file_format or "pdf",
            category_filter=request.category_filter or "All",
            top_k=request.top_k or 8
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Web search failed: {str(e)}")

@router.get("/search-web", response_model=WebRagResponse)
async def search_web_rag_get(
    query: str = "",
    file_format: str = "pdf",
    category_filter: str = "All",
    top_k: int = 8
):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return search_web_rag(
            query=query,
            file_format=file_format,
            category_filter=category_filter,
            top_k=top_k
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Web search failed: {str(e)}")

@router.post("/fetch-document", response_model=FetchDocResponse)
async def fetch_document_post(request: FetchDocRequest):
    if not request.url or not request.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    try:
        return fetch_document_content(request.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document retrieval failed: {str(e)}")

