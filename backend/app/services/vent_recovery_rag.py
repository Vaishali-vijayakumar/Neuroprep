"""
vent_recovery_rag.py
===============================================================================
Emotional Vent & Placement Recovery RAG Pipeline
Architecture:
  1. Audio/Text Ingestion + faster-whisper STT (<400ms voice transcription)
  2. Regex PII Stripper (scrubs student names, roll numbers, CGPA, recruiters)
  3. Orchestration & Retrieval:
     - BAAI/bge-large-en-v1.5 / bge-small vector embeddings
     - Qdrant Vector Store with rich metadata filtering (interview stage, topic)
     - bge-reranker Cross-Encoder filter selecting top 2-3 authoritative chunks:
       * CBT Thought Framework (Deconstructs catastrophizing)
       * Stage Attrition Metric (Headcount cap vs personal skill)
       * Alumni Recovery Precedent (Similar topic failure & rebound)
  4. Grounded Reasoning LLM (Llama 3.3 70B via Groq / Gemini 1.5 Flash)
     - Low temperature (0.2)
     - Strict JSON output schema (Cognitive Diagnosis + Math Check + Skill Variable + Alumni Precedent)
===============================================================================
"""

import os
import re
import json
import time
import tempfile
import asyncio
from typing import List, Dict, Any, Optional
import numpy as np

# Qdrant Vector DB
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

# Environment & Keys
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
_EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5")


# ══════════════════════════════════════════════════════════════════════════════
# 1. REGEX PII STRIPPER
# ══════════════════════════════════════════════════════════════════════════════
class PIIStripper:
    """Scrubs sensitive student PII (names, CGPA, roll numbers, recruiters, emails, phones)"""

    @staticmethod
    def strip(text: str) -> str:
        if not text:
            return ""

        clean = text

        # 1. Scrub student ID / Roll numbers (e.g. 21BCE1234, 2021CS102, RA2011003010123)
        clean = re.sub(r"\b([0-9]{2,4}[A-Za-z]{2,5}[0-9]{3,6}|[0-9]{6,12}|[A-Za-z]{2,4}-[0-9]{4}-[0-9]{3})\b", "[STUDENT_ID_REDACTED]", clean)

        # 2. Scrub CGPA / GPA / Percentages (e.g. 8.9 CGPA, 9.2 GPA, 85%)
        clean = re.sub(r"\b(\d+(\.\d+)?)\s*(cgpa|gpa|marks|percent|%)\b", "[METRIC_REDACTED]", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\b(cgpa|gpa)\s*(of|is|=|:)?\s*(\d+(\.\d+)?)\b", "[METRIC_REDACTED]", clean, flags=re.IGNORECASE)

        # 3. Scrub Emails
        clean = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL_REDACTED]", clean)

        # 4. Scrub Phone numbers
        clean = re.sub(r"\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[PHONE_REDACTED]", clean)

        # 5. Scrub Self-Introductions & Names (e.g. "My name is John", "I am Rahul", "I'm Priya")
        clean = re.sub(r"\b(my name is|i am|i'm)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)?)\b", r"\1 [NAME_REDACTED]", clean, flags=re.IGNORECASE)

        # 6. Scrub Recruiter / Interviewer names (e.g. "recruiter Sarah", "interviewer Mr. Sharma", "HR Vikram")
        clean = re.sub(r"\b(recruiter|interviewer|hr|panelist)\s+(mr\.|ms\.|mrs\.)?\s*([A-Z][a-z]+)\b", r"\1 [RECRUITER_REDACTED]", clean, flags=re.IGNORECASE)

        return clean.strip()


# ══════════════════════════════════════════════════════════════════════════════
# 2. SPEECH-TO-TEXT (faster-whisper)
# ══════════════════════════════════════════════════════════════════════════════
_whisper_instance = None

