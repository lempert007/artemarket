import enum
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BetCardStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    resolved = "resolved"


class BetCardOutcome(str, enum.Enum):
    yes = "yes"
    no = "no"
    cancel = "cancel"


class BetCard(Base):
    __tablename__ = "bet_cards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    closes_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    resolves_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    status: Mapped[BetCardStatus] = mapped_column(
        String(10), default=BetCardStatus.open, nullable=False, index=True
    )
    outcome: Mapped[Optional[BetCardOutcome]] = mapped_column(String(3), nullable=True)
    total_pool: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    bets: Mapped[List["Bet"]] = relationship("Bet", back_populates="card")
    creator: Mapped["User"] = relationship("User", back_populates="created_cards")
