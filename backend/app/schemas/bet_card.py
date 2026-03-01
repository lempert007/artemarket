import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class BetCardCreate(BaseModel):
    title: str
    description: str
    closes_at: datetime
    resolves_at: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        return v


class UserBetInfo(BaseModel):
    choice: str
    amount: int


class BetCardOut(BaseModel):
    id: str
    title: str
    description: str
    created_by_username: str
    closes_at: datetime
    resolves_at: Optional[datetime]
    status: str
    outcome: Optional[str]
    total_pool: int
    yes_pool: int
    no_pool: int
    user_bet: Optional[UserBetInfo]

    model_config = {"from_attributes": True}


class ResolveRequest(BaseModel):
    outcome: str

    @field_validator("outcome")
    @classmethod
    def validate_outcome(cls, v: str) -> str:
        if v not in ("yes", "no", "cancel"):
            raise ValueError("Outcome must be 'yes', 'no', or 'cancel'")
        return v
