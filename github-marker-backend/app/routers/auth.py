from fastapi import APIRouter, Depends, status, Response, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.user_crud import create_user
from app.db.setup import get_db
from app.schemas.user import UserOut, UserCreate, UserLogin
from app.service.auth_service import create_access_token, create_refresh_token, verify_token
from app.utils.security import verify_password
from app.crud.user_crud import get_user_by_email, get_user_by_id
from app.core.config import settings
from app.utils.security import set_auth_cookies

router = APIRouter(prefix="/auth", tags=["auth"])





@router.post('/register', response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    user = await create_user(db, user_in)
    access = create_access_token(subject=str(user.id))
    refresh = create_refresh_token(subject=str(user.id))
    set_auth_cookies(response, access, refresh)
    return user


@router.post('/login', response_model=UserOut)
async def login(form_data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form_data.email)
    if not user or not user.is_active or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access = create_access_token(subject=str(user.id))
    refresh = create_refresh_token(subject=str(user.id))
    set_auth_cookies(response, access, refresh)
    return user


@router.post('/refresh', response_model=UserOut, status_code=status.HTTP_200_OK)
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    # Read refresh token from cookie
    refresh = request.cookies.get('refresh_token')
    if not refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    # verify refresh token
    user_id = verify_token(refresh, expected_type='refresh')
    user_details = await get_user_by_id(db, user_id)

    if not user_details or not user_details.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid User")
    access = create_access_token(subject=str(user_details.id))
    refresh = create_refresh_token(subject=str(user_details.id))
    set_auth_cookies(response, access, refresh)
    return user_details


@router.get("/me", response_model=UserOut)
async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    user_details = await get_user_by_id(db, user_id)
    if not user_details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user_details


@router.post('/logout', status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """
    Logout endpoint that clears authentication cookies.
    """
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    response.delete_cookie(key="logged_in")
    return {"message": "Logged out successfully"}

