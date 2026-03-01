import uuid

from pydantic import BaseModel


class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    is_admin: bool
    balance: int

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    balance: int
    total_bets: int
    won: int
    win_rate: float


class UserStats(BaseModel):
    username: str
    balance: int
    total_bets: int
    won: int
    lost: int
    pending: int
    total_wagered: int
    total_won: int
    net_profit: int
