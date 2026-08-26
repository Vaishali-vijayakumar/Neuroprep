#!/usr/bin/env python3
"""
Neroprep AI Interview Engine — Backend Startup Script
Run: python run_server.py
"""
import sys
import os

# Add backend to Python path
sys.path.insert(0, os.path.dirname(__file__))

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("  Neroprep AI Interview Engine v2.0")
    print("  Powered by Gemini 2.0 Flash + FastAPI")
    print("=" * 60)
    print()
    print("  API Docs:  http://localhost:8000/docs")
    print("  Health:    http://localhost:8000/api/health")
    print("  WebSocket: ws://localhost:8000/ws/{session_id}")
    print()

    # Check for Gemini API key
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
    key = os.getenv("GEMINI_API_KEY", "")
    if not key or key == "your_gemini_api_key_here":
        print("  [WARNING] GEMINI_API_KEY not set in backend/.env")
        print("  AI responses will use fallback mode (local question bank).")
        print("  Get a free key: https://aistudio.google.com/")
    else:
        print(f"  [OK] Gemini API key configured ({key[:8]}...)")
    print()

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
