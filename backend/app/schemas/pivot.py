from typing import Literal, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

SupportCategory = Literal[
    "rejection_recovery",
    "peer_comparison",
    "interview_anxiety",
    "self_doubt",
    "overthinking",
    "burnout_or_fatigue",
    "planning_support",
    "general_venting",
    "urgent_safety",
]

SupportType = Literal[
    "coping_technique",
    "placement_guide",
    "action_template",
    "verified_fact",
    "referral",
]

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=5000)

class PivotChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    conversation_id: Optional[str] = None
    history: List[ChatMessage] = Field(
        default_factory=list,
        max_length=20
    )
    preferred_support: Optional[str] = None

class EvidenceReference(BaseModel):
    id: str
    title: str
    category: str
    support_type: str
    source_title: str
    source_url: Optional[str] = None
    snippet: Optional[str] = None

class PivotChatResponse(BaseModel):
    conversation_id: str
    reply: str
    category: SupportCategory
    confidence: float
    support_need: str
    reason: Optional[str] = None
    next_action: Optional[str] = None
    evidence: List[EvidenceReference] = Field(default_factory=list)
    response_mode: Literal["rag", "conversational", "safety", "fallback"] = "rag"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
