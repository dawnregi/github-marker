from typing import Literal, List, Union

from pydantic import BaseModel

SearchType = Literal["user", "repo"]

class GitHubUser(BaseModel):
    login: str
    id: int
    avatar_url: str
    html_url: str

class GitHubRepo(BaseModel):
    id: int
    name: str
    full_name: str
    owner: GitHubUser
    html_url: str
    description: str | None = None
    isAdded: bool = False  # Indicates if this repo is already bookmarked by the user
    bookmarkId: str | None = None  # The bookmark id from the bookmarks table (if isAdded is true)

class SearchResponse(BaseModel):
    search_type: SearchType
    search_text: str
    page: int
    per_page: int
    total_count: int
    has_next: bool
    has_prev: bool
    items: List[Union[GitHubUser, GitHubRepo]]




