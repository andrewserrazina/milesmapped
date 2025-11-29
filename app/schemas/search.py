from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.models.search import ItinerarySource, SearchStatus


class SearchRequestBase(BaseModel):
    user_id: int
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    cabin: Optional[str] = None
    passengers: int
    notes: Optional[str] = None
    status: SearchStatus = SearchStatus.NEW


class SearchRequestCreate(SearchRequestBase):
    pass


class SearchRequestRead(SearchRequestBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ItineraryOptionBase(BaseModel):
    search_request_id: int
    carrier: str
    flight_numbers: str
    departure_time: datetime
    arrival_time: datetime
    cabin: Optional[str] = None
    cash_price: Optional[float] = None
    points_price: Optional[int] = None
    taxes_and_fees: Optional[float] = None
    booking_instructions: Optional[str] = None
    source: ItinerarySource


class ItineraryOptionCreate(ItineraryOptionBase):
    pass


class ItineraryOptionRead(ItineraryOptionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
