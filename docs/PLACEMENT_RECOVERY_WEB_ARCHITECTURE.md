# Placement Recovery Web Architecture (Vercel & Render)

## 1. System Technology Stack (Web App)

| Layer | Technology | Hosting / Environment | Role & Implementation |
| :--- | :--- | :--- | :--- |
| **Web Frontend** | **React 18 + Vite** | **Vercel** | Responsive web client with Sage/Terracotta design, 30s audio recording (Web Audio API & MediaRecorder), live mic visualizer, quick scenario chips, and local on-device history. |
| **Local Persistence** | **Browser LocalStorage / IndexedDB** | **Client Browser** | Stores vent history, recovery notes, and session logs **strictly on-device** for total student privacy. |
| **Backend API Gateway** | **FastAPI (Python 3.11+)** | **Render (Web Service)** | Asynchronous REST API with Pydantic validation, CORS headers, and multi-threaded background handlers. |
| **Speech-to-Text (STT)** | **faster-whisper (int8 CPU)** | **Render** | Low-latency audio transcription converting 30-second voice notes to text in < 400ms. |
| **Privacy Layer** | **Regex PII Stripper** | **Render & Client** | Scrubs names, roll numbers, CGPA, recruiter names, emails, and phone numbers before AI processing. |
| **Embedding Engine** | **BAAI/bge-small-en-v1.5** | **Render** | Fast 384-dimensional dense semantic vectors for interview scenarios and alumni precedents. |
| **Vector Database** | **Qdrant (In-Memory / Cloud)** | **Render / Remote Qdrant** | High-speed cosine similarity search with payload filtering by interview round and topic. |
| **Precision Reranker** | **bge-reranker Cross-Encoder** | **Render** | Selects top relevant context pieces covering perspective reframing, real hiring math, and senior bounce-back stories. |
| **Senior Companion LLM** | **Llama 3.3 70B (Groq) / Gemini Flash** | **Groq / Google GenAI** | Empathetic senior mentor persona (*Pivot*) providing warm comfort, room quota context, and doable tactical next moves. Zero clinical or technical jargon. |

---

## 2. End-to-End System Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   1. WEB CLIENT (React + Vite on Vercel)               │
│                                                                        │
│   • 30s Voice Recording with Live Mic Waveform (MediaRecorder)         │
│   • Quick Scenario Chips ("Froze on Round 2 Coding", etc.)             │
│   • On-Device Vault Log (Strictly Local Browser Storage)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST /api/vent/text or /audio
                                    │ (with 3.5s AbortController timeout)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               2. BACKEND API & INGESTION (FastAPI on Render)           │
├────────────────────────────────────────────────────────────────────────┤
│  • Voice Notes ──► faster-whisper (<400ms CPU int8 speech-to-text)     │
│  • Vent Text   ──► Regex PII Stripper (scrubs names, roll numbers)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 3. RETRIEVAL PIPELINE (Qdrant + BGE)                   │
├────────────────────────────────────────────────────────────────────────┤
│  a. BGE Embedding: Computes normalized dense vector for vent           │
│  b. Round Filter: Filters by interview stage (Round 2, OA, Final)      │
│  c. Qdrant Search: Retrieves top semantic matches                      │
│  d. Reranker: Selects balanced context pieces:                         │
│     • Empathetic Reframing (Removes self-blame & panic)                │
│     • Real Hiring Math (Room capacity vs personal incompetence)        │
│     • Senior Rebound Story (Batch precedent who landed top offer)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            4. FRIENDLY SENIOR COMPANION (Llama 3.3 / Gemini)           │
├────────────────────────────────────────────────────────────────────────┤
│  Prompt: Senior companion persona (*Pivot*) with strict zero-jargon    │
│  Output JSON:                                                          │
│   • Mindset Check: Validates feelings without self-blame               │
│   • Behind the Scenes: Real numbers (e.g. 24 students for 4 seats)     │
│   • Small Tweak: One isolated pattern to glance at calmly tomorrow     │
│   • Senior Story: Relatable alumni who bounced back in weeks           │
│   • Friendly Next Moves: Low-stress actions for tonight & tomorrow     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  5. CLIENT DELIVERY & ON-DEVICE DISPLAY                │
├────────────────────────────────────────────────────────────────────────┤
│  • React renders friendly companion response cards                     │
│  • Client sanitizer (`cleanFriendlyChat`) ensures 100% warm peer tone  │
│  • Saved to on-device vault (zero cloud storage of student thoughts)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Web Client Implementation Details

### A. Frontend Architecture
* **Component**: `src/components/PlacementMoodRecoveryRAG.jsx`
  - Audio capture using the browser's native `navigator.mediaDevices.getUserMedia`.
  - 30-second automatic timer cutoff and animated mic pulse visualizer.
  - Safe-net timeout guaranteeing that the loading state never hangs indefinitely.
  - Quick-start scenario prompts for rapid venting.
  - Local vault drawer with item deletion and persistence.
* **Service**: `src/services/placementMoodRecoveryRAG.js`
  - Uses `AbortController` (3.5s for text, 6.0s for audio) to seamlessly trigger client fallback if the Render backend is waking from sleep.
  - Offline-first deterministic recovery generator for instant responses.

### B. Deployment Setup
* **Frontend on Vercel**:
  - Connect GitHub repository to Vercel.
  - Set Build Command: `npm run build`
  - Set Output Directory: `dist`
  - Environment Variables:
    - `VITE_API_URL`: URL of your Render backend (e.g. `https://neuroprep-api.onrender.com`).
* **Backend on Render**:
  - Web Service pointing to `backend/app/main.py`.
  - Build Command: `pip install -r backend/requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Environment Variables:
    - `GROQ_API_KEY`: Groq API key for Llama 3.3 70B (optional).
    - `GEMINI_API_KEY`: Google Gemini API key.
    - `QDRANT_URL`: Remote Qdrant instance URL or left blank for in-memory mode.
