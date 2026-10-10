# Emotional Vent & Placement Recovery RAG Architecture

## 1. System Technology Stack

| Layer | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Mobile Client** | **Flutter (Dart)** | High-performance cross-platform mobile UI, responsive state management via Riverpod, and native device audio capture. |
| **Local Storage (Client)** | **SQLite / Drift** | Stores chat history, recovery notes, and emotional logs **strictly on-device** for zero-leak student privacy. |
| **Backend API Gateway** | **FastAPI (Python 3.11+)** | High-throughput asynchronous REST API with native Pydantic validation for AI schemas. |
| **Speech-to-Text** | **faster-whisper / Whisper.cpp** | Low-latency voice transcription (transcribes 30-second audio vents in < 400ms using CPU `int8` quantization). |
| **Orchestration / RAG Framework** | **Custom Service / LlamaIndex / LangChain** | Manages vector indexing, query routing, context injection, and prompt pipelines. |
| **Embedding Model** | **BAAI/bge-large-en-v1.5 / bge-small** | High semantic precision for matching emotional vents to CBT and placement data. |
| **Vector Database** | **Qdrant** | High-speed vector similarity engine with rich payload/metadata filtering (by interview stage, topic). |
| **Reranker** | **bge-reranker-large / Cross-Encoder** | Precision scoring filter to pick the top 2–3 most relevant context chunks. |
| **Core LLM (Generation)** | **Llama 3.3 70B (Groq) or Gemini 1.5/3.8 Flash** | Sub-second Time-To-First-Token (TTFT), strong clinical reasoning, zero generic platitudes. |

---

## 2. End-to-End System Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                      1. CLIENT LAYER (Flutter App)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          Student inputs text OR records 30s voice vent
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   2. API GATEWAY & INGESTION (FastAPI)                 │
├────────────────────────────────────────────────────────────────────────┤
│  • Audio input  ──► faster-whisper (converts audio to raw text)        │
│  • Text input   ──► Regex PII Stripper (scrubs names, CGPA, recruiter) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     3. RETRIEVAL PIPELINE (RAG)                        │
├────────────────────────────────────────────────────────────────────────┤
│  a. Query Embedding: bge-large-en-v1.5 vectorizes vent text            │
│  b. Metadata Filter: Extracts placement stage (e.g. "Round 2 Tech")    │
│  c. Vector Search: Queries Qdrant for top 8 semantic matches           │
│  d. Cross-Encoder Reranker: bge-reranker scores & cuts to top 3 chunks │
│                                                                        │
│     [Retrieved Chunks]:                                                │
│     • CBT Thought Framework (Deconstructs catastrophizing)             │
│     • Stage Attrition Metric (Headcount cap vs personal skill)         │
│     • Alumni Recovery Precedent (Similar topic failure & rebound)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     4. GROUNDED REASONING (LLM)                        │
├────────────────────────────────────────────────────────────────────────┤
│  Prompt Assembly: Injects [Vent Text] + [Retrieved Chunks]             │
│  Execution: Llama 3.3 70B (Groq) / Gemini 1.5/3.8 Flash (temp = 0.2)   │
│  Output: Strict JSON schema (Root Cause + Reality Check + Next Move)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  5. CLIENT DELIVERY & LOCAL PERSISTENCE                │
├────────────────────────────────────────────────────────────────────────┤
│  • Flutter renders an actionable Recovery Card (no empty platitudes)   │
│  • Output saved locally into device SQLite (nothing retained on cloud) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Execution Sequence

1. **Capture & Pre-Process**:
   - The Flutter mobile client captures either typed text or a 30s voice recording via `record`.
   - The backend passes voice audio through `faster-whisper` (int8 CPU compute) to produce raw text.
   - The `PIIStripper` regex pipeline strips identifying tokens:
     - Student names (`My name is Rahul` -> `[NAME_REDACTED]`)
     - Roll numbers (`21BCE1234` -> `[STUDENT_ID_REDACTED]`)
     - Academic scores (`8.9 CGPA` -> `[METRIC_REDACTED]`)
     - Recruiter identities (`Interviewer Mr. Sharma` -> `[RECRUITER_REDACTED]`)
     - Emails and phone numbers.

2. **Context Querying**:
   - The sanitized vent text is converted into a normalized dense embedding vector via `BAAI/bge-large-en-v1.5` / `bge-small`.
   - The backend extracts interview stage metadata (e.g. `stage == "technical_round_2"`).
   - Qdrant queries the knowledge base collection with boolean filter rules for the candidate stage.

3. **Reranking**:
   - The top candidate vector search results pass through the cross-encoder reranker.
   - The reranker cuts down to the top 2–3 most authoritative context pieces, ensuring full representation across all three clinical pillars:
     1. **CBT Thought Framework**: Deconstructs catastrophizing, all-or-nothing dichotomous thinking, or personalization.
     2. **Stage Attrition Metric**: Grounded hiring math proving fixed headcount caps (e.g., 82% Round 2 drops are budget allocations, not personal skill).
     3. **Alumni Recovery Precedent**: Historical case study of a senior bouncing back from the exact same failure to a top-tier product offer.

4. **Structured Generation**:
   - The vent and retrieved chunks are passed to **Llama 3.3 70B** (via Groq with sub-second TTFT) or **Gemini 1.5/3.8 Flash** with low temperature `0.2`.
   - Output strictly adheres to the JSON schema:
     - `cognitive_diagnosis`: Thinking trap & clinical explanation.
     - `math_market_check`: Stage attrition statistic & headcount reality.
     - `skill_variable`: Isolated technical gap to patch.
     - `alumni_precedent`: Senior trajectory & rebound timeline.
     - `actionable_recovery_steps`: 3 concrete next moves for the next 24h-72h.
     - `grounded_summary`: Final grounded reassurance.

5. **Local Render & Persistence**:
   - The client parses the JSON response and renders an Actionable Recovery Card widget.
   - The result is persisted directly to the on-device SQLite database via Drift. Zero data is stored on remote servers.

---

## 4. FastAPI Endpoints

- `POST /api/vent/text`: Analyze a typed vent string.
- `POST /api/vent/audio`: Analyze a multipart audio voice recording.
- `GET /api/vent/stages`: Retrieve supported placement interview stages.
- `POST /api/vent/seed`: Re-seed Qdrant vector database collection.
