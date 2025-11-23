import csv
import io
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Request, Depends, Query, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID


from app.schemas.bookmark import BookmarkResponse, BookmarkStatsResponse
from app.crud.bookmark_crud import create_bookmark, get_bookmark_by_full_name, delete_bookmark, get_bookmark_counts_by_date, get_user_bookmarks, get_total_bookmarks_count, get_today_bookmarks_count
from app.db.setup import get_db
from app.service.github_service import get_repository_byid
from app.schemas.bookmark import BookmarkListResponse
from app.utils.helpers import parse_date_or_none
from app.utils.helpers import extract_owner_repo
from app.schemas.bookmark import ImportResult
from app.service.github_service import validate_github_repo
from app.models import Bookmark

router = APIRouter(prefix="/bookmark", tags=["Manage Bookmarks"])





@router.post("/add", response_model=BookmarkResponse)
async def create_bookmark_endpoint(

    request: Request,
    db: AsyncSession = Depends(get_db),
    repo_id: int = Query(
        ...,
        description="The GitHub repository ID you want to bookmark"
    )
):
    item_in = await get_repository_byid(repo_id)
    if not item_in:
        raise HTTPException(status_code=404, detail="Repository not found")
    user_id = request.state.user_id
    if user_id is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return await create_bookmark(db, item_in, user_id)

@router.get("/list", response_model=BookmarkListResponse)
async def list_my_bookmarks(
    request: Request,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
):
    # user_id from middleware
    try:
        user_id = request.state.user_id
    except AttributeError:
        raise HTTPException(status_code=401, detail="Unauthorized")

    items, total = await get_user_bookmarks(db, user_id, page=page, per_page=per_page)

    has_next = (page * per_page) < total
    has_prev = page > 1

    return BookmarkListResponse(
        items=items,
        page=page,
        per_page=per_page,
        total=total,
        has_next=has_next,
        has_prev=has_prev,
    )

@router.delete("/{bookmark_id}")
async def remove_bookmark(
    bookmark_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return await delete_bookmark(db, str(bookmark_id), user_id)

@router.get("/stats", response_model=BookmarkStatsResponse)
async def bookmark_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    s_date = parse_date_or_none(start_date)
    e_date = parse_date_or_none(end_date)

    # Get total bookmark count
    total_bookmarks = await get_total_bookmarks_count(db, user_id=str(user_id))

    # Get today's bookmark count
    today_count = await get_today_bookmarks_count(db, user_id=str(user_id))

    # Get date breakdown
    rows = await get_bookmark_counts_by_date(db, user_id=str(user_id), start_date=s_date, end_date=e_date)

    return BookmarkStatsResponse(
        total_bookmarks=total_bookmarks,
        today_count=today_count,
        data=rows
    )


@router.post("/import", response_model=ImportResult)
async def import_bookmarks(
        request: Request,
        file: UploadFile = File(...),
        db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV.")

    # Read and decode CSV
    user_id = request.state.user_id
    if user_id is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    content = await file.read()
    decoded_content = content.decode('utf-8')
    csv_reader = csv.reader(io.StringIO(decoded_content))

    # Skip header if present (optional logic, assumes first row is header if it says "url")
    rows = list(csv_reader)

    successful = 0
    failed = 0
    errors = []


    for row in rows:
            # Assume URL is in the first column of the CSV
            if not row: continue
            raw_url = row[0].strip()

            # skips header row strictly for this example
            if raw_url.lower() == "url": continue

            owner_repo = extract_owner_repo(raw_url)

            if not owner_repo:
                failed += 1
                errors.append(f"Invalid URL format: {raw_url}")
                continue

            # Validate against GitHub API
            try:
                item_in = await validate_github_repo(owner_repo)
            except HTTPException:
                failed += 1
                errors.append(f"Repo not found on GitHub: {raw_url}")
                continue
            is_exist = await get_bookmark_by_full_name(db, item_in.full_name, user_id)

            if is_exist:
                failed += 1
                errors.append(f"Bookmark already exists for {raw_url}")
                continue
            if item_in:
                try:
                    item = Bookmark(
                        repo_name=item_in.repo_name,
                        github_repo_id=item_in.repo_id,
                        owner_name=item_in.owner_name,
                        owner_id=item_in.owner_id,
                        owner_avatar_url=item_in.owner_avatar_url,
                        owner_url=item_in.owner_url,
                        repo_url=str(item_in.repo_url),
                        description=item_in.description,
                        full_name=item_in.full_name,
                        user_id=user_id,
                    )
                    db.add(item)
                    successful += 1
                except Exception as e:
                    failed += 1
                    errors.append(f"Failed to save bookmark for {raw_url}: {str(e)}")
            else:
                failed += 1
                errors.append(f"Repo not found on GitHub: {raw_url}")

    await db.commit()

    return ImportResult(
        total_processed=len(rows),
        successful_imports=successful,
        failed_imports=failed,
        errors=errors
    )