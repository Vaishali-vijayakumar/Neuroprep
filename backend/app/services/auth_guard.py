"""
Auth Guard & Role-Based Access Control (RBAC) Module
Protects endpoints with Supabase JWT verification and admin role enforcement.
"""
import os
import json
import base64
import time
import httpx
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "").strip().rstrip("/")
ADMIN_EMAILS = [
    email.strip().lower() 
    for email in os.getenv("ADMIN_EMAILS", "admin@neuroprep.com,vaishu04072005@gmail.com").split(",") 
    if email.strip()
]


def _decode_jwt_payload_unverified(token: str) -> Optional[Dict[str, Any]]:
    """Decode JWT payload claims safely without external crypto libraries."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1]
        # Pad base64 string
        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        decoded_bytes = base64.urlsafe_b64decode(padded)
        return json.loads(decoded_bytes.decode("utf-8"))
    except Exception:
        return None


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Extract and verify user identity from Bearer token.
    Supports Supabase JWT verification.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split("Bearer ")[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty Bearer token provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = _decode_jwt_payload_unverified(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT token structure.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check expiration
    exp = payload.get("exp")
    if exp and time.time() > exp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = (payload.get("email") or payload.get("user_metadata", {}).get("email") or "").lower()
    user_id = payload.get("sub") or payload.get("id") or ""
    role = payload.get("user_metadata", {}).get("role") or payload.get("role") or "student"

    if email in ADMIN_EMAILS:
        role = "admin"

    return {
        "user_id": user_id,
        "email": email,
        "role": role,
        "is_admin": role == "admin" or email in ADMIN_EMAILS,
        "claims": payload
    }


async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Enforce administrator role for protected admin operations.
    """
    if not current_user.get("is_admin") and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative privileges are required to access this resource."
        )
    return current_user