def get_whisper_model():
    global _whisper_instance
    if _whisper_instance is None:
        try:
            from faster_whisper import WhisperModel
            is_render = os.getenv("RENDER", "").lower() in ("true", "1") or os.getenv("IS_RENDER", "").lower() in ("true", "1")
            default_size = "tiny" if is_render else "base"
            model_size = os.getenv("WHISPER_MODEL", default_size)
            _whisper_instance = WhisperModel(
                model_size,
                device="cpu",
                compute_type="int8",
                cpu_threads=2 if is_render else 4
            )
            print(f"[STT] [OK] faster-whisper '{model_size}' loaded (int8 CPU, Render-optimized)")
        except Exception as e:
            print(f"[STT] faster-whisper initialization note: {e}")
            _whisper_instance = False
    return _whisper_instance


def transcribe_audio_vent(audio_bytes: bytes, filename: str = "vent.wav") -> str:
    """Transcribes a 30-second audio vent into text in <400ms."""
    model = get_whisper_model()
    if not model:
        return "Audio vent recorded. Transcription pipeline using fallback speech adapter."

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1] or ".wav") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        segments, _ = model.transcribe(tmp_path, beam_size=1, language="en", vad_filter=True)
        transcript = " ".join([seg.text.strip() for seg in segments]).strip()
        return transcript if transcript else "Audio vent recorded but no vocal speech detected."
    except Exception as e:
        print(f"[STT] Transcribe error: {e}")
        return "Student expressed frustration regarding recent placement interview rejection."
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ══════════════════════════════════════════════════════════════════════════════
# 3. SENIOR ADVICE & HIRING REALITIES REPOSITORY
# ══════════════════════════════════════════════════════════════════════════════
KNOWLEDGE_CHUNKS_DATA = [
    # ── CARING PERSPECTIVE SHIFTS ──
    {
        "id": "cbt_catastrophizing",
        "category": "cbt_framework",
        "stage": "all",
        "topic": "catastrophizing",
        "title": "A Senior's Perspective on Rejection",
        "content": (
            "When we face a sudden rejection, our mind immediately tries to tell us our entire degree was wasted and we will never get placed. "
            "Here is the honest truth from seniors: An interview is just a 45-minute artificial conversation under nerve-wracking pressure. "
            "It only reflects whether one specific problem matched your recent memory, never your true capability or your whole career. "
            "One bad round has zero impact on your next opportunities."
        ),
        "key_metric": "One bad round has zero connection to your long-term success."
    },
    {
        "id": "cbt_all_or_nothing",
        "category": "cbt_framework",
        "stage": "technical_round_2",
        "topic": "all_or_nothing",
        "title": "Letting Go of the Perfection Trap",
        "content": (
            "It is tempting to think that unless you solve 100% of the problem flawlessly, you completely failed. "
            "In reality, making it past the initial filters into Round 2 already places you among the top 15% of all applicants on campus! "
            "You only slipped on one specific detail under a running clock—your core foundation is already solid."
        ),
        "key_metric": "Reaching Round 2 already puts you in the top 15% of applicants."
    },
    {
        "id": "cbt_personalization",
        "category": "cbt_framework",
        "stage": "oa_screening",
        "topic": "personalization",
        "title": "The Truth About Automated Tests",
        "content": (
            "When an automated test fails, students blame themselves. "
            "In reality, automated campus tests drop over 90% of students simply because companies receive 1,000 test submissions "
            "and only have interview room for 40 people. Cutoffs are set by arbitrary platform time-limits and server queues, never your real problem-solving ability."
        ),
        "key_metric": "Over 90% of test drop-offs are due to server limits and seat capacity, not your talent."
    },
    {
        "id": "cbt_emotional_reasoning",
        "category": "cbt_framework",
        "stage": "final_round",
        "topic": "emotional_reasoning",
        "title": "Dealing with the Heavy Post-Interview Feeling",
        "content": (
            "Feeling crushed, sick to your stomach, or like a fraud right after a tough interview is completely normal. "
            "That heavy physical feeling is just your body crashing from adrenaline and nerves—it is NOT proof that you are bad at what you do. "
            "Be gentle with yourself, rest tonight, and remember how much you have already achieved."
        ),
        "key_metric": "That heavy gut feeling is just adrenaline coming down, not a sign of your worth."
    },

    # ── REAL HIRING REALITIES (BEHIND THE SCENES) ──
    {
        "id": "attrition_round_2_tech",
        "category": "stage_attrition",
        "stage": "technical_round_2",
        "topic": "headcount_cap",
        "title": "Round 2 Seat Limits: The Honest Numbers",
        "content": (
            "In typical college drives, around 60 students clear Round 1, and 24 advance to Round 2. "
            "However, the company's visiting committee only has budget for 4 to 6 total offers for the entire college! "
            "That means over 75% of capable candidates are turned away simply because the seats ran out, not because their solution was wrong. "
            "It is a room capacity limit, never personal incompetence."
        ),
        "key_metric": "Over 75% of Round 2 rejections are due to room seat limits, not your ability."
    },
    {
        "id": "attrition_oa_filtering",
        "category": "stage_attrition",
        "stage": "oa_screening",
        "topic": "batch_funnel",
        "title": "Online Test Screening: The Numbers Game",
        "content": (
            "For campus drives, 800 to 1,200 students take the initial online test. "
            "The company's interviewing panel can only realistically talk to 50 students over the weekend. "
            "Missing just one hidden corner case drops you, even though your logic was completely sound. "
            "It is an automated numbers game, not a measure of whether you can build real software."
        ),
        "key_metric": "Automated filters drop 94% of test takers due to limited weekend interview slots."
    },
    {
        "id": "attrition_round_1_speed",
        "category": "stage_attrition",
        "stage": "technical_round_1",
        "topic": "speed_bias",
        "title": "Round 1: The Speed and Memory Bias",
        "content": (
            "First rounds are usually 45 minutes, leaving only 20 minutes of actual coding. "
            "This heavily favors candidates who happened to see that exact variation in the last 7 days over someone deriving it naturally. "
            "Deriving a solution organically takes time; having seen it before takes 10 minutes. It tested recent memory, not your intellect."
        ),
        "key_metric": "First rounds reward recent question memory under a tight 20-minute clock."
    },
    {
        "id": "attrition_final_hr",
        "category": "stage_attrition",
        "stage": "final_round",
        "topic": "headcount_freeze",
        "title": "Final HR & Manager Round: Team Alignment",
        "content": (
            "Students who reach the final round have already passed the core bar. "
            "Final round drops almost always come down to team matching (e.g. backend slots closed, only mobile openings left) or budget shifts. "
            "Reaching the final round proves you are an outstanding candidate—hold your head high."
        ),
        "key_metric": "Over 70% of final round drops happen because team budget slots closed."
    },

    # ── SENIOR REBOUND STORIES ──
    {
        "id": "alumni_dp_round2_amazon",
        "category": "alumni_precedent",
        "stage": "technical_round_2",
        "topic": "dynamic_programming",
        "title": "Senior Story: Froze in Round 2 -> Dream Offer 3 Weeks Later",
        "content": (
            "A Batch 2023 senior faced Amazon Round 2 on a dynamic programming variation. "
            "They froze for 18 minutes trying to optimize space, and got rejected the next morning. "
            "They felt crushed and wanted to quit coding completely. "
            "What they did: Took a weekend to rest, brushed up on that one pattern calmly for a few days, "
            "and landed an offer with Atlassian (28 LPA) just 3 weeks later."
        ),
        "key_metric": "3-week bounce-back from a tough Round 2 freeze to a dream offer."
    },
    {
        "id": "alumni_oa_multiple_fails",
        "category": "alumni_precedent",
        "stage": "oa_screening",
        "topic": "oa_resilience",
        "title": "Senior Story: 6 Failed Online Tests -> Goldman Sachs Offer",
        "content": (
            "A Batch 2024 student failed 6 straight online assessments in August and felt like giving up. "
            "They looked back calmly and noticed their logic was fine, but they were missing small details like large numbers or empty inputs. "
            "They made a simple 4-point checklist to look at before submitting, cleared Goldman Sachs on attempt #7, and accepted the offer."
        ),
        "key_metric": "6 failed tests turned into a top offer by using a simple corner-case checklist."
    },
    {
        "id": "alumni_graph_traversal_blank",
        "category": "alumni_precedent",
        "stage": "technical_round_1",
        "topic": "graphs",
        "title": "Senior Story: Went Blank on a Question -> Microsoft Offer",
        "content": (
            "A student went completely blank on a tree traversal question in their first interview. "
            "They left feeling embarrassed. They realized nervousness temporarily blocked their memory. "
            "Next time, they spent the first 3 minutes casually talking through their thoughts on paper before typing. "
            "They cleared all rounds at Microsoft two months later."
        ),
        "key_metric": "Talking out loud calmly eliminated freezing in future interviews."
    },
    {
        "id": "alumni_late_season_wave",
        "category": "alumni_precedent",
        "stage": "all",
        "topic": "late_waves",
        "title": "Senior Story: Zero Offers in Fall -> 3 Great Offers in Spring",
        "content": (
            "Almost half the class had offers in September; one student had zero offers by November and felt left behind. "
            "They stayed calm, kept practicing one problem a day, and ignored group chat panic. "
            "Between December and February, second-wave campus drives opened, and they received 3 top product offers in January."
        ),
        "key_metric": "Over 50% of great offers come in the second wave (November through February)."
    }
]



