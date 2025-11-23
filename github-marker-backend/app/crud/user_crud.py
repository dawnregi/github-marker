from fastapi import HTTPException, status
from pydantic import EmailStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users import User
from app.utils.security import hash_password
from app.schemas.user import UserCreate
from sqlalchemy.future import select


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    hashed = hash_password(user_in.password)
    user = User(name=user_in.name, email=str(user_in.email), hashed_password=hashed)
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

async def get_user_by_email(db: AsyncSession, email: EmailStr):
    query = select(User).where(User.email == str(email))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: str):
    query = select(User).where(User.id == str(user_id))
    result = await db.execute(query)
    return result.scalar_one_or_none()

