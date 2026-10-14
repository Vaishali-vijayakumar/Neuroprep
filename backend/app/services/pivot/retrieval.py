"""
retrieval.py
===============================================================================
RAG Retrieval Service for Pivot.
Embeds student queries with BGE-small, retrieves candidate chunks from Qdrant,
applies category filtering and precision reranking, returning grounded evidence.
===============================================================================
"""

import os
import re
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.knowledge.curated_chunks import CURATED_KNOWLEDGE_CHUNKS
from app.knowledge.ingest import (
    COLLECTION_NAME,
    get_qdrant_client,
    compute_chunk_embedding,
    ingest_knowledge_base
)

class KnowledgeRetrievalService:
    def __init__(self):
        self.client: Optional[QdrantClient] = None
        self._initialized = False

    def ensure_initialized(self):
        if not self._initialized:
            try:
                self.client = get_qdrant_client()
                # Check if collection exists and has points
                existing = [c.name for c in self.client.get_collections().collections]
                if COLLECTION_NAME not in existing or self.client.count(COLLECTION_NAME).count == 0:
                    print("[Pivot RAG] Seeding collection on initialization...")
                    ingest_knowledge_base(self.client)
                self._initialized = True
            except Exception as e:
                print(f"[Pivot RAG] Initialization note: {e}")
                self._initialized = False

    def retrieve(
        self,
        query: str,
        category: Optional[str] = None,
        confidence: float = 0.5,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant evidence chunks.
        Workflow:
          1. Vector search with BGE-small embedding in Qdrant
          2. Soft category filtering (broadens if confidence is low)
          3. Rerank candidates
          4. Returns top_k distinct chunks with rich metadata
        """
        self.ensure_initialized()
        query_clean = query.strip()
        if not query_clean:
            return []

        # Check for explicit named exercise references first (e.g. RESET-17)
        upper_query = query_clean.upper()
        if "RESET-17" in upper_query or "RESET 17" in upper_query:
            match = next((c for c in CURATED_KNOWLEDGE_CHUNKS if "reset_17" in c["id"]), None)
            if match:
                return [match]

        candidates: List[Dict[str, Any]] = []

        if self.client and self._initialized:
            try:
                query_vector = compute_chunk_embedding(query_clean)

                search_filter = None
                # Apply filter only if confidence is high (>= 0.70)
                if category and confidence >= 0.70:
                    search_filter = Filter(
                        should=[
                            FieldCondition(key="category", match=MatchValue(value=category))
                        ]
                    )

                results = self.client.query_points(
                    collection_name=COLLECTION_NAME,
                    query=query_vector,
                    query_filter=search_filter,
                    limit=top_k * 2,
                    with_payload=True
                )

                candidates = [p.payload for p in results.points if p.payload]

                # If filtered search yielded fewer than 2 results, run broad query
                if len(candidates) < 2 and search_filter is not None:
                    broad_results = self.client.query_points(
                        collection_name=COLLECTION_NAME,
                        query=query_vector,
                        limit=top_k * 2,
                        with_payload=True
                    )
                    candidates = [p.payload for p in broad_results.points if p.payload]
            except Exception as e:
                print(f"[Pivot RAG] Qdrant query note: {e}, falling back to semantic keyword search")
                candidates = []

        # Fallback to local curated chunk keyword matching if Qdrant search returned nothing
        if not candidates:
            candidates = self._keyword_search_fallback(query_clean, category)

        # Rerank and select top diverse chunks
        ranked = self._rerank(query_clean, candidates, top_k)
        return ranked

    def _rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int) -> List[Dict[str, Any]]:
        """Precision reranker scoring chunk content against query words."""
        query_words = set(re.findall(r"\w+", query.lower()))

        def score_chunk(c: Dict[str, Any]) -> int:
            content = (c.get("title", "") + " " + c.get("text", "")).lower()
            overlap = sum(1 for w in query_words if len(w) > 3 and w in content)
            return overlap

        sorted_chunks = sorted(candidates, key=score_chunk, reverse=True)

        # Deduplicate by id while maintaining top order
        seen_ids = set()
        final_list = []
        for c in sorted_chunks:
            cid = c.get("id")
            if cid not in seen_ids:
                seen_ids.add(cid)
                final_list.append(c)
                if len(final_list) >= top_k:
                    break

        return final_list

    def _keyword_search_fallback(self, query: str, category: Optional[str]) -> List[Dict[str, Any]]:
        """Transparent, deterministic keyword fallback over curated chunks."""
        query_words = set(re.findall(r"\w+", query.lower()))
        matched = []

        for chunk in CURATED_KNOWLEDGE_CHUNKS:
            text = (chunk["title"] + " " + chunk["text"]).lower()
            hits = sum(1 for w in query_words if len(w) > 3 and w in text)
            if hits > 0 or (category and chunk.get("category") == category):
                matched.append(chunk)

        if not matched:
            matched = CURATED_KNOWLEDGE_CHUNKS[:3]

        return matched

knowledge_retriever = KnowledgeRetrievalService()
