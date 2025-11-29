from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.api.deps import get_db
from app.core import auth as core_auth
from app.models.loyalty import LoyaltyProgram, UserLoyaltyBalance
from app.models.user import User

router = APIRouter(prefix="/loyalty", tags=["loyalty"])


@router.get("/programs", response_model=list[schemas.loyalty.LoyaltyProgramRead])
def list_loyalty_programs(
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(core_auth.get_current_user)],
):
    return db.query(LoyaltyProgram).order_by(LoyaltyProgram.name.asc()).all()


@router.get("/balances", response_model=list[schemas.loyalty.UserLoyaltyBalanceWithProgram])
def list_loyalty_balances(
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(core_auth.get_current_user)],
):
    balances = (
        db.query(UserLoyaltyBalance)
        .join(UserLoyaltyBalance.loyalty_program)
        .filter(UserLoyaltyBalance.user_id == current_user.id)
        .order_by(LoyaltyProgram.name.asc())
        .all()
    )

    for balance in balances:
        if balance.loyalty_program:
            balance.program_name = balance.loyalty_program.name

    return balances


@router.post(
    "/balances",
    response_model=schemas.loyalty.UserLoyaltyBalanceWithProgram,
    status_code=status.HTTP_201_CREATED,
)
def upsert_loyalty_balance(
    balance_in: schemas.loyalty.UserLoyaltyBalanceUpsert,
    db: Session = Depends(get_db),
    current_user: Annotated[User, Depends(core_auth.get_current_user)],
):
    program = (
        db.query(LoyaltyProgram)
        .filter(LoyaltyProgram.id == balance_in.program_id)
        .first()
    )
    if program is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    balance = (
        db.query(UserLoyaltyBalance)
        .filter(
            UserLoyaltyBalance.user_id == current_user.id,
            UserLoyaltyBalance.loyalty_program_id == balance_in.program_id,
        )
        .first()
    )

    if balance:
        balance.points_balance = balance_in.points_balance
    else:
        balance = UserLoyaltyBalance(
            user_id=current_user.id,
            loyalty_program_id=balance_in.program_id,
            points_balance=balance_in.points_balance,
        )
        db.add(balance)

    db.commit()
    db.refresh(balance)

    balance.program_name = program.name
    return balance
