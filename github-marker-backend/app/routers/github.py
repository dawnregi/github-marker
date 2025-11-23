from typing import Literal

from fastapi import APIRouter, status, Query, HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal

from app.schemas.github import SearchResponse
from app.service.github_service import search_github_users, search_github_repositories
from app.db.setup import get_db

router = APIRouter(prefix="/github", tags=["Github Search"])




@router.get(
    "/search",
    response_model=SearchResponse,
    summary="Search GitHub Users or Repositories with Pagination Metadata",
    status_code=status.HTTP_200_OK,
)
async def search_github_endpoint(
        search_type: Literal["user", "repo"] = Query(..., description="The type of search to perform: 'user' or 'repo'"),
        text: str = Query(..., description="The simple text string to search for (e.g., 'FastAPI')"),
        page: int = Query(1, ge=1, description="The page number to fetch (must be >= 1)"),
        limit: int = Query(10, ge=1, le=100, alias="per_page", description="The number of items per page (max 100)"),
        request: Request = None,
        db: AsyncSession = Depends(get_db),
):
    """
    Provides a proxy endpoint to search for users or repositories on GitHub.
    It automatically formats the simple search text into a structured GitHub query
    (e.g., 'text' becomes 'text in:login' or 'text in:name').

    Returns matching entities along with total count and pagination details.

    Note: Rate limits from GitHub apply to this API call.
    """

    # --- 1. Construct the Structured GitHub Query based on type ---
    github_query: str
    if search_type == "user":
        # Search for the text only within user logins
        github_query = f"{text} in:login"
    elif search_type == "repo":
        # Search for the text only within repository names
        github_query = f"{text} in:name"
    else:
        # This is a fallback, as Literal type should prevent it
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 'search type' specified. Must be 'user' or 'repo'."
        )

    if search_type == "user":
        github_response = await search_github_users(
            query=github_query,  # Pass the structured query
            page=page,
            per_page=limit
        )
    else:
        # Extract user_id from request context if available
        user_id = getattr(request.state, "user_id", None) if request else None
        github_response = await search_github_repositories(
            query=github_query,  # Pass the structured query
            page=page,
            per_page=limit,
            db=db if user_id else None,  # Pass db only if user is authenticated
            user_id=user_id
        )

    total_count = github_response.get("total_count", 0)
    items = github_response.get("items", [])
    has_next = (page * limit) < total_count
    has_prev = page > 1
    # 3. Construct the final structured response, including both queries
    final_response = SearchResponse(
        search_type=search_type, # The formatted query sent to GitHub
        search_text=text,  # The simple text from the user
        page=page,
        per_page=limit,
        total_count=total_count,
        items=items,
        has_next=has_next,
        has_prev=has_prev,
    )

    return final_response