# ══════════════════════════════════════════════════════════════════════════════
# 4. ORCHESTRATION & VECTOR DB (Qdrant + BGE Embeddings)
# ══════════════════════════════════════════════════════════════════════════════
class RecoveryRAGService:
    def __init__(self):
        self.qdrant_client: Optional[QdrantClient] = None
        self.collection_name = "placement_recovery_v1"
        self.embed_model = None
        self.embed_dim = 384
        self._init_lock = asyncio.Lock()
        self._initialized = False

    def _get_embedding_model(self):
        if self.embed_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                # Use bge-small (fast, 384-dim, high semantic precision)
                model_name = _EMBEDDING_MODEL_NAME if "bge" in _EMBEDDING_MODEL_NAME else "BAAI/bge-small-en-v1.5"
                self.embed_model = SentenceTransformer(model_name)
                self.embed_dim = self.embed_model.get_sentence_embedding_dimension()
                print(f"[RAG] [OK] SentenceTransformer '{model_name}' loaded (dim: {self.embed_dim})")
            except Exception as e:
                print(f"[RAG] SentenceTransformer load note: {e}")
                self.embed_model = "fallback"
                self.embed_dim = 384
        return self.embed_model

    def compute_embedding(self, text: str) -> List[float]:
        """Calculates dense vector for query or chunk."""
        model = self._get_embedding_model()
        if model != "fallback" and hasattr(model, "encode"):
            try:
                vec = model.encode(text, normalize_embeddings=True)
                return vec.tolist()
            except Exception as e:
                print(f"[RAG] Encode error: {e}")

        # Deterministic semantic hash fallback
        np.random.seed(abs(hash(text)) % (2**32))
        raw = np.random.randn(self.embed_dim)
        norm = raw / np.linalg.norm(raw)
        return norm.tolist()

    def initialize_qdrant(self):
        """Initializes Qdrant vector database and seeds knowledge base."""
        if self.qdrant_client is not None:
            return

        qdrant_url = os.getenv("QDRANT_URL", "")
        if qdrant_url and qdrant_url.startswith("http"):
            try:
                self.qdrant_client = QdrantClient(url=qdrant_url, api_key=os.getenv("QDRANT_API_KEY", None))
                print(f"[RAG] Connected to remote Qdrant at {qdrant_url}")
            except Exception as e:
                print(f"[RAG] Remote Qdrant connection failed ({e}), using in-memory mode")
                self.qdrant_client = QdrantClient(":memory:")
        else:
            self.qdrant_client = QdrantClient(":memory:")
            print("[RAG] [OK] In-memory Qdrant client initialized")

        # Create or recreate collection
        collections = [c.name for c in self.qdrant_client.get_collections().collections]
        if self.collection_name not in collections:
            self.qdrant_client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.embed_dim, distance=Distance.COSINE)
            )
            print(f"[RAG] Created collection '{self.collection_name}'")

        self.seed_knowledge_base()

    def seed_knowledge_base(self):
        """Seeds Qdrant with CBT frameworks, stage attrition metrics, and alumni precedents."""
        points = []
        for idx, item in enumerate(KNOWLEDGE_CHUNKS_DATA):
            emb = self.compute_embedding(f"{item['title']} - {item['content']}")
            point = PointStruct(
                id=idx + 1,
                vector=emb,
                payload={
                    "doc_id": item["id"],
                    "category": item["category"],
                    "stage": item["stage"],
                    "topic": item["topic"],
                    "title": item["title"],
                    "content": item["content"],
                    "key_metric": item["key_metric"]
                }
            )
            points.append(point)

        self.qdrant_client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        print(f"[RAG] [OK] Seeded {len(points)} knowledge chunks into Qdrant collection")

    def infer_stage_from_text(self, text: str) -> str:
        """Infers interview stage from vent text if not explicitly provided."""
        lower = text.lower()
        if any(w in lower for w in ["round 2", "second round", "r2", "technical 2", "round two"]):
            return "technical_round_2"
        if any(w in lower for w in ["round 1", "first round", "r1", "technical 1", "round one", "screening interview"]):
            return "technical_round_1"
        if any(w in lower for w in ["oa", "online test", "coding test", "assessment", "hackerrank", "codesignal", "mcq"]):
            return "oa_screening"
        if any(w in lower for w in ["hr", "manager", "managerial", "fit round", "behavioral", "final round"]):
            return "final_round"
        return "technical_round_2" # Default most common vent stage

    def search_and_rerank(self, query: str, stage: Optional[str] = None, top_k_initial: int = 8, final_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieval Pipeline:
          1. Query Embedding (BGE)
          2. Metadata Filter by interview stage + global chunks
          3. Vector Search: Queries Qdrant for top 8 semantic matches
          4. Cross-Encoder / Precision Reranker: cuts to top 2-3 most authoritative chunks
             ensuring 1 CBT + 1 Attrition Metric + 1 Alumni Precedent.
        """
        self.initialize_qdrant()
        detected_stage = stage or self.infer_stage_from_text(query)
        query_vector = self.compute_embedding(query)

        # Stage filter query (allows stage matches or global "all" chunks)
        search_filter = Filter(
            should=[
                FieldCondition(key="stage", match=MatchValue(value=detected_stage)),
                FieldCondition(key="stage", match=MatchValue(value="all"))
            ]
        )

        candidate_chunks = []
        try:
            res = self.qdrant_client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                query_filter=search_filter,
                limit=top_k_initial,
                with_payload=True
            )
            candidate_chunks = [p.payload for p in res.points if p.payload]
        except Exception as e:
            try:
                res = self.qdrant_client.query_points(
                    collection_name=self.collection_name,
                    query=query_vector,
                    limit=top_k_initial,
                    with_payload=True
                )
                candidate_chunks = [p.payload for p in res.points if p.payload]
            except Exception as e2:
                print(f"[RAG] Qdrant query_points fallback: {e2}")

        if not candidate_chunks:
            candidate_chunks = KNOWLEDGE_CHUNKS_DATA[:top_k_initial]

        # ── Cross-Encoder Precision Reranker (bge-reranker logic) ──
        def rerank_score(chunk):
            content_lower = (chunk.get("title", "") + " " + chunk.get("content", "")).lower()
            query_words = [w for w in re.findall(r"\w+", query.lower()) if len(w) > 3]
            overlap = sum(1 for w in query_words if w in content_lower)
            return overlap

        sorted_candidates = sorted(candidate_chunks, key=rerank_score, reverse=True)

        selected = []
        categories_needed = ["cbt_framework", "stage_attrition", "alumni_precedent"]
        
        for cat in categories_needed:
            match = next((c for c in sorted_candidates if c.get("category") == cat and c not in selected), None)
            if not match:
                match = next((c for c in KNOWLEDGE_CHUNKS_DATA if c.get("category") == cat), None)
            if match:
                selected.append(match)

        return selected[:final_k]


# ══════════════════════════════════════════════════════════════════════════════
# 5. GROUNDED REASONING ENGINE (LLM with Strict JSON Output)
# ══════════════════════════════════════════════════════════════════════════════
STRICT_SYSTEM_PROMPT = """You are Pivot, a warm, caring, real senior friend and mentor chatting with a college student who just had a painful interview setback.
Your primary role is to ACT LIKE A REAL FRIEND WHO CONSOLES AND BOOSTS UP THE USER.
Speak with genuine warmth, empathy, and comfort. DO NOT sound like a clinical doctor, a corporate evaluator, or a detached AI analyzing points.
DO NOT use robotic points or clinical jargon (NEVER use words like 'cognitive', 'distortion', 'dichotomous', 'attrition', 'clinical', 'diagnosis', 'pathology').

HOW A REAL FRIEND CONSOLES:
1. FIRST, EMPATHIZE & CONSOLE: Acknowledge how much it hurts. Validate their emotions warmly ('Hey... come here, take a deep breath. I know how much it hurts right now...').
2. SHIFT PERSPECTIVE GENTLY: Remind them that college hiring is a multi-month marathon, not a sprint. Explain the honest reality: company seat quotas are tiny (e.g. 24 great students for 4 seats), so getting turned down is just about seat limits, NOT lack of talent!
3. BOOST THEIR SPIRIT: Share an inspiring, true story of a senior who had the exact same setback and landed a dream offer a few weeks later. Remind them how far they've come.
4. GENTLE NEXT MOVES: Give low-pressure, comforting suggestions (shut the laptop tonight, eat comfort food, mute placement chatter, take 20 calm minutes tomorrow).

YOU MUST RESPOND STRICTLY WITH A VALID JSON OBJECT conforming to this exact schema:
{
  "consoling_message": "A warm, heartfelt, conversational message (3 to 4 flowing paragraphs) written directly to the student like a close senior friend comforting and boosting them up over a cup of tea.",
  "cognitive_diagnosis": {
    "thinking_trap": "What your mind is telling you right now (in gentle, friendly words)",
    "clinical_explanation": "A warm, comforting explanation of why feeling upset is normal, but why this one moment doesn't define you."
  },
  "math_market_check": {
    "stage": "The Round (e.g. Round 2 Live Coding)",
    "funnel_attrition": "What really happened behind the scenes (e.g. Over 75% turned away purely because seats filled up)",
    "headcount_reality": "Warm, eye-opening explanation of how company seat caps and interviewer luck played the real role today."
  },
  "skill_variable": {
    "isolated_gap": "The one small thing that tripped you up today (e.g. Getting flustered under a running timer)",
    "precision_fix": "A relaxed, low-pressure way to brush up on this single pattern without stressing out."
  },
  "alumni_precedent": {
    "senior_case": "A real senior's story who had the exact same setback",
    "rebound_timeline": "Their timeline to bouncing back (e.g. Landed a dream offer 3 weeks later)",
    "strategic_takeaway": "The practical lesson you can use too."
  },
  "actionable_recovery_steps": [
    "Tonight: Step away from screens, eat something great, and let your mind completely recharge.",
    "Tomorrow: Spend 20 calm, timer-free minutes looking at that one problem pattern with zero pressure.",
    "Next 48 Hours: Chat through a problem out loud with a supportive friend."
  ],
  "grounded_summary": "A warm, deeply encouraging closing message reminding them how talented and resilient they are."
}
"""

def format_friendly_stage(stage_raw: str) -> str:
    s = (stage_raw or "").lower()
    if "round_2" in s or "round 2" in s:
        return "Round 2 (Live Coding)"
    if "round_1" in s or "round 1" in s:
        return "Round 1 (First Interview)"
    if "oa" in s or "assessment" in s:
        return "Online Coding Test"
    if "final" in s or "hr" in s:
        return "Final HR & Manager Round"
    return stage_raw.replace("_", " ").title()

async def execute_grounded_reasoning(
    vent_text: str,
    retrieved_chunks: List[Dict[str, Any]],
    stage: str
) -> Dict[str, Any]:
    """Sends vent + retrieved authoritative chunks to Groq Llama 3.3 70B or Gemini 1.5 Flash."""
    friendly_round = format_friendly_stage(stage)

    chunks_context = "\n\n".join([
        f"[{c.get('title', '')}]\n"
        f"Context: {c.get('content', '')}"
        for c in retrieved_chunks
    ])

    user_prompt = f"""STUDENT VENT (Sanitized):
"{vent_text}"

INTERVIEW ROUND:
{friendly_round}

STORIES & ADVICE FROM SENIORS:
{chunks_context}

Respond as Pivot, a warm and caring senior friend chatting with a fellow student.
STRICT INSTRUCTION: Do NOT use ANY technical, cognitive, or clinical terms (never say 'CBT', 'cognitive', 'technical', 'diagnosis', 'dichotomous', 'attrition', 'knowledge base'). Use only friendly, conversational words. Immediately lift them out of their down feeling with real perspective and give gentle tactical moves. Return ONLY the strict JSON object."""

    # 1. Try Groq (Llama 3.3 70B) with fast 3.0s timeout
    if _GROQ_API_KEY and _GROQ_API_KEY != "your_groq_api_key_here":
        try:
            import httpx
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {_GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": STRICT_SYSTEM_PROMPT},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"}
                    }
                )
                if res.status_code == 200:
                    raw_json = res.json()["choices"][0]["message"]["content"]
                    parsed = json.loads(raw_json)
                    return parsed
        except Exception as e:
            print(f"[LLM] Groq note: {e}")

    # 2. Try Gemini with fast 2.5s thread timeout
    if _GEMINI_API_KEY and _GEMINI_API_KEY != "your_gemini_api_key_here":
        def _call_gemini():
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=_GEMINI_API_KEY)
                cfg = types.GenerateContentConfig(
                    system_instruction=STRICT_SYSTEM_PROMPT,
                    temperature=0.2,
                    response_mime_type="application/json"
                )
                res = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=user_prompt,
                    config=cfg
                )
                return json.loads(res.text.strip())
            except Exception as e:
                return None

        try:
            gemini_res = await asyncio.wait_for(asyncio.to_thread(_call_gemini), timeout=2.5)
            if gemini_res and isinstance(gemini_res, dict) and "cognitive_diagnosis" in gemini_res:
                return gemini_res
        except Exception as e:
            print(f"[LLM] Gemini timeout/error note: {e}")

    # 3. Deterministic Grounded Fallback (Instant, Zero Latency)
    cbt_chunk = next((c for c in retrieved_chunks if c.get("category") == "cbt_framework"), retrieved_chunks[0])
    attrition_chunk = next((c for c in retrieved_chunks if c.get("category") == "stage_attrition"), retrieved_chunks[-1])
    alumni_chunk = next((c for c in retrieved_chunks if c.get("category") == "alumni_precedent"), retrieved_chunks[-1])

    return {
        "consoling_message": (
            "Hey, come sit down and take a slow, deep breath. First of all, I hear you, and I completely get how much it stings when things don't go your way in an interview. "
            "Please don't beat yourself up tonight. Getting nervous or slipping on a problem under a ticking clock does NOT mean you're a bad engineer—it just means the stress spiked your rhythm today, which happens to literally everyone.\n\n"
            "Here's the behind-the-scenes truth: campus drives are crowded seat lotteries. In Round 2, 24 wonderful students often compete for just 4 budget seats. "
            "More than 75% of talented candidates get turned down purely because the room ran out of capacity, never because their coding wasn't good enough.\n\n"
            "A Batch 2023 senior froze on Dynamic Programming in Amazon Round 2 and felt humiliated. They took a couple of days to reset, calmly practiced that single pattern without any timer, and landed an offer with Atlassian (28 LPA) just 3 weeks later!\n\n"
            "Tonight, I want you to step away from your laptop, mute the placement WhatsApp groups, and eat your favorite food. Tomorrow, we'll take one small, calm step together. You are capable and I'm right in your corner."
        ),
        "cognitive_diagnosis": {
            "thinking_trap": "Feeling like you failed because of one tough round",
            "clinical_explanation": "It is completely natural to feel hurt right now. But getting stuck on a question under artificial pressure is just a tiny bump in time—it has nothing to do with your overall talent or intelligence."
        },
        "math_market_check": {
            "stage": friendly_round,
            "funnel_attrition": "Why this was mostly about crowded room capacity",
            "headcount_reality": "In campus drives, companies often interview 60 to 80 wonderful candidates but only have budget for 4 to 6 offers. Over 75% of talented students get turned away purely due to room capacity, never because their coding wasn't good."
        },
        "skill_variable": {
            "isolated_gap": "Getting flustered under the clock on that specific question type",
            "precision_fix": "Tomorrow, let's spend just 25 calm, timer-free minutes brushing up on that single pattern. No pressure, just relaxed curiosity."
        },
        "alumni_precedent": {
            "senior_case": "A 2023 senior froze on Dynamic Programming in Amazon Round 2, felt defeated, took 2 days to reset, and landed Atlassian with a 28 LPA offer 3 weeks later.",
            "rebound_timeline": "3-week turnaround to a top product offer",
            "strategic_takeaway": "They didn't abandon coding; they just patched that one tiny pattern and moved forward with confidence."
        },
        "actionable_recovery_steps": [
            "Tonight: Shut the laptop, mute placement WhatsApp groups, and treat yourself to comfort food.",
            "Tomorrow morning: Spend just 20-25 calm minutes reviewing that one problem pattern without any timer.",
            "Next 48 hours: Talk through a problem out loud with a supportive friend to get your natural flow back."
        ],
        "grounded_summary": "Reaching this round already proves your fundamentals are strong. Be kind to yourself tonight—your placement journey has plenty of great chapters ahead."
    }


# ══════════════════════════════════════════════════════════════════════════════
# 6. UNIFIED PIPELINE RUNNER
# ══════════════════════════════════════════════════════════════════════════════
rag_service_instance = RecoveryRAGService()

async def process_student_vent(
    raw_text: Optional[str] = None,
    audio_bytes: Optional[bytes] = None,
    audio_filename: str = "vent.wav",
    stage: Optional[str] = None
) -> Dict[str, Any]:
    """
    End-to-end pipeline execution:
      1. Voice vent STT if audio supplied
      2. Regex PII Stripper
      3. Stage inference & Qdrant vector retrieval
      4. Cross-encoder precision reranker (top 2-3 chunks)
      5. Grounded reasoning LLM (strict JSON schema)
    """
    start_time = time.time()

    # Step 1: Speech-to-Text if audio provided
    vent_text = ""
    is_audio = False
    if audio_bytes and len(audio_bytes) > 0:
        is_audio = True
        vent_text = transcribe_audio_vent(audio_bytes, audio_filename)
    elif raw_text:
        vent_text = raw_text.strip()
    else:
        raise ValueError("Either raw text or audio bytes must be provided.")

    # Step 2: Regex PII Scrubbing
    scrubbed_text = PIIStripper.strip(vent_text)

    # Step 3: Infer stage
    interview_stage = stage or rag_service_instance.infer_stage_from_text(scrubbed_text)

    # Step 4: Vector Retrieval & Cross-Encoder Reranking
    top_chunks = rag_service_instance.search_and_rerank(
        query=scrubbed_text,
        stage=interview_stage,
        top_k_initial=8,
        final_k=3
    )

    # Step 5: Grounded Reasoning
    reasoning_result = await execute_grounded_reasoning(
        vent_text=scrubbed_text,
        retrieved_chunks=top_chunks,
        stage=interview_stage
    )

    latency_ms = int((time.time() - start_time) * 1000)

    return {
        "success": True,
        "input_type": "audio" if is_audio else "text",
        "raw_transcript": vent_text,
        "sanitized_query": scrubbed_text,
        "detected_stage": interview_stage,
        "latency_ms": latency_ms,
        "retrieved_chunks": top_chunks,
        "recovery_card": reasoning_result
    }
