import React, { useState, useEffect, useRef } from 'react';
import {
  Search, RefreshCw, X, Globe, ExternalLink,
  FileText, Check, Copy, ArrowLeft, Download,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';

/**
 * WebPrep 2.0 – Academic Document Search Engine
 * - Keyword-based internet-wide search (no hardcoded sites)
 * - PDF-Only mode or All-Web mode
 * - Autocomplete typeahead
 * - Embedded PDF viewer
 * - Themed with site CSS variables (Fraunces / Manrope)
 */
export default function WebPrep({ onBackToHub, onSwitchToVideo, onSwitchToPdf }) {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('pdf');
  const [activeFilter, setActiveFilter] = useState('All PDFs');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [activePAAIndex, setActivePAAIndex] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestDebounceTimer = useRef(null);
  const searchContainerRef = useRef(null);

  const [activeViewerDoc, setActiveViewerDoc] = useState(null);

  const pdfFilters = ['All PDFs', 'University Notes (.edu)', 'Cheat Sheets', 'Placement Papers', 'Research Papers'];
  const webFilters = ['All Web', 'Documentation', 'Tutorials', 'Interview Q&A', 'Code & Repos'];
  const currentFilters = searchMode === 'pdf' ? pdfFilters : webFilters;

  const sampleTopics = [
    'Operating Systems Deadlock',
    'DBMS Normalization',
    'Binary Search Tree',
    'SQL Queries Cheat Sheet',
    'Computer Networks TCP IP',
    'Dynamic Programming',
    'Java OOP Concepts',
    'System Design Basics',
  ];

  const handleCopyUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

const getOfflineFallback = (q, mode) => {
  const clean = (q || 'Placement Notes').trim();
  return {
    query: clean,
    searchTime: '0.12',
    totalEstimated: `Curated Academic & Placement Sheets for "${clean}"`,
    fileFormat: mode,
    knowledgeGraph: {
      title: clean.toUpperCase(),
      subtitle: 'Placement Topic & Interview Subject',
      description: `Comprehensive revision notes, common interview patterns, algorithm complexities, and cheat sheets for ${clean}.`,
      category: 'Technical Placement Preparation',
      key_facts: [
        { label: 'Domain', value: 'Technical Placement & DSA' },
        { label: 'Recommended Prep', value: 'Core concepts + 10 practice problems' },
        { label: 'Frequently Tested By', value: 'Google, Amazon, Microsoft, TCS, Infosys' },
      ],
      source_name: 'NeuroPrep Placement Vault',
    },
    peopleAlsoAsk: [
      { question: `What are the core fundamentals of ${clean} asked in interviews?`, answer: `Focus on baseline definitions, time/space complexity, common trade-offs, and practical implementations commonly probed during technical rounds.` },
      { question: `Which companies frequently ask questions on ${clean}?`, answer: `Both product-based companies (Google, Microsoft, Amazon) and service-based companies (TCS Digital, Cognizant, Accenture) test this in coding and technical rounds.` },
      { question: `Where can I find free PDF cheat sheets and notes for ${clean}?`, answer: `Curated university lecture notes (MIT OCW, Stanford), GeeksforGeeks placement archives, and community sheets provide high-yield preparation PDFs.` }
    ],
    organicResults: [
      {
        title: `${clean} Complete Placement Notes & Cheat Sheet (PDF)`,
        url: `https://web.stanford.edu/class/archive/cs/cs106b/`,
        snippet: `Comprehensive study notes and quick-revision cheat sheet for ${clean}. Covers core fundamentals, complexity tables, implementation patterns, and common interview pitfalls.`,
        domain: 'stanford.edu',
        is_pdf: true,
        file_format: 'PDF',
        file_size_label: '2.4 MB',
        page_count_label: '36 pages',
        category: 'Lecture Notes',
        author: 'Stanford Computer Science',
        date: '2025 Edition'
      },
      {
        title: `${clean} Solved Interview Questions & Problem Sheet (PDF)`,
        url: `https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/`,
        snippet: `Curated collection of 50+ campus placement problems on ${clean} with step-by-step solutions, optimal Big-O analysis, and pseudo-code implementations.`,
        domain: 'ocw.mit.edu',
        is_pdf: true,
        file_format: 'PDF',
        file_size_label: '3.1 MB',
        page_count_label: '48 pages',
        category: 'Placement Notes',
        author: 'MIT OpenCourseWare',
        date: '2024'
      },
      {
        title: `Top 30 ${clean} Technical Interview Concepts & Formulas`,
        url: `https://www.geeksforgeeks.org/`,
        snippet: `Detailed tutorial and formula reference for ${clean}. Frequently asked by top tech employers and service-based placement drives.`,
        domain: 'geeksforgeeks.org',
        is_pdf: mode === 'pdf',
        file_format: mode === 'pdf' ? 'PDF' : 'Web',
        file_size_label: mode === 'pdf' ? '1.2 MB' : null,
        page_count_label: mode === 'pdf' ? '18 pages' : null,
        category: 'Cheat Sheet',
        author: 'Placement Engineering Cell',
        date: 'Updated 2025'
      },
      {
        title: `${clean} Research Overview & Advanced Implementations (PDF)`,
        url: `https://arxiv.org/`,
        snippet: `In-depth theoretical and architectural breakdown of ${clean} with mathematical proofs, performance benchmarks, and industry applications.`,
        domain: 'arxiv.org',
        is_pdf: true,
        file_format: 'PDF',
        file_size_label: '1.9 MB',
        page_count_label: '22 pages',
        category: 'Research Paper',
        author: 'ArXiv Open Archive',
        date: '2024'
      }
    ],
    relatedSearches: [
      `${clean} interview questions`,
      `${clean} cheat sheet pdf`,
      `${clean} campus placement notes`,
      `${clean} time and space complexity`,
      `${clean} practice problems leetcode`
    ]
  };
};

  // Autocomplete typeahead
  useEffect(() => {
    if (suggestDebounceTimer.current) clearTimeout(suggestDebounceTimer.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestDebounceTimer.current = setTimeout(async () => {
      try {
        const endpoints = [
          `/api/rag/suggest?q=${encodeURIComponent(query.trim())}`,
          `http://127.0.0.1:8000/api/rag/suggest?q=${encodeURIComponent(query.trim())}`,
          ...(API_BASE ? [`${API_BASE}/api/rag/suggest?q=${encodeURIComponent(query.trim())}`] : [])
        ];
        let found = false;
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep);
            if (res.ok) {
              const data = await res.json();
              if (data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions.slice(0, 6));
                setShowSuggestions(true);
                found = true;
                break;
              }
            }
          } catch {}
        }
        if (!found) {
          const localMatches = sampleTopics.filter(t => t.toLowerCase().includes(query.toLowerCase().trim()));
          if (localMatches.length > 0) {
            setSuggestions(localMatches.slice(0, 5));
            setShowSuggestions(true);
          }
        }
      } catch (err) {
        console.warn('Autocomplete fetch error:', err);
      }
    }, 220);
    return () => clearTimeout(suggestDebounceTimer.current);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Main search
  const performSearch = async (targetQuery, mode = searchMode, filter = activeFilter) => {
    const cleanQ = (targetQuery || '').trim();
    if (!cleanQ) return;

    setIsSearching(true);
    setShowSuggestions(false);
    setActivePAAIndex(null);
    setSearchError(null);
    setSearchResult(null);

    try {
      const endpoints = [
        '/api/rag/search-web',
        'http://127.0.0.1:8000/api/rag/search-web',
        ...(API_BASE && API_BASE !== 'http://localhost:8000' && API_BASE !== 'http://127.0.0.1:8000' ? [`${API_BASE}/api/rag/search-web`] : [])
      ];

      let lastError = null;
      let data = null;

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: cleanQ, file_format: mode, category_filter: filter, top_k: 10 }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            data = await res.json();
            break;
          } else {
            lastError = `Server returned ${res.status}`;
          }
        } catch (fetchErr) {
          lastError = fetchErr.message;
        }
      }

      if (!data) {
        throw new Error(lastError || 'Server connection failed');
      }

      const results = data.organic_results || [];

      setSearchResult({
        query: cleanQ,
        searchTime: data.search_time_seconds || '0.34',
        totalEstimated: data.total_estimated_results || `About ${results.length * 14000} results`,
        fileFormat: data.file_format || mode,
        knowledgeGraph: data.knowledge_graph,
        peopleAlsoAsk: data.people_also_ask || [],
        organicResults: results,
        relatedSearches: data.related_searches || [],
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setSearchError('Search timed out. The backend server might be starting up — please retry.');
      } else {
        setSearchError(`Search failed: ${err.message}.`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const items = searchResult?.organicResults || [];

  return (
    <div style={{ flex: 1, padding: '24px 20px', maxWidth: '1150px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-body)' }}>

      {/* ── Header Card ───────────────────────────────────────────────────── */}
      <div className="saas-card-spec" style={{ padding: '22px 26px', marginBottom: '20px', borderRadius: '16px' }}>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {onBackToHub && (
              <button
                onClick={onBackToHub}
                className="btn-back-dashboard"
                style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--btn-sage)', color: 'var(--btn-text)', border: 'none', cursor: 'pointer' }}
              >
                <ArrowLeft size={14} /> Hub
              </button>
            )}

            {/* Brand title — no Google logo */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--main-heading)', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                WebPrep
              </span>
              <span className="pill-tag" style={{ backgroundColor: 'var(--primary-tint)', color: 'var(--btn-sage)', fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px' }}>
                {searchMode === 'pdf' ? 'PDF Search' : 'Web Search'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onSwitchToVideo && (
              <button onClick={onSwitchToVideo} className="btn-primary-spec" style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--btn-sage)', color: 'var(--btn-text)' }}>
                VideoPrep
              </button>
            )}
            {onSwitchToPdf && (
              <button onClick={onSwitchToPdf} className="btn-primary-spec" style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--btn-sage)', color: 'var(--btn-text)' }}>
                PDFPrep
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setSearchMode('pdf'); setActiveFilter('All PDFs'); if (query.trim()) performSearch(query, 'pdf', 'All PDFs'); }}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800,
              border: searchMode === 'pdf' ? '1.5px solid var(--accent-terracotta)' : '1px solid var(--border-color)',
              backgroundColor: searchMode === 'pdf' ? '#FEF2F2' : 'transparent',
              color: searchMode === 'pdf' ? 'var(--accent-terracotta)' : 'var(--body-text)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease'
            }}
          >
            <FileText size={14} /> PDF Documents Only
          </button>

          <button
            onClick={() => { setSearchMode('all'); setActiveFilter('All Web'); if (query.trim()) performSearch(query, 'all', 'All Web'); }}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800,
              border: searchMode === 'all' ? '1.5px solid var(--btn-sage)' : '1px solid var(--border-color)',
              backgroundColor: searchMode === 'all' ? 'var(--primary-tint)' : 'transparent',
              color: searchMode === 'all' ? 'var(--btn-sage)' : 'var(--body-text)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease'
            }}
          >
            <Globe size={14} /> All Web Documents
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }} ref={searchContainerRef}>
          <div style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: 'var(--bg-input)', borderRadius: '26px',
            border: '1.5px solid var(--border-input)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            padding: '0 18px', height: '52px'
          }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch(query, searchMode, activeFilter)}
              placeholder={searchMode === 'pdf' ? 'Search PDF documents (e.g. Operating Systems Deadlock, DBMS Normalization)...' : 'Search any topic across the live web...'}
              style={{ width: '100%', height: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.96rem', color: 'var(--main-heading)', fontFamily: 'var(--font-body)' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSearchResult(null); setSearchError(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', marginRight: '6px' }} title="Clear">
                <X size={18} />
              </button>
            )}
            <button
              onClick={() => performSearch(query, searchMode, activeFilter)}
              disabled={!query.trim() || isSearching}
              style={{
                backgroundColor: 'var(--btn-sage)', color: 'var(--btn-text)', border: 'none',
                borderRadius: '20px', padding: '8px 20px', fontSize: '0.86rem', fontWeight: 700,
                cursor: query.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center',
                gap: '6px', opacity: query.trim() ? 1 : 0.6, flexShrink: 0,
                fontFamily: 'var(--font-body)', transition: 'all 0.15s ease'
              }}
            >
              {isSearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '56px', left: 0, right: 0,
              backgroundColor: 'var(--bg-card-solid)', borderRadius: '14px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden'
            }}>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => { setQuery(item); setShowSuggestions(false); performSearch(item, searchMode, activeFilter); }}
                  style={{
                    padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', fontSize: '0.9rem', color: 'var(--main-heading)',
                    borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border-color)',
                    transition: 'background-color 0.1s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-tint)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Search size={15} color="var(--text-muted)" />
                  <span>{item}</span>
                  {searchMode === 'pdf' && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--accent-terracotta)', fontWeight: 700 }}>[PDF]</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        {currentFilters.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveFilter(tab); if (query.trim()) performSearch(query, searchMode, tab); }}
            style={{
              padding: '6px 14px', fontSize: '0.82rem', fontWeight: activeFilter === tab ? 700 : 500,
              borderRadius: '18px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              backgroundColor: activeFilter === tab ? 'var(--btn-sage)' : 'var(--primary-tint)',
              color: activeFilter === tab ? 'var(--btn-text)' : 'var(--body-text)',
              transition: 'all 0.15s ease', fontFamily: 'var(--font-body)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Search Stats ──────────────────────────────────────────────────── */}
      {searchResult && (
        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px', paddingLeft: '4px' }}>
          {searchResult.totalEstimated}
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {isSearching && (
        <div className="saas-card-spec" style={{ padding: '48px', textAlign: 'center', marginBottom: '24px', borderRadius: '16px' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px auto', color: 'var(--btn-sage)' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
            Searching the live internet…
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--body-text)', margin: '6px 0 0 0' }}>
            {searchMode === 'pdf'
              ? 'Retrieving PDF documents from universities, course repositories, and cheat sheet archives.'
              : 'Scanning documentation portals, tutorials, and technical resources.'}
          </p>
        </div>
      )}

      {/* ── Error State ───────────────────────────────────────────────────── */}
      {searchError && !isSearching && (
        <div className="saas-card-spec" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '24px', borderRadius: '16px', border: '1.5px solid var(--accent-terracotta)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-terracotta)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
            Backend Server Unreachable
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--body-text)', maxWidth: '540px', margin: '0 auto 12px auto', lineHeight: 1.5 }}>
            Live search requires the Python FastAPI backend server running on port 8000 ({searchError}).
          </p>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--primary-tint)', padding: '7px 16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.84rem', color: 'var(--main-heading)', marginBottom: '16px' }}>
            cd backend &nbsp;;&nbsp; python run_server.py
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => performSearch(query, searchMode, activeFilter)}
              style={{ padding: '8px 20px', backgroundColor: 'var(--btn-sage)', color: 'var(--btn-text)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.86rem' }}
            >
              Retry Live Search
            </button>
            <button
              onClick={() => {
                setSearchError(null);
                setSearchResult(getOfflineFallback(query || 'Placement Notes', searchMode));
              }}
              style={{ padding: '8px 20px', backgroundColor: 'transparent', color: 'var(--btn-sage)', border: '1.5px solid var(--btn-sage)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.86rem' }}
            >
              Load Curated Placement Notes
            </button>
          </div>
        </div>
      )}

      {/* ── Empty State (no search yet) ───────────────────────────────────── */}
      {!searchResult && !isSearching && !searchError && (
        <div className="saas-card-spec" style={{ padding: '52px 24px', textAlign: 'center', marginBottom: '28px', borderRadius: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto', color: 'var(--btn-sage)' }}>
            <FileText size={30} />
          </div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--main-heading)', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>
            Academic Document Search
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--body-text)', margin: '0 auto 26px auto', maxWidth: '580px', lineHeight: 1.6 }}>
            Type any topic to retrieve real documents — lecture notes, cheat sheets, placement papers, and research PDFs — sourced live from across the internet.
          </p>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Popular Placement Topics
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {sampleTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => { setQuery(topic); performSearch(topic, searchMode, activeFilter); }}
                style={{
                  backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-color)',
                  borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--body-text)', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-tint)'; e.currentTarget.style.color = 'var(--btn-sage)'; e.currentTarget.style.borderColor = 'var(--btn-sage)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-solid)'; e.currentTarget.style.color = 'var(--body-text)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                {searchMode === 'pdf' && <span style={{ color: 'var(--accent-terracotta)', fontWeight: 800, fontSize: '0.72rem' }}>[PDF]</span>}
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── No Results Found ──────────────────────────────────────────────── */}
      {!isSearching && searchResult && items.length === 0 && (
        <div className="saas-card-spec" style={{ padding: '40px 24px', textAlign: 'center', marginBottom: '24px', borderRadius: '16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>🔍</div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--main-heading)', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>
            No {searchMode === 'pdf' ? 'PDF documents' : 'results'} found for "{searchResult.query}"
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--body-text)', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
            {searchMode === 'pdf'
              ? 'Try switching to "All Web" mode, or use broader keywords (e.g. "binary search" instead of a long phrase).'
              : 'Try different keywords or check the backend is running.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {searchMode === 'pdf' && (
              <button
                onClick={() => { setSearchMode('all'); setActiveFilter('All Web'); performSearch(query, 'all', 'All Web'); }}
                style={{ padding: '8px 18px', backgroundColor: 'var(--btn-sage)', color: 'var(--btn-text)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.86rem' }}
              >
                Try All Web Mode
              </button>
            )}
            <button
              onClick={() => { setQuery(''); setSearchResult(null); }}
              style={{ padding: '8px 18px', backgroundColor: 'transparent', color: 'var(--body-text)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.86rem' }}
            >
              Clear & Search Again
            </button>
          </div>
        </div>
      )}

      {/* ── Results Layout ────────────────────────────────────────────────── */}
      {!isSearching && searchResult && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: searchResult.knowledgeGraph ? '1fr 320px' : '1fr', gap: '28px', alignItems: 'start' }}>

          {/* Left Column: Organic Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {items.map((doc, idx) => (
              <div key={doc.id || `doc-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                {/* Breadcrumb row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: doc.is_pdf ? '#FEF2F2' : 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: doc.is_pdf ? 'var(--accent-terracotta)' : 'var(--btn-sage)', flexShrink: 0 }}>
                    {doc.is_pdf ? <FileText size={13} /> : <Globe size={13} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--main-heading)' }}>{doc.domain}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{doc.breadcrumb || doc.url}</span>
                  </div>
                  {doc.doc_type && (
                    <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--primary-tint)', color: 'var(--btn-sage)', padding: '2px 8px', borderRadius: '6px' }}>
                      {doc.doc_type}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ margin: '4px 0 2px 0', fontSize: '1.15rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                  {doc.is_pdf && (
                    <span style={{ display: 'inline-block', backgroundColor: 'var(--accent-terracotta)', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', marginRight: '8px', verticalAlign: 'middle', letterSpacing: '0.5px' }}>
                      PDF
                    </span>
                  )}
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--btn-sage)', textDecoration: 'none', lineHeight: 1.35 }}
                    onMouseOver={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseOut={(e) => { e.currentTarget.style.textDecoration = 'none'; }}>
                    {doc.title}
                  </a>
                </h2>

                {/* Snippet */}
                <p style={{ margin: '4px 0 10px 0', fontSize: '0.88rem', color: 'var(--body-text)', lineHeight: 1.58 }}>
                  {doc.description}
                </p>

                {/* Action Toolbar */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveViewerDoc(doc)}
                    style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, borderRadius: '6px', backgroundColor: 'var(--primary-tint)', border: '1px solid var(--border-color)', color: 'var(--btn-sage)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease', fontFamily: 'var(--font-body)' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-sage)'; e.currentTarget.style.color = 'var(--btn-text)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-tint)'; e.currentTarget.style.color = 'var(--btn-sage)'; }}
                  >
                    <Eye size={13} /> {doc.is_pdf ? 'Open PDF Viewer' : 'Read Article'}
                  </button>

                  {doc.is_pdf && (
                    <a href={doc.url} download target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, borderRadius: '6px', backgroundColor: '#FEF2F2', border: '1px solid var(--accent-terracotta)', color: 'var(--accent-terracotta)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={13} /> Download PDF
                    </a>
                  )}

                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.15s' }}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--btn-sage)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <ExternalLink size={12} /> Source
                  </a>

                  <button
                    onClick={() => handleCopyUrl(doc.url)}
                    style={{ padding: '6px 10px', fontSize: '0.76rem', fontWeight: 600, borderRadius: '6px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Copy URL"
                  >
                    {copiedUrl === doc.url ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    {copiedUrl === doc.url ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}

            {/* People Also Ask */}
            {searchResult.peopleAlsoAsk && searchResult.peopleAlsoAsk.length > 0 && (
              <div className="saas-card-spec" style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ padding: '14px 20px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--main-heading)', backgroundColor: 'var(--primary-tint)', borderBottom: '1px solid var(--border-color)', fontFamily: 'var(--font-heading)' }}>
                  People Also Ask
                </div>
                {searchResult.peopleAlsoAsk.map((paa, idx) => (
                  <div key={idx} style={{ borderBottom: idx === searchResult.peopleAlsoAsk.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setActivePAAIndex(activePAAIndex === idx ? null : idx)}
                      style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', fontWeight: 600, color: 'var(--main-heading)', fontFamily: 'var(--font-body)' }}
                    >
                      <span>{paa.question}</span>
                      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        {activePAAIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>
                    {activePAAIndex === idx && (
                      <div style={{ padding: '12px 20px 16px 20px', fontSize: '0.88rem', color: 'var(--body-text)', lineHeight: 1.6, backgroundColor: 'var(--bg-card-solid)' }}>
                        {paa.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Related Searches */}
            {searchResult.relatedSearches && searchResult.relatedSearches.length > 0 && (
              <div style={{ marginTop: '16px', padding: '18px 0' }}>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--main-heading)', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
                  Related Searches
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {searchResult.relatedSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setQuery(term); performSearch(term, searchMode, activeFilter); }}
                      style={{ padding: '10px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card-solid)', color: 'var(--body-text)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', transition: 'all 0.15s ease', fontFamily: 'var(--font-body)' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-tint)'; e.currentTarget.style.color = 'var(--btn-sage)'; e.currentTarget.style.borderColor = 'var(--btn-sage)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-solid)'; e.currentTarget.style.color = 'var(--body-text)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    >
                      <Search size={13} color="var(--text-muted)" /> {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Knowledge Panel */}
          {searchResult.knowledgeGraph && (
            <div className="saas-card-spec" style={{ padding: '20px', borderRadius: '14px', position: 'sticky', top: '20px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--btn-sage)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Topic Overview
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>
                {searchResult.knowledgeGraph.title}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {searchResult.knowledgeGraph.subtitle}
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--body-text)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                {searchResult.knowledgeGraph.summary}
              </p>
              {searchResult.knowledgeGraph.key_facts && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResult.knowledgeGraph.key_facts.map((fact, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--main-heading)' }}>{fact.label}: </span>
                      <span style={{ color: 'var(--body-text)' }}>{fact.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchResult.knowledgeGraph.official_url && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <a href={searchResult.knowledgeGraph.official_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--btn-sage)', textDecoration: 'none' }}>
                    <Globe size={13} /> Primary Reference
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PDF / Document Viewer Modal ───────────────────────────────────── */}
      {activeViewerDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '1000px', height: '92vh', backgroundColor: 'var(--bg-card-solid)', borderRadius: '16px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary-tint)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: activeViewerDoc.is_pdf ? 'var(--accent-terracotta)' : 'var(--btn-sage)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  {activeViewerDoc.is_pdf ? 'PDF VIEWER' : 'ARTICLE'}
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{activeViewerDoc.title}</h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{activeViewerDoc.domain}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeViewerDoc.is_pdf && (
                  <a href={activeViewerDoc.url} download target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, borderRadius: '6px', backgroundColor: 'var(--accent-terracotta)', color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={13} /> Download PDF
                  </a>
                )}
                <a href={activeViewerDoc.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, borderRadius: '6px', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', color: 'var(--main-heading)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ExternalLink size={13} /> Open Tab
                </a>
                <button onClick={() => setActiveViewerDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }} title="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, backgroundColor: '#525659', position: 'relative' }}>
              {activeViewerDoc.is_pdf ? (
                <iframe src={activeViewerDoc.url} title={activeViewerDoc.title} style={{ width: '100%', height: '100%', border: 'none' }} />
              ) : (
                <div style={{ padding: '30px', backgroundColor: 'var(--bg-card-solid)', height: '100%', overflowY: 'auto', lineHeight: 1.7, color: 'var(--body-text)', fontFamily: 'var(--font-body)' }}>
                  <p style={{ fontSize: '0.94rem' }}>{activeViewerDoc.description}</p>
                  <div style={{ marginTop: '20px' }}>
                    <a href={activeViewerDoc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--btn-sage)', fontWeight: 700 }}>
                      Visit the full article on {activeViewerDoc.domain} →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 20px', backgroundColor: 'var(--primary-tint)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <span>💡 Tip: If inline embedding is blocked, click <strong>Download PDF</strong> or <strong>Open Tab</strong> to view directly.</span>
              <button onClick={() => setActiveViewerDoc(null)} style={{ border: 'none', backgroundColor: 'transparent', color: 'var(--btn-sage)', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
