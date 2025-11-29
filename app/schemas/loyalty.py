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
    user_id: int
    loyalty_program_id: int
    points_balance: int


class UserLoyaltyBalanceCreate(UserLoyaltyBalanceBase):
    last_updated: Optional[datetime] = None


class UserLoyaltyBalanceRead(UserLoyaltyBalanceBase):
    id: int
    last_updated: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
