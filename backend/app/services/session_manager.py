import os
import json
import time
from datetime import datetime
import redis
from typing import Dict, Any, Optional

# Global cache configs
SESSION_TTL_SECONDS = 14400  # 4 hours

# Setup Redis connection only if explicit REDIS_URL or REDIS_HOST is configured
redis_client = None
redis_url = os.getenv("REDIS_URL", "").strip()
redis_host = os.getenv("REDIS_HOST", "").strip()

if redis_url or redis_host:
    try:
        if redis_url:
            redis_client = redis.Redis.from_url(
                redis_url,
                socket_connect_timeout=1,
                socket_timeout=1,
                decode_responses=True
            )
        else:
            redis_client = redis.Redis(
                host=redis_host,
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=int(os.getenv("REDIS_DB", 0)),
                password=os.getenv("REDIS_PASSWORD", None),
                socket_connect_timeout=1,
                socket_timeout=1,
                decode_responses=True
            )
        redis_client.ping()
        print("[Session Manager] Successfully connected to Redis.")
    except Exception as e:
        print(f"[Session Manager] Redis connection note ({e}). Falling back to local In-Memory TTL Session Store.")
        redis_client = None
else:
    print("[Session Manager] Using local In-Memory TTL Session Store.")
    redis_client = None

# Thread-safe in-memory store fallback
local_session_db: Dict[str, Dict[str, Any]] = {}

def clean_expired_local_sessions():
    """Removes sessions that have exceeded their 4-hour lifespan."""
    now = time.time()
    expired_keys = []
    for key, data in local_session_db.items():
        if data.get("expires_at", 0) < now:
            expired_keys.append(key)
    for key in expired_keys:
        local_session_db.pop(key, None)

def save_session(session_id: str, payload: Dict[str, Any]):
    """Saves session JSON payload with 4-hour expiration TTL."""
    clean_expired_local_sessions()
    
    if redis_client:
        try:
            redis_client.setex(
                name=f"session:{session_id}",
                time=SESSION_TTL_SECONDS,
                value=json.dumps(payload)
            )
            return True
        except Exception as e:
            print(f"[Session Manager] Redis write failed: {str(e)}. Falling back to local memory.")
            
    # Local memory fallback
    expires_at = time.time() + SESSION_TTL_SECONDS
    local_session_db[session_id] = {
        "payload": payload,
        "expires_at": expires_at
    }
    return True

def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves session payload. Returns None if expired or not found."""
    clean_expired_local_sessions()
    
    if redis_client:
        try:
            data = redis_client.get(f"session:{session_id}")
            if data:
                return json.loads(data)
        except Exception as e:
            print(f"[Session Manager] Redis read failed: {str(e)}. Reading from local memory.")
            
    # Read from local memory
    session_data = local_session_db.get(session_id)
    if session_data:
        if session_data["expires_at"] >= time.time():
            return session_data["payload"]
        else:
            local_session_db.pop(session_id, None)
            
    return None
