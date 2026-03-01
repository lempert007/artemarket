from datetime import datetime, timezone

from sqlalchemy import update

from app.database import AsyncSessionLocal
from app.models.bet_card import BetCard, BetCardStatus


async def close_expired_bet_cards() -> None:
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        await db.execute(
            update(BetCard)
            .where(BetCard.status == BetCardStatus.open, BetCard.closes_at <= now)
            .values(status=BetCardStatus.closed)
        )
        await db.commit()
