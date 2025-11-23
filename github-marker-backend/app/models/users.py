from sqlalchemy import Column, String, Boolean, DateTime, Uuid
from sqlalchemy.sql import func
from app.db.setup import Base
from uuid import uuid4

class User(Base):
    __tablename__ = "users"
    id = Column(Uuid, primary_key=True, index=True, default=uuid4)
    name = Column(String(128), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())