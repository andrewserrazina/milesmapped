from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import schemas
from app.api.deps import get_db
from app.core import auth as core_auth
from app.core.email import (
    concierge_request_completed_html,
    concierge_request_received_html,
    send_email,
)
from app.models.search import ItineraryOption, SearchRequest, SearchStatus
from app.models.user import User

router = APIRouter(prefix="/concierge/requests", tags=["concierge"])


@router.post("/", response_model=schemas.search.SearchRequestRead, status_code=status.HTTP_201_CREATED)
def create_search_request(
    search_request_in: schemas.search.SearchRequestCreate,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(core_auth.get_current_user)],
):
    search_request = SearchRequest(
        **search_request_in.dict(),
        user_id=current_user.id,
        status=SearchStatus.NEW,
    )
    db.add(search_request)
    db.commit()
    db.refresh(search_request)

    send_email(
        to_email=current_user.email,
        subject="We're on it! Concierge request received",
        html_body=concierge_request_received_html(current_user.full_name, search_request),
    )
    return search_request


@router.get("/", response_model=list[schemas.search.SearchRequestRead])
def list_search_requests(
    status_filter: SearchStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(core_auth.get_current_user)],
):
    query = db.query(SearchRequest).filter(SearchRequest.user_id == current_user.id)
    if status_filter:
        query = query.filter(SearchRequest.status == status_filter)
    return query.order_by(SearchRequest.created_at.desc()).all()


@router.get("/{request_id}", response_model=schemas.search.SearchRequestDetail)
def get_search_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(core_auth.get_current_user)],
):
    search_request = db.query(SearchRequest).filter(SearchRequest.id == request_id).first()
    if not search_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if search_request.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return search_request


@router.post(
    "/{request_id}/itineraries",
    response_model=list[schemas.search.ItineraryOptionRead],
    status_code=status.HTTP_201_CREATED,
)
def add_itineraries(
    request_id: int,
    itineraries_in: list[schemas.search.ItineraryOptionCreate],
    db: Session = Depends(get_db),
    current_admin: Annotated[User, Depends(core_auth.get_current_admin)],
):
    search_request = db.query(SearchRequest).filter(SearchRequest.id == request_id).first()
    if not search_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    itinerary_objects = [
        ItineraryOption(search_request_id=request_id, **itinerary.dict())
        for itinerary in itineraries_in
    ]
    db.add_all(itinerary_objects)
    db.commit()
    for itinerary in itinerary_objects:
        db.refresh(itinerary)
    return itinerary_objects


@router.patch("/{request_id}", response_model=schemas.search.SearchRequestRead)
def update_search_request_status(
    request_id: int,
    status_update: schemas.search.SearchRequestStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: Annotated[User, Depends(core_auth.get_current_admin)],
):
    search_request = db.query(SearchRequest).filter(SearchRequest.id == request_id).first()
    if not search_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    search_request.status = status_update.status
    db.commit()
    db.refresh(search_request)

    if status_update.status == SearchStatus.COMPLETED:
        send_email(
            to_email=search_request.user.email,
            subject="Your MilesMapped itineraries are ready",
            html_body=concierge_request_completed_html(
                search_request.user.full_name, search_request, search_request.itinerary_options
            ),
        )
    return search_request

