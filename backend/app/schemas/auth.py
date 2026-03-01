import re

from pydantic import BaseModel, field_validator


class LoginRequest(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-z0-9_]{1,30}$", v):
            raise ValueError("Username must be 1–30 chars: letters, digits, underscore only")
        return v


class UserOut(BaseModel):
    id: str
    username: str
    is_admin: bool
    balance: int

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
