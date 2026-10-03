from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.youtube_rag_service import search_youtube_video_rag
from app.services.pdf_rag_service import search_pdf_rag
from app.services.web_rag_service import search_web_rag

router = APIRouter(tags=["Video, PDF & Web RAG Engine"])

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
    category_filter: Optional[str] = Field("All", description="Search filter category")
    top_k: Optional[int] = Field(6, description="Number of candidate web pages to retrieve")

class WebRagResponse(BaseModel):
    query: str
    search_time_seconds: Optional[float] = 0.38
    total_estimated_results: Optional[str] = ""
    filter_applied: Optional[str] = "All"
    knowledge_graph: Optional[Dict[str, Any]] = None
    people_also_ask: Optional[List[Dict[str, str]]] = []
    organic_results: Optional[List[Dict[str, Any]]] = []
    recommendations: Optional[List[Dict[str, Any]]] = []
    websites: Optional[List[Dict[str, Any]]] = []
    related_searches: Optional[List[str]] = []

@router.post("/search-video", response_model=VideoRagResponse)
async def search_video_rag(request: VideoRagRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return search_youtube_video_rag(request.query, top_k=request.top_k or 6)
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
        return search_web_rag(request.query, category_filter=request.category_filter or "All", top_k=request.top_k or 6)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Web RAG failed: {str(e)}")
