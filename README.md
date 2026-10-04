<div align="center">

# 🧠 NeuroPrep
### Stress-Adaptive Placement Preparation & Biometric AI Interview Platform

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646C9F?logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Avatar-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-FaceMesh_&_Vision-0078D4)](https://developers.google.com/mediapipe)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-COCO--SSD-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <b>NeuroPrep</b> bridges technical campus placement training with cutting-edge affective computing and cognitive stress regulation. By monitoring real-time biometrics, eye contact, and vocal sentiment, NeuroPrep dynamically adapts interview difficulty and delivers grounded RAG-assisted technical learning and mental wellness support.
</p>

---

</div>

## 📌 Table of Contents
- [✨ Key Features](#-key-features)
  - [1. Stress-Adaptive AI Interviewer](#1-stress-adaptive-ai-interviewer)
  - [2. Multi-Modal Placement Resource RAG](#2-multi-modal-placement-resource-rag)
  - [3. Coding Assessment Suite](#3-coding-assessment-suite)
  - [4. Cognitive Wellness & CBT Reappraisal](#4-cognitive-wellness--cbt-reappraisal)
  - [5. Aptitude, Puzzles & Daily Gauntlet](#5-aptitude-puzzles--daily-gauntlet)
  - [6. Biometric Analytics & PDF Reporting](#6-biometric-analytics--pdf-reporting)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Directory Structure](#-directory-structure)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Frontend Setup](#1-frontend-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Environment Configuration](#3-environment-configuration)
- [🔒 Proctoring & Privacy](#-proctoring--privacy)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

### 1. Stress-Adaptive AI Interviewer
* **Computer Vision Face Tracking**: Integrates Google MediaPipe FaceMesh to track 468 facial landmarks in real time, measuring blink frequency, jaw clenching, gaze fixation, and eyebrow furrows.
* **Remote Photoplethysmography (rPPG)**: Extracts sub-surface optical pulsatile variations from facial micro-regions via digital signal processing (DSP Butterworth bandpass filter: 0.7 Hz – 3.0 Hz) inside an asynchronous Web Worker.
* **Proctoring & Device Detection**: Employs client-side TensorFlow.js with COCO-SSD to detect unauthorized smartphone usage and multiple faces with zero frame lag.
* **Dynamic AI Interview Avatars**: Interactive 3D human models rendered via Three.js with real-time lip synchronization, blinking, head nods, and natural speech synthesis (Web Speech API).
* **Adaptive Questioning Engine**: If high stress, rapid pulse, or cognitive fatigue is detected, the AI interviewer dynamically eases technical complexity, offering scaffolding hints before ramping back up.

### 2. Multi-Modal Placement Resource RAG
* **Authentic Live Search**: Performs live queries across Google Search, official language documentation (MDN, Python Docs, C++ Reference), and verified university repositories.
* **Academic PDF Synthesis**: Powered by PyMuPDF and Sentence Transformers for rapid semantic vector retrieval over textbooks, papers, and campus interview sheets.
* **YouTube Transcript Grounding**: Ingests technical video lecture transcripts via `youtube-transcript-api` to explain hard algorithmic topics alongside timestamped video references.
* **Focused Query Engine**: Strictly ignores non-technical noise (e.g. general Wikipedia trivia) to focus purely on high-yield interview questions and code explanations.

### 3. Coding Assessment Suite
* **Integrated Monaco Code Editor**: Full-featured code editing experience for Python, JavaScript, C++, and Java with syntax highlighting, autocomplete, and line diagnostics.
* **Test Case Runner**: Real-time evaluation against public and hidden edge test cases with execution time and memory limits.
* **Algorithmic Quality Feedback**: Instant feedback on asymptotic time/space complexity, edge-case coverage, and code maintainability.

### 4. Cognitive Wellness & CBT Reappraisal
* **CBT Cognitive Distortion Detection**: Detects over 10 placement-related cognitive distortions such as *Imposter Syndrome*, *Catastrophizing*, *All-or-Nothing Thinking*, and *Fortune Telling*.
* **Thought Journal & Reappraisal**: Guided interactive cognitive reframing prompts that turn placement rejection anxiety into constructive action plans.
* **Biofeedback Breathing & Recovery**: Automated triggers for resonant 4-7-8 and box-breathing exercises whenever biometric stress spikes during mock sessions.

### 5. Aptitude, Puzzles & Daily Gauntlet
* **Curated 800+ Question Bank**: Complete multi-tier coverage (Foundation, Intermediate, Advanced) across Quantitative Aptitude, Logical Reasoning, and Verbal Ability.
* **Placement Roadmap**: Step-by-step 90-day placement preparation syllabus tailored to top tech companies, product startups, and mass recruiters.
* **Daily Challenge Arena**: Gamified daily problem sets with XP, streak multipliers, achievement badges, and peer rank leaderboards.

### 6. Biometric Analytics & PDF Reporting
* **Comprehensive Performance Metrics**: Correlates technical answer accuracy directly against physiological stress curves.
* **Instant Export via jsPDF**: Produces candidate appraisal reports with radar charts, pacing graphs, and personalized improvement roadmaps.

---

## 🏗️ System Architecture

```
   +-------------------------------------------------------------+
   |                     Frontend (React + Vite)                 |
   |                                                             |
   |   [MediaPipe FaceMesh]       [Monaco Editor]   [Three.js]   |
   |          |                          |               |       |
   |    (Facial Landmarks)         (Code Runner)    (3D Avatar)  |
   |          v                          v               ^       |
   |   [rPPG Web Worker]          [Local / Cloud]        |       |
   |          |                    Session State         |       |
   |   (Pulse & Stress Index)            |               |       |
   |          v                          v               |       |
   |  [CognitiveEmotionalRAG] <--> [AIQuestionEngine] ---+       |
   +-----------------------------|-------------------------------+
                                 | REST / WebSocket
                                 v
   +-------------------------------------------------------------+
   |                  Backend Engine (FastAPI)                   |
   |                                                             |
   |   [ai_brain.py]         --> Google Gemini AI Engine         |
   |   [pdf_rag_service.py]  --> PyMuPDF Semantic Search         |
   |   [youtube_rag_service] --> YouTube Transcript Ingestion    |
   |   [web_rag_service.py]  --> Live Technical Documentation    |
   +-------------------------------------------------------------+
                                 |
                                 v
   +-------------------------------------------------------------+
   |                  Storage / Persistence                      |
   |         Supabase (PostgreSQL with RLS) + LocalStorage       |
   +-------------------------------------------------------------+
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite 5, JavaScript (ESNext) |
| **Styling & Icons** | Vanilla CSS Design System, Lucide React Icons |
| **Computer Vision & AI** | Google MediaPipe (`face_mesh`, `camera_utils`), TensorFlow.js (`coco-ssd`) |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **3D Rendering** | Three.js WebGL Engine |
| **PDF Generation** | jsPDF |
| **Backend Framework** | FastAPI, Uvicorn, Pydantic v2 |
| **LLM & Embeddings** | Google Gemini AI (`google-generativeai`), Sentence Transformers |
| **RAG & Extraction** | PyMuPDF (`fitz`), YouTube Transcript API, HTTPX, BeautifulSoup |
| **Database & Auth** | Supabase (PostgreSQL) + LocalStorage offline-first fallback |

---

## 📂 Directory Structure

```
placement-aider/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint
│   │   ├── routers/
│   │   │   ├── chat.py              # WebSocket & conversational endpoints
│   │   │   └── rag.py               # Document & technical RAG endpoints
│   │   └── services/
│   │       ├── ai_brain.py          # Gemini AI evaluation & interview engine
│   │       ├── pdf_rag_service.py   # Vectorized PDF search engine
│   │       ├── web_rag_service.py   # Live technical query search
│   │       └── youtube_rag_service.py # YouTube video lecture transcripts
│   ├── requirements.txt             # Python backend dependencies
│   └── run_server.py                # Backend startup script
├── public/
│   └── bg.png                       # Assets & background art
├── src/
│   ├── components/
│   │   ├── AptitudePractice.jsx     # Quantitative, Logical & Verbal quizzes
│   │   ├── AuthModal.jsx            # Supabase & guest login modal
│   │   ├── CodingAssessment.jsx     # Live coding test room with Monaco
│   │   ├── CognitiveReappraisal.jsx # CBT cognitive restructuring tool
│   │   ├── CompanyPrep.jsx          # Company-specific interview modules
│   │   ├── DailyChallengeArena.jsx  # Daily streak & challenge arena
│   │   ├── Dashboard.jsx            # Main student overview & telemetry
│   │   ├── Gamification.jsx         # Badges, XP & leaderboards
│   │   ├── LandingPage.jsx          # Interactive product hero landing
│   │   ├── MoodAssessment.jsx       # Daily affective check-in
│   │   ├── Navigation.jsx           # Responsive header & tab navigation
│   │   ├── PlacementFlashGauntlet.jsx # Timed technical flashcards
│   │   ├── PlacementResourceRAG.jsx # Multi-modal RAG search assistant
│   │   ├── PlacementRoadmap.jsx     # Step-by-step career milestones
│   │   ├── PuzzlesAndSheets.jsx     # Classic placement puzzles & sheets
│   │   ├── Reports.jsx              # Analytics & PDF exporter
│   │   ├── SolvePage.jsx            # In-depth problem solving interface
│   │   ├── StressRecovery.jsx       # Biofeedback & breathing exercises
│   │   ├── ThoughtJournal.jsx       # Stress & mood reflection journal
│   │   ├── UserProfile.jsx          # Student profile & stats
│   │   └── neroprep/                # Core biometric AI interview suite
│   │       ├── InterviewRoom.jsx    # Real-time interview chamber
│   │       ├── CodingRoom.jsx       # Technical assessment chamber
│   │       ├── SadTalkerRealHumanAvatar.jsx # Real human interviewer avatar
│   │       ├── VideoFeed.jsx        # Camera stream & face mesh overlay
│   │       ├── MonacoEditorPanel.jsx # Code editor panel
│   │       ├── SidePanel.jsx        # Metrics & live telemetry sidebar
│   │       └── engines/
│   │           ├── AIQuestionEngine.js        # Adaptive question generator
│   │           ├── CognitiveEmotionalRAGEngine.js # CBT distortion detector
│   │           ├── FaceEngine.js              # MediaPipe landmark processor
│   │           ├── FaceStressModel.js         # Facial stress classifier
│   │           ├── PhoneDetector.js           # TensorFlow object detection
│   │           ├── StressScorer.js            # Composite biometric scoring
│   │           ├── VoiceEngine.js             # Speech recognition & synthesis
│   │           ├── WebRAGEvaluationEngine.js  # Live answer evaluation
│   │           ├── dspFilters.js              # Butterworth bandpass filters
│   │           └── rppgWorker.js              # Heart rate Web Worker
│   ├── data/
│   │   ├── adaptiveQuestionBank1400.json # Curated 1,400+ interview questions
│   │   ├── mockTestsData.js         # Curated 800+ aptitude questions
│   │   └── dsaPatternsData.js       # Core DSA pattern taxonomy
│   ├── services/
│   │   ├── db.js                    # Supabase client & sync
│   │   └── localDb.js               # Resilient offline local storage
│   ├── App.jsx                      # Root application & state router
│   ├── index.css                    # Design tokens & glassmorphism theme
│   └── main.jsx                     # Vite DOM mount
├── supabase_schema.sql              # Supabase PostgreSQL schema & tables
├── vite.config.js                   # Vite bundler configuration
└── package.json                     # Frontend dependencies & scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **Python**: `3.10` or higher
* **Git** installed on your system
* Modern browser with webcam and microphone permissions enabled (Chrome or Edge recommended)

---

### 1. Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Vaishali-vijayakumar/Neuroprep.git
   cd Neuroprep
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

### 2. Backend Setup

1. Open a new terminal in the project root:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   python run_server.py
   ```
   The backend API will run at `http://localhost:8000` with Swagger documentation at `http://localhost:8000/docs`.

---

### 3. Environment Configuration

Create a `.env` file in the project root (and optionally inside `backend/`):

```env
# ── Frontend (Vite) ──
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_BACKEND_URL=http://localhost:8000
VITE_OPENAI_API_KEY=your-openai-api-key # Optional fallback

# ── Backend (FastAPI) ──
GEMINI_API_KEY=your-gemini-api-key
PORT=8000
```

> **Note**: NeuroPrep includes a built-in offline local database fallback. If Supabase credentials are not provided, user progress, session telemetry, and test scores will safely save to the browser's `localStorage`.

---

## 🔒 Proctoring & Privacy

NeuroPrep runs its computer vision models (MediaPipe FaceMesh and TensorFlow COCO-SSD) **entirely client-side** inside your web browser. 
- No video feeds or webcam frames are ever transmitted to or stored on external servers.
- Facial landmark and rPPG pulse telemetry are processed purely in real-time volatile memory to modulate question difficulty and generate reports.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for college students and job seekers worldwide.</sub>
</div>
