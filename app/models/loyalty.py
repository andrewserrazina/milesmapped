from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


class LoyaltyProgramType(str, Enum):
    AIRLINE = "airline"
    HOTEL = "hotel"


class LoyaltyProgram(TimestampMixin, Base):
    __tablename__ = "loyalty_programs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    type: Mapped[LoyaltyProgramType] = mapped_column(
        SqlEnum(LoyaltyProgramType, name="loyalty_program_type"), nullable=False
    )
    alliance: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    balances: Mapped[List["UserLoyaltyBalance"]] = relationship(
        back_populates="loyalty_program", cascade="all, delete-orphan"
    )


class UserLoyaltyBalance(TimestampMixin, Base):
    __tablename__ = "user_loyalty_balances"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    loyalty_program_id: Mapped[int] = mapped_column(
        ForeignKey("loyalty_programs.id"), nullable=False
    )
    points_balance: Mapped[int] = mapped_column(Integer, nullable=False)
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="loyalty_balances")
    loyalty_program: Mapped[LoyaltyProgram] = relationship(back_populates="balances")
