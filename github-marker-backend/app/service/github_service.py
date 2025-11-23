import httpx
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.github import GitHubUser, GitHubRepo
from app.core.config import settings
from app.schemas.bookmark import BookmarkCreate
from app.crud.bookmark_crud import is_repo_bookmarked


_HTTPX_TIMEOUT = httpx.Timeout(10.0, connect=5.0)


async def _get_json(url: str, client: Optional[httpx.AsyncClient] = None) -> Optional[Dict[str, Any]]:
    created_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=_HTTPX_TIMEOUT)
        created_client = True

    try:
        resp = await client.get(url)
    except httpx.RequestError as exc:
        if created_client:
            await client.aclose()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to GitHub: {exc}"
        )

    # handle 404 as None
    if resp.status_code == 404:
        if created_client:
            await client.aclose()
        return None

    # other client/server errors
    if resp.status_code >= 400:
        text = resp.text
        if created_client:
            await client.aclose()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub returned status {resp.status_code}: {text[:300]}"
        )

    data = resp.json()
    if created_client:
        await client.aclose()
    return data


def _build_bookmark_from_repo_json(repo: Dict[str, Any]) -> BookmarkCreate:
    owner = repo.get("owner") or {}

    payload = {
        "repo_name": repo.get("name"),
        "repo_url": repo.get("html_url"),
        "repo_id": repo.get("id"),
        "owner_name": owner.get("login"),
        "owner_id": owner.get("id"),
        "owner_avatar_url": owner.get("avatar_url"),
        "owner_url": owner.get("html_url"),
        "description": repo.get("description"),
        "full_name": f"{owner.get('login')}/{repo.get('name')}"
    }

    try:
        item = BookmarkCreate(**payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse GitHub repo data: {e}"
        ) from e

    return item


async def search_github_users(
        query: str, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=_HTTPX_TIMEOUT) as client:
        try:
            params = {
                "q": query,
                "page": page,
                "per_page": per_page
            }
            response = await client.get(settings.github_search_user_path, params=params)
            response.raise_for_status()
            data = response.json()
            items = [GitHubUser(**item) for item in data.get("items", [])]
            return {"total_count": data.get("total_count", 0), "items": items}

        except httpx.HTTPStatusError as e:
            print(f"GitHub API HTTP error: {e.response.status_code} - {e.response.text}")
            return {"total_count": 0, "items": []}
        except httpx.RequestError as e:
            print(f"An error occurred while requesting GitHub API: {e}")
            return {"total_count": 0, "items": []}


async def search_github_repositories(
        query: str, page: int = 1, per_page: int = 10, db: Optional[AsyncSession] = None, user_id: Optional[str] = None) -> Dict[str, Any]:

    async with httpx.AsyncClient(timeout=_HTTPX_TIMEOUT) as client:
        try:
            params = {
                "q": query,
                "page": page,
                "per_page": per_page
            }

            response = await client.get(settings.github_search_repos_path, params=params)
            response.raise_for_status()

            data = response.json()
            items = [GitHubRepo(**item) for item in data.get("items", [])]

            # Check if each repo is already bookmarked by the user
            if db and user_id:
                for item in items:
                    is_bookmarked, bookmark_id = await is_repo_bookmarked(db, item.id, user_id)
                    item.isAdded = is_bookmarked
                    item.bookmarkId = bookmark_id

            return {"total_count": data.get("total_count", 0), "items": items}

        except httpx.HTTPStatusError as e:
            print(f"GitHub API error:{e}")
            return {"total_count": 0, "items": []}
        except httpx.RequestError as e:
            print(f"An error occurred while requesting GitHub Repositories: {e}")
            return {"total_count": 0, "items": []}


async def get_repository_byid(repo_id: int, client: Optional[httpx.AsyncClient] = None) -> BookmarkCreate | None:

    url = f"{settings.GITHUB_API_BASE_URL}repositories/{repo_id}"
    repo_json = await _get_json(url, client=client)
    if repo_json is None:
        return None
    return _build_bookmark_from_repo_json(repo_json)


async def validate_github_repo(owner_repo: str, client: Optional[httpx.AsyncClient] = None) -> BookmarkCreate | None:

    if "/" not in owner_repo:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="owner_repo must be in owner/repo format")

    url = f"{settings.GITHUB_API_BASE_URL}repos/{owner_repo}"
    repo_json = await _get_json(url, client=client)
    if repo_json is None:
        return None
    return _build_bookmark_from_repo_json(repo_json)
