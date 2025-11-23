from datetime import datetime
import re
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

def validate_password_strength(value: str) -> str:
    """Shared password validation logic"""
    if not re.fullmatch(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$", value):
        # Raise a ValueError with your custom error message
        raise ValueError('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
    return value


class UserCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Name of the user"
    )
    email: EmailStr = Field(
        ...,
        description="Valid user email (will be validated automatically)"
    )
    password: str = Field(
        ...,
        min_length=8,
        description="User password"
    )

    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserLogin(BaseModel):
    email: EmailStr = Field(
        ...,
        description="Valid user email (will be validated automatically)"
    )
    password: str = Field(
        ...,
        description="Password of the User"
    )

