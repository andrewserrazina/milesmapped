from datetime import date, datetime
from typing import Annotated

from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.api.deps import get_db
from app.core import auth as core_auth
from app.models.search import SearchRequest, SearchStatus
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/search-requests", response_model=list[schemas.search.SearchRequestRead])
def list_search_requests(
    _: Annotated[User, Depends(core_auth.get_current_admin)],
    status_filter: SearchStatus | None = Query(default=None, alias="status"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    user_email: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(SearchRequest).join(User)

    if status_filter:
        query = query.filter(SearchRequest.status == status_filter)
    if start_date:
        query = query.filter(
            SearchRequest.created_at >= datetime.combine(start_date, datetime.min.time())
        )
    if end_date:
        query = query.filter(
            SearchRequest.created_at <= datetime.combine(end_date, datetime.max.time())
        )
    if user_email:
        query = query.filter(User.email.ilike(f"%{user_email}%"))

    return query.order_by(SearchRequest.created_at.desc()).all()


@router.get(
    "/search-requests/{request_id}",
    response_model=schemas.search.SearchRequestDetail,
)
def get_search_request_detail(
    request_id: int,
    _: Annotated[User, Depends(core_auth.get_current_admin)],
    db: Session = Depends(get_db),
):
    search_request = (
        db.query(SearchRequest)
        .options(joinedload(SearchRequest.itinerary_options))
        .filter(SearchRequest.id == request_id)
        .first()
    )
    if not search_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return search_request


@router.patch(
    "/search-requests/{request_id}",
    response_model=schemas.search.SearchRequestDetail,
)
def update_search_request(
    request_id: int,
    search_request_update: schemas.search.SearchRequestAdminUpdate,
    _: Annotated[User, Depends(core_auth.get_current_admin)],
    db: Session = Depends(get_db),
):
    search_request = db.query(SearchRequest).filter(SearchRequest.id == request_id).first()
    if not search_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if search_request_update.status is None and search_request_update.admin_notes is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No updates provided"
        )

    if search_request_update.status is not None:
        search_request.status = search_request_update.status
    if search_request_update.admin_notes is not None:
        search_request.admin_notes = search_request_update.admin_notes

    db.commit()
    db.refresh(search_request)

    return search_request
