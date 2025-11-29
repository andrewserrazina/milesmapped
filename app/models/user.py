from __future__ import annotations

from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)

    search_requests: Mapped[List["SearchRequest"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    loyalty_balances: Mapped[List["UserLoyaltyBalance"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
