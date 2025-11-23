import re
from datetime import date
from typing import Optional

from fastapi import HTTPException, status


def parse_date_or_none(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD")


def extract_owner_repo(url: str):
    pattern = r"github\.com/([^/]+)/([^/]+)"
    match = re.search(pattern, url)
    if match:
        return f"{match.group(1)}/{match.group(2)}"

    if "/" in url and len(url.split("/")) == 2:
        owner, repo = url.split("/")
        if owner.strip() and repo.strip():
            return f"{owner.strip()}/{repo.strip()}"

    return None