from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.api.deps import get_db
from app.core import security
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=schemas.user.UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user_in: schemas.user.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = security.get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        hashed_password=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/", response_model=list[schemas.user.UserRead])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()
