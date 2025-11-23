from datetime import date
from typing import List, Optional, Dict, Any

from sqlalchemy import select, func
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.bookmark import BookmarkCreate, BookmarkOut
from app.models import Bookmark


async def get_bookmark_by_full_name(
    db: AsyncSession,
    full_name: str,
    user_id: str
) -> Optional[Bookmark]:
    """
    Fetch an existing bookmark by full_name and user_id.
    Returns the bookmark if found, None otherwise.
    """
    q = select(Bookmark).where(
        Bookmark.full_name == full_name,
        Bookmark.user_id == user_id
    )
    res = await db.execute(q)
    return res.scalars().first()


async def is_repo_bookmarked(
    db: AsyncSession,
    repo_id: int,
    user_id: str
) -> tuple[bool, Optional[str]]:
    """
    Check if a repository is already bookmarked by the user.
    Returns a tuple of (is_bookmarked: bool, bookmark_id: Optional[str]).
    If bookmarked, returns (True, bookmark_id). If not, returns (False, None).
    """
    q = select(Bookmark).where(
        Bookmark.github_repo_id == repo_id,
        Bookmark.user_id == user_id
    )
    res = await db.execute(q)
    bookmark = res.scalars().first()
    if bookmark:
        return True, str(bookmark.id)
    return False, None


async def create_bookmark(db: AsyncSession, item_in: BookmarkCreate, user_id: str):
    q = select(Bookmark).where(
        Bookmark.github_repo_id == item_in.repo_id,
        Bookmark.user_id == user_id
    )
    res = await db.execute(q)
    existing = res.scalars().first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bookmark already exists")

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
    await db.commit()
    await db.refresh(item)
    return item

async def get_user_bookmarks(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    per_page: int = 10,
) -> tuple[List[BookmarkOut], int]:
    if page < 1:
        page = 1
    offset = (page - 1) * per_page

    # main query (paginated)
    stmt = (
        select(Bookmark)
        .where(Bookmark.user_id == user_id)
        .order_by(Bookmark.id.desc())   # change ordering if you have created_at
        .offset(offset)
        .limit(per_page)
    )
    result = await db.execute(stmt)
    items = [BookmarkOut.model_validate(item) for item in result.scalars().all()]

    # total count for this user
    count_stmt = select(func.count()).select_from(Bookmark).where(Bookmark.user_id == user_id)
    total_result = await db.execute(count_stmt)
    total = int(total_result.scalar_one() or 0)

    return items, total

async def delete_bookmark(db: AsyncSession, bookmark_id: str, user_id: str):
    # Fetch the bookmark and ensure it belongs to the user
    stmt = select(Bookmark).where(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == user_id
    )
    result = await db.execute(stmt)
    item = result.scalars().first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )

    await db.delete(item)
    await db.commit()

    return {"message": "Bookmark deleted successfully"}

async def get_bookmark_counts_by_date(
    db: AsyncSession,
    user_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[Dict[str, Any]]:
    """
    Returns list of {"date": "YYYY-MM-DD", "count": N} for the given user.
    Groups by DATE(created_at).

    Note: end_date is inclusive - includes all records created on that day.
    """
    from datetime import datetime

    # base statement: select date(created_at) as day, count(*) as c
    day_expr = func.date(Bookmark.created_at)  # works in sqlite/postgres/mysql
    stmt = (
        select(day_expr.label("day"), func.count().label("count"))
        .where(Bookmark.user_id == user_id)
    )

    if start_date:
        # Convert date to datetime at start of day
        start_datetime = datetime.combine(start_date, datetime.min.time())
        stmt = stmt.where(Bookmark.created_at >= start_datetime)

    if end_date:
        # Convert end_date to datetime at END of day (23:59:59.999999)
        end_datetime = datetime.combine(end_date, datetime.max.time())
        stmt = stmt.where(Bookmark.created_at <= end_datetime)

    stmt = stmt.group_by(day_expr).order_by(day_expr.asc())

    result = await db.execute(stmt)
    rows = result.all()  # list of Row(day=<date str or date>, count=<int>)

    output = []
    for row in rows:
        # row[0] is day (string or date depending on dialect), row[1] is count
        day_value = row[0]
        if hasattr(day_value, "isoformat"):
            day_str = day_value.isoformat()
        else:
            # if DB returns string already, try to normalize to YYYY-MM-DD
            day_str = str(day_value)
        output.append({"date": day_str, "count": int(row[1])})

    return output

async def get_total_bookmarks_count(
    db: AsyncSession,
    user_id: str
) -> int:
    """
    Returns the total number of bookmarks for the given user.
    """
    stmt = select(func.count()).select_from(Bookmark).where(Bookmark.user_id == user_id)
    result = await db.execute(stmt)
    return int(result.scalar_one() or 0)


async def get_today_bookmarks_count(
    db: AsyncSession,
    user_id: str
) -> int:
    """
    Returns the count of bookmarks added today (by the given user).
    Today is defined as the current date from 00:00:00 to 23:59:59.
    """
    from datetime import datetime, date as date_type

    today = date_type.today()
    start_datetime = datetime.combine(today, datetime.min.time())
    end_datetime = datetime.combine(today, datetime.max.time())

    stmt = select(func.count()).select_from(Bookmark).where(
        Bookmark.user_id == user_id,
        Bookmark.created_at >= start_datetime,
        Bookmark.created_at <= end_datetime
    )
    result = await db.execute(stmt)
    return int(result.scalar_one() or 0)

