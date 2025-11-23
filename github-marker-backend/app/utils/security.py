import bcrypt
from fastapi import Response

from app.core.config import settings


def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    plain_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(plain_bytes, hashed_bytes)

def set_auth_cookies(response: Response, access_token_value: str, refresh_token_value: str):

    refresh_token_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    # HttpOnly refresh cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_value,
        httponly=True,
        secure=True,
        samesite='lax',
        path='/auth/refresh',
        max_age=refresh_token_age,
    )

    # HttpOnly access token cookie
    response.set_cookie(
        key="access_token",
        value=access_token_value,
        httponly=True,
        secure=True,
        samesite='lax',
        path='/',
    )
