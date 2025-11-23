from sqlalchemy.orm import relationship

from app.db.setup import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Uuid, DateTime
from sqlalchemy.sql import func
from uuid import uuid4

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Uuid, primary_key=True, index=True, default=uuid4)
    github_repo_id = Column(Integer, index=True, nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    repo_name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    owner_id = Column(Integer, nullable=False)
    owner_avatar_url = Column(String(500))
    owner_url = Column(String(500))
    repo_url = Column(String(500))
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
