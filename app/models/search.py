from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Date, DateTime, Enum as SqlEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


class SearchStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CLOSED = "closed"


class ItinerarySource(str, Enum):
    MANUAL = "manual"
    API = "api"


class SearchRequest(TimestampMixin, Base):
    __tablename__ = "search_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    origin: Mapped[str] = mapped_column(String, nullable=False)
    destination: Mapped[str] = mapped_column(String, nullable=False)
    departure_date: Mapped[date] = mapped_column(Date, nullable=False)
    return_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    cabin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    passengers: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[SearchStatus] = mapped_column(
        SqlEnum(SearchStatus, name="search_status"),
        nullable=False,
        server_default=SearchStatus.NEW.value,
    )

    user: Mapped["User"] = relationship(back_populates="search_requests")
    itinerary_options: Mapped[List["ItineraryOption"]] = relationship(
        back_populates="search_request", cascade="all, delete-orphan"
    )


class ItineraryOption(TimestampMixin, Base):
    __tablename__ = "itinerary_options"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    search_request_id: Mapped[int] = mapped_column(
        ForeignKey("search_requests.id"), nullable=False
    )
    carrier: Mapped[str] = mapped_column(String, nullable=False)
    flight_numbers: Mapped[str] = mapped_column(String, nullable=False)
    departure_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    arrival_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cabin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cash_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    points_price: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    taxes_and_fees: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    booking_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[ItinerarySource] = mapped_column(
        SqlEnum(ItinerarySource, name="itinerary_source"), nullable=False
    )

    search_request: Mapped[SearchRequest] = relationship(back_populates="itinerary_options")
