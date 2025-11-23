# app/middleware/auth_middleware.py
from typing import List, Optional, Set, Dict
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from jose import ExpiredSignatureError, JWTError
from app.core.config import settings
from app.service.auth_service import verify_token  # import your verify_token implementation

# Build a set of allowed origins for quick checks (from settings.cors_origins_list)
ALLOWED_ORIGINS: Set[str] = set(settings.cors_origins_list or [])

EXCLUDED_PATHS = [
    "/", "/auth/login", "/auth/register", "/auth/refresh",
    "/openapi.json", "/docs", "/redoc", "/docs/oauth2-redirect", "/health",
]

def is_excluded_path(path: str, excluded: Optional[List[str]] = None) -> bool:
    excluded = excluded or EXCLUDED_PATHS
    return any(path == p or path.startswith(p + "/") for p in excluded)


def get_cors_headers(request: Request) -> Dict[str, str]:
    """Helper function to create necessary CORS headers if origin is allowed."""
    origin = request.headers.get("origin")
    headers = {}
    if origin and origin in ALLOWED_ORIGINS:
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return headers


async def auth_http_middleware(request: Request, call_next):
    path = request.url.path

    # let preflight and excluded paths through
    if request.method == "OPTIONS" or is_excluded_path(path):
        return await call_next(request)

    access_token = request.cookies.get("access_token")
    if not access_token:
        # Use helper for headers
        headers = get_cors_headers(request)
        return JSONResponse(
            status_code=401,
            content={"detail": "Authentication is required"},
            headers=headers
        )

    try:
        # verify_token is expected to raise HTTPException on invalid/expired token
        user_payload = verify_token(access_token)

        # If verify_token returns an empty/None value on success, handle it (rare for JWT)
        # If it returns None on failure, and doesn't raise, keep the block below.
        # If it only returns payload or raises, this block can be removed (see point 2)
        if not user_payload:
            headers = get_cors_headers(request)
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication failed (no payload)"},
                headers=headers
            )

        request.state.user_id = user_payload
        response = await call_next(request)
        return response

    except HTTPException as http_exc:
        # This catches errors raised by verify_token (e.g., expired token)
        headers = get_cors_headers(request)
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail},
            headers=headers
        )

    except Exception as e:
        # unexpected server error - use proper logging here!
        print(f"ERROR: Unexpected error in auth middleware for path {path}: {e}")  # Use logging.error() instead
        headers = get_cors_headers(request)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected server error occurred during authentication."},
            headers=headers
        )