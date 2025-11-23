from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.config import settings
from fastapi import HTTPException, status
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError


# To create an access token
def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


# Function for creating refresh tokens
def create_refresh_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    # default 7 days
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


# To verify a token and extract the subject


def verify_token(token: str, expected_type: Optional[str] = None) -> str:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True}   # <--- IMPORTANT
        )
        print(payload, "payload")
        sub: str = payload.get("sub")
        ttype: str = payload.get("type")

        if sub is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        if expected_type and ttype != expected_type:
            raise HTTPException(status_code=401, detail="Invalid token type")

        return sub

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="ACCESS_TOKEN_EXPIRED"
        )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
