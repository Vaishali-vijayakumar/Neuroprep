"""
pivot.py
===============================================================================
FastAPI Router for Pivot: Evidence-Grounded Placement Recovery RAG Chatbot.
Endpoints:
  POST   /api/pivot/chat               - Primary conversational recovery endpoint
  DELETE /api/pivot/conversation/{id}  - User-controlled history deletion endpoint
  GET    /api/pivot/categories         - Supported support categories & metadata
===============================================================================
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.pivot import (
    PivotChatRequest,
    PivotChatResponse,
    EvidenceReference
)
from app.services.pivot.safety import PivotSafetyService
from app.services.pivot.classifier import MindsetClassifier
from app.services.pivot.retrieval import knowledge_retriever
from app.services.pivot.generator import LLMResponseGenerator
from app.services.pivot.conversation import ConversationMemoryManager

router = APIRouter(prefix="/api/pivot", tags=["Pivot"])

@router.post("/chat", response_model=PivotChatResponse)
async def chat(request: PivotChatRequest):
    """
    Modular 6-stage Pivot conversational pipeline:
      1. Validate input & scrub private PII
      2. Priority safety check (self-harm/crisis detection)
      3. Support need classification
      4. Evidence retrieval from Qdrant via BGE-small embeddings
      5. Grounded LLM response generation
      6. Structured response formatting with sources & memory update
    """
    raw_message = request.message.strip()
    if not raw_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a message."
        )

    # 1. Scrub PII
    sanitized_message = PivotSafetyService.scrub_pii(raw_message)
    conv_id = ConversationMemoryManager.get_or_create_conversation_id(request.conversation_id)

    # 2. Urgent Safety Check (Priority bypass of normal RAG)
    is_urgent, safety_text = PivotSafetyService.check_urgent_safety(sanitized_message)
    if is_urgent:
        ConversationMemoryManager.record_turn(
            conversation_id=conv_id,
            user_message=sanitized_message,
            assistant_reply=safety_text,
            category="urgent_safety",
            next_action=None,
            wants_listening=True
        )
        return PivotChatResponse(
            conversation_id=conv_id,
            reply=safety_text,
            category="urgent_safety",
            confidence=1.0,
            support_need="immediate_safety",
            reason="Priority crisis support triggered.",
            next_action=None,
            evidence=[],
            response_mode="safety"
        )

    # 3. Classify Support Need
    # Merge client-provided history with session memory if available
    session_data = ConversationMemoryManager.get_session(conv_id)
    history_to_use = request.history if request.history else session_data["messages"]

    classification = MindsetClassifier.classify(
        message=sanitized_message,
        history=history_to_use,
        preferred_support=request.preferred_support
    )
    category = classification["category"]
    confidence = classification["confidence"]
    support_need = classification["support_need"]
    reason = classification["reason"]

    # 4. RAG Retrieval & Reranking
    wants_only_listening = (
        request.preferred_support == "listen" or
        any(phrase in sanitized_message.lower() for phrase in ["just want to talk", "don't need advice", "just vent", "don't want advice", "just listen"])
    )

    retrieved_chunks = []
    if not wants_only_listening:
        retrieved_chunks = knowledge_retriever.retrieve(
            query=sanitized_message,
            category=category,
            confidence=confidence,
            top_k=3
        )

    # 5. LLM Response Generation
    gen_result = await LLMResponseGenerator.generate_response(
        message=sanitized_message,
        history=history_to_use,
        evidence_chunks=retrieved_chunks,
        category=category,
        support_need=support_need,
        preferred_support=request.preferred_support
    )

    reply_text = gen_result["reply"]
    next_action = gen_result["next_action"]
    response_mode = gen_result["mode"]

    # Format Evidence References
    evidence_refs: list[EvidenceReference] = []
    for chunk in retrieved_chunks:
        evidence_refs.append(
            EvidenceReference(
                id=chunk["id"],
                title=chunk.get("title", "Guidance"),
                category=chunk.get("category", category),
                support_type=chunk.get("support_type", "guidance"),
                source_title=chunk.get("source_title", "Pivot Knowledge Base"),
                source_url=chunk.get("source_url"),
                snippet=chunk.get("text", "")[:140] + "..." if len(chunk.get("text", "")) > 140 else chunk.get("text", "")
            )
        )

    # 6. Record turn in conversational memory
    ConversationMemoryManager.record_turn(
        conversation_id=conv_id,
        user_message=sanitized_message,
        assistant_reply=reply_text,
        category=category,
        next_action=next_action,
        wants_listening=wants_only_listening
    )

    return PivotChatResponse(
        conversation_id=conv_id,
        reply=reply_text,
        category=category,
        confidence=confidence,
        support_need=support_need,
        reason=reason,
        next_action=next_action,
        evidence=evidence_refs,
        response_mode=response_mode
    )

@router.delete("/conversation/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """User-controlled privacy endpoint to immediately clear conversation memory."""
    ConversationMemoryManager.clear_conversation(conversation_id)
    return {
        "success": True,
        "message": f"Conversation '{conversation_id}' cleared from active memory."
    }

@router.get("/categories")
async def get_support_categories():
    """Returns the controlled support categories and guidance goals."""
    return {
        "categories": [
            {"id": "rejection_recovery", "label": "Rejection Recovery", "goal": "Acknowledge disappointment and identify what can be learned"},
            {"id": "peer_comparison", "label": "Peer Comparison", "goal": "Separate personal progress from other people's outcomes"},
            {"id": "interview_anxiety", "label": "Interview Anxiety", "goal": "Give a grounding technique and practical rehearsal"},
            {"id": "self_doubt", "label": "Self-Doubt", "goal": "Distinguish feelings from evidence; isolate specific skill gaps"},
            {"id": "overthinking", "label": "Overthinking", "goal": "Reduce the immediate problem to controllable steps"},
            {"id": "burnout_or_fatigue", "label": "Burnout or Fatigue", "goal": "Explore whether rest or workload adjustment is needed"},
            {"id": "planning_support", "label": "Planning Support", "goal": "Build a realistic short-term placement plan"},
            {"id": "general_venting", "label": "General Venting", "goal": "Listen without forcing checklists"},
            {"id": "urgent_safety", "label": "Urgent Safety", "goal": "Prioritize immediate safety and crisis support"}
        ]
    }
