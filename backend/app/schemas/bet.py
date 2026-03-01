import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class BetCreate(BaseModel):
    bet_card_id: uuid.UUID
    choice: str
    amount: int

    @field_validator("choice")
    @classmethod
    def validate_choice(cls, v: str) -> str:
        if v not in ("yes", "no"):
            raise ValueError("Choice must be 'yes' or 'no'")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class BetOut(BaseModel):
    id: str
    bet_card_id: str
    bet_card_title: str
    choice: str
    amount: int
    payout: Optional[int]
    placed_at: datetime
    new_balance: Optional[int] = None

    model_config = {"from_attributes": True}
