import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Bet(Base):
    __tablename__ = "bets"
    __table_args__ = (
        UniqueConstraint("user_id", "bet_card_id", name="uq_one_bet_per_user_card"),
        CheckConstraint("amount > 0", name="ck_bet_amount_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    bet_card_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bet_cards.id"), nullable=False, index=True
    )
    choice: Mapped[str] = mapped_column(String(3), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payout: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    placed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="bets")
    card: Mapped["BetCard"] = relationship("BetCard", back_populates="bets")
