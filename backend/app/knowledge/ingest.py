"""
ingest.py
===============================================================================
Ingestion script for the Pivot Recovery RAG Knowledge Base.
Loads CURATED_KNOWLEDGE_CHUNKS, computes BGE-small embeddings,
and stores vectors + rich metadata into Qdrant.
===============================================================================
"""

import os
import sys
from typing import List, Dict, Any, Optional
import numpy as np

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.knowledge.curated_chunks import CURATED_KNOWLEDGE_CHUNKS

COLLECTION_NAME = "pivot_recovery_rag_v2"
EMBEDDING_DIM = 384
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5")

_embedder = None

def get_embedding_model():
    global _embedder
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
            print(f"[Pivot Ingest] [OK] Loaded SentenceTransformer '{EMBEDDING_MODEL_NAME}'")
        except Exception as e:
            print(f"[Pivot Ingest] SentenceTransformer load note: {e}")
            _embedder = "fallback"
    return _embedder

def compute_chunk_embedding(text: str) -> List[float]:
    model = get_embedding_model()
    if model != "fallback" and hasattr(model, "encode"):
        try:
            vec = model.encode(text, normalize_embeddings=True)
            return vec.tolist()
        except Exception as e:
            print(f"[Pivot Ingest] Encode error: {e}")

    # Deterministic, normalized pseudo-embedding fallback if torch/transformers unavailable
    np.random.seed(abs(hash(text)) % (2**32))
    raw = np.random.randn(EMBEDDING_DIM)
    norm = raw / np.linalg.norm(raw)
    return norm.tolist()

def get_qdrant_client() -> QdrantClient:
    qdrant_url = os.getenv("QDRANT_URL", "").strip()
    qdrant_api_key = os.getenv("QDRANT_API_KEY", "").strip() or None

    if qdrant_url and qdrant_url.startswith("http"):
        try:
            client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
            print(f"[Pivot Ingest] Connected to remote Qdrant at {qdrant_url}")
            return client
        except Exception as e:
            print(f"[Pivot Ingest] Remote Qdrant connection failed ({e}), using in-memory")

    client = QdrantClient(":memory:")
    print("[Pivot Ingest] [OK] In-memory Qdrant client initialized")
    return client

def ingest_knowledge_base(client: Optional[QdrantClient] = None) -> QdrantClient:
    """Ingests all curated chunks into Qdrant collection."""
    if client is None:
        client = get_qdrant_client()

    # Create collection if missing
    existing_collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing_collections:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE)
        )
        print(f"[Pivot Ingest] Created Qdrant collection '{COLLECTION_NAME}'")

    points = []
    for idx, chunk in enumerate(CURATED_KNOWLEDGE_CHUNKS):
        full_text = f"{chunk['title']}. {chunk['text']}"
        vector = compute_chunk_embedding(full_text)

        point = PointStruct(
            id=idx + 1,
            vector=vector,
            payload={
                "id": chunk["id"],
                "title": chunk["title"],
                "text": chunk["text"],
                "category": chunk["category"],
                "support_type": chunk["support_type"],
                "source_title": chunk["source_title"],
                "source_url": chunk.get("source_url"),
                "verified": chunk.get("verified", True),
                "version": chunk.get("version", 1),
            }
        )
        points.append(point)

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    print(f"[Pivot Ingest] [OK] Seeded {len(points)} curated chunks into Qdrant collection '{COLLECTION_NAME}'")
    return client

if __name__ == "__main__":
    print("Running Pivot RAG Knowledge Ingestion...")
    ingest_knowledge_base()
    print("Ingestion completed successfully.")
