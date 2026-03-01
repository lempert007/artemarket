import math
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bet import Bet
from app.models.bet_card import BetCard, BetCardOutcome, BetCardStatus
from app.models.user import User


async def place_bet(
    db: AsyncSession,
    user: User,
    bet_card_id: uuid.UUID,
    choice: str,
    amount: int,
) -> tuple[Bet, int]:
    result = await db.execute(select(BetCard).where(BetCard.id == bet_card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Bet card not found")
    if card.status != BetCardStatus.open:
        raise HTTPException(status_code=400, detail="Bet card is not open for betting")
    if card.closes_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Bet card has already closed")

    if amount > user.balance:
        raise HTTPException(
            status_code=400, detail=f"Insufficient balance: have {user.balance}, need {amount}"
        )

    existing = await db.execute(
        select(Bet).where(Bet.user_id == user.id, Bet.bet_card_id == bet_card_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already placed a bet on this card")

    user.balance -= amount
    card.total_pool += amount

    bet = Bet(
        user_id=user.id,
        bet_card_id=bet_card_id,
        choice=choice,
        amount=amount,
    )
    db.add(bet)
    await db.flush()
    await db.commit()
    await db.refresh(bet)
    await db.refresh(user)
    return bet, user.balance


async def resolve_card(
    db: AsyncSession,
    card_id: uuid.UUID,
    outcome: str,
) -> BetCard:
    result = await db.execute(
        select(BetCard).where(BetCard.id == card_id).with_for_update()
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Bet card not found")
    if card.status == BetCardStatus.resolved:
        raise HTTPException(status_code=400, detail="Bet card is already resolved")

    bets_result = await db.execute(select(Bet).where(Bet.bet_card_id == card_id))
    bets = list(bets_result.scalars().all())

    winning_bets = [b for b in bets if b.choice == outcome]
    losing_bets = [b for b in bets if b.choice != outcome]

    total_pool = sum(b.amount for b in bets)

    if not winning_bets:
        # No winners: refund everyone
        for bet in bets:
            bet.payout = bet.amount
            await db.execute(
                update(User).where(User.id == bet.user_id).values(balance=User.balance + bet.amount)
            )
    else:
        sum_winning = sum(b.amount for b in winning_bets)
        payouts = []
        for bet in winning_bets:
            p = math.floor(bet.amount / sum_winning * total_pool)
            payouts.append(p)

        distributed = sum(payouts)
        remainder = total_pool - distributed

        # Award remainder to largest winning bet
        max_idx = max(range(len(winning_bets)), key=lambda i: winning_bets[i].amount)
        payouts[max_idx] += remainder

        for bet, payout in zip(winning_bets, payouts):
            bet.payout = payout
            await db.execute(
                update(User).where(User.id == bet.user_id).values(balance=User.balance + payout)
            )

        for bet in losing_bets:
            bet.payout = 0

    card.outcome = BetCardOutcome(outcome)
    card.status = BetCardStatus.resolved

    await db.commit()
    await db.refresh(card)
    return card
