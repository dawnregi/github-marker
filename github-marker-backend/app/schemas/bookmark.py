from typing import List

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class BookmarkBase(BaseModel):
    repo_name: str
    repo_url: str
    owner_name: str
    owner_id: int
    owner_avatar_url: str | None = None
    owner_url: str
    description: str | None = None,
    full_name: str


class BookmarkCreate(BookmarkBase):
    repo_id: int


class BookmarkOut(BookmarkBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: UUID


class BookmarkResponse(BookmarkBase):
    id: UUID
    repo_id: int = Field(alias="github_repo_id")


class BookmarkListResponse(BaseModel):
    items: List[BookmarkOut]
    page: int
    per_page: int
    total: int
    has_next: bool
    has_prev: bool


class DateCount(BaseModel):
    date: str
    count: int

class BookmarkStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    total_bookmarks: int
    today_count: int
    data: List[DateCount]

class ImportResult(BaseModel):
    total_processed: int
    successful_imports: int
    failed_imports: int
    errors: list[str]