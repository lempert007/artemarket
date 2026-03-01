from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    balance: Mapped[int] = mapped_column(Integer, default=1000, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    bets: Mapped[list["Bet"]] = relationship("Bet", back_populates="user")
    created_cards: Mapped[list["BetCard"]] = relationship("BetCard", back_populates="creator")
