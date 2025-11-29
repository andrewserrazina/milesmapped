from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from app import schemas
from app.api.deps import get_db
from app.core import auth as core_auth
from app.core import security
from app.core.security import TokenType
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


def _create_token_pair(user_id: int) -> schemas.auth.TokenPair:
    access_token = security.create_token(
        {"sub": str(user_id)},
        expires_delta=timedelta(minutes=security.settings.access_token_expire_minutes),
        token_type=TokenType.ACCESS,
    )
    refresh_token = security.create_token(
        {"sub": str(user_id)},
        expires_delta=timedelta(minutes=security.settings.refresh_token_expire_minutes),
        token_type=TokenType.REFRESH,
    )
    return schemas.auth.TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/register", response_model=schemas.user.UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: schemas.auth.RegisterRequest,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = security.get_password_hash(user_in.password)
    user = User(email=user_in.email, full_name=user_in.full_name, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.auth.TokenPair)
def login(login_data: schemas.auth.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _create_token_pair(user.id)


@router.post("/refresh", response_model=schemas.auth.TokenPair)
def refresh_tokens(refresh_data: schemas.auth.RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = security.verify_token(refresh_data.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != TokenType.REFRESH:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _create_token_pair(user.id)


@router.get("/me", response_model=schemas.user.UserRead)
def read_current_user(current_user: User = Depends(core_auth.get_current_user)):
    return current_user
