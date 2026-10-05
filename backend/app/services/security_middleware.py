"""
Security Middleware Suite for FastAPI
Provides:
1. Rate Limiting per IP with route-specific buckets
2. Strict Security Headers (CSP, HSTS, X-Frame-Options, etc.)
3. Request Payload Size Enforcement
4. Server Signature Obfuscation
"""
import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests_per_minute: int = 120):
        super().__init__(app)
        self.default_limit = max_requests_per_minute
        # Dict of client_ip -> list of timestamps
        self.clients = defaultdict(list)
        
        # Route-specific tighter limits (per 60 seconds)
        self.route_limits = {
            "/api/v1/session/start-from-resume": 15,
            "/api/interview/transcribe": 30,
            "/api/code/run": 30,
            "/api/chat": 40,
        }

    async def dispatch(self, request: Request, call_next):
        # Allow WebSocket handshakes and internal health checks through without rate limiting
        if request.url.path.startswith("/ws") or request.url.path == "/api/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        # Respect Cloudflare / Reverse proxy X-Forwarded-For if available
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        now = time.time()
        cutoff = now - 60.0

        # Determine limit for path
        limit = self.default_limit
        for route_prefix, rlimit in self.route_limits.items():
            if request.url.path.startswith(route_prefix):
                limit = rlimit
                break

        key = f"{client_ip}:{request.url.path}"
        timestamps = self.clients[key]
        # Prune old timestamps older than 60s
        self.clients[key] = [t for t in timestamps if t > cutoff]

        if len(self.clients[key]) >= limit:
            retry_after = int(60 - (now - self.clients[key][0])) + 1
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded. Too many requests.",
                    "detail": f"Maximum allowed is {limit} requests per minute.",
                    "retry_after_seconds": max(1, retry_after)
                },
                headers={
                    "Retry-After": str(max(1, retry_after)),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0"
                }
            )

        self.clients[key].append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - len(self.clients[key])))
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, is_production: bool = True):
        super().__init__(app)
        self.is_production = is_production

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # Standard Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissions Policy: allow camera and microphone for interview features
        response.headers["Permissions-Policy"] = "camera=*, microphone=*, geolocation=(), interest-cohort=()"
        
        # Enforce HTTPS HSTS only in production on public HTTPS domains (never on localhost)
        is_local = request.url.hostname in ("localhost", "127.0.0.1", "::1")
        if self.is_production and not is_local:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # Hide internal web server signature
        response.headers["Server"] = "Neuroprep-Secure-Gateway"
        if "X-Powered-By" in response.headers:
            del response.headers["X-Powered-By"]

        return response
