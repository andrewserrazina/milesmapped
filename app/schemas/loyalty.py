from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.loyalty import LoyaltyProgramType


class LoyaltyProgramBase(BaseModel):
    name: str
    type: LoyaltyProgramType
    alliance: Optional[str] = None
    notes: Optional[str] = None


class LoyaltyProgramCreate(LoyaltyProgramBase):
    pass


class LoyaltyProgramRead(LoyaltyProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLoyaltyBalanceBase(BaseModel):
    loyalty_program_id: int
    points_balance: int


class UserLoyaltyBalanceCreate(UserLoyaltyBalanceBase):
    last_updated: Optional[datetime] = None


class UserLoyaltyBalanceRead(UserLoyaltyBalanceBase):
    user_id: int
    id: int
    last_updated: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLoyaltyBalanceWithProgram(UserLoyaltyBalanceRead):
    program_name: Optional[str] = None

    class Config:
        from_attributes = True


class UserLoyaltyBalanceUpsert(BaseModel):
    program_id: int
    points_balance: int
