from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.models.search import ItinerarySource, SearchStatus


class SearchRequestBase(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    cabin: Optional[str] = None
    passengers: int
    notes: Optional[str] = None


class SearchRequestCreate(SearchRequestBase):
    pass


class SearchRequestRead(SearchRequestBase):
    id: int
    user_id: int
    status: SearchStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SearchRequestDetail(SearchRequestRead):
    itinerary_options: list["ItineraryOptionRead"] = []


class SearchRequestStatusUpdate(BaseModel):
    status: SearchStatus


class ItineraryOptionBase(BaseModel):
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
    search_request_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


SearchRequestDetail.model_rebuild()

