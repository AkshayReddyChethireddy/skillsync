from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..schemas.auth import Token, LoginRequest
from ..schemas.user import UserCreate, UserRead, UserUpdate, PasswordChange
from ..services.auth_service import hash_password, verify_password, create_access_token
from ..dependencies import get_current_user
from ..config import get_settings
from ..utils.exceptions import conflict, bad_request

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    # Check uniqueness
    existing = db.execute(
        select(User).where((User.email == data.email) | (User.username == data.username))
    ).scalar_one_or_none()
    if existing:
        if existing.email == data.email:
            raise conflict("A user with this email already exists")
        raise conflict("A user with this username already exists")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(User.email == data.email)
    ).scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    token = create_access_token(str(user.id))
    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise bad_request("Current password is incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
