"""
conversation.py
===============================================================================
Session and Short-term Conversational Memory for Pivot.
Maintains bounded turn history, active topic, and last suggested action.
===============================================================================
"""

import time
import uuid
from typing import Dict, Any, List, Optional
from app.schemas.pivot import ChatMessage

# In-memory session store (bounded, short-lived for privacy)
_SESSION_STORE: Dict[str, Dict[str, Any]] = {}
MAX_STORED_MESSAGES = 12
SESSION_TTL_SECONDS = 7200  # 2 hours

class ConversationMemoryManager:
    @staticmethod
    def get_or_create_conversation_id(conversation_id: Optional[str] = None) -> str:
        if conversation_id and conversation_id.strip():
            return conversation_id.strip()
        return f"piv_{uuid.uuid4().hex[:12]}"

    @staticmethod
    def get_session(conversation_id: str) -> Dict[str, Any]:
        ConversationMemoryManager._cleanup_expired()
        if conversation_id not in _SESSION_STORE:
            _SESSION_STORE[conversation_id] = {
                "created_at": time.time(),
                "updated_at": time.time(),
                "messages": [],
                "current_category": None,
                "last_action": None,
                "wants_listening": False,
            }
        return _SESSION_STORE[conversation_id]

    @staticmethod
    def record_turn(
        conversation_id: str,
        user_message: str,
        assistant_reply: str,
        category: str,
        next_action: Optional[str] = None,
        wants_listening: bool = False
    ):
        session = ConversationMemoryManager.get_session(conversation_id)
        session["updated_at"] = time.time()
        session["current_category"] = category
        session["last_action"] = next_action
        session["wants_listening"] = wants_listening

        session["messages"].append(ChatMessage(role="user", content=user_message))
        session["messages"].append(ChatMessage(role="assistant", content=assistant_reply))

        # Keep bounded window
        if len(session["messages"]) > MAX_STORED_MESSAGES:
            session["messages"] = session["messages"][-MAX_STORED_MESSAGES:]

    @staticmethod
    def _cleanup_expired():
        now = time.time()
        expired = [
            cid for cid, sess in _SESSION_STORE.items()
            if now - sess.get("updated_at", now) > SESSION_TTL_SECONDS
        ]
        for cid in expired:
            _SESSION_STORE.pop(cid, None)

    @staticmethod
    def clear_conversation(conversation_id: str):
        _SESSION_STORE.pop(conversation_id, None)
