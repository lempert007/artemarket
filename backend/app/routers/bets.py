from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.bet import Bet
from app.models.bet_card import BetCard
from app.models.user import User
from app.schemas.bet import BetCreate, BetOut
from app.services.bet_service import place_bet

router = APIRouter()


@router.post("/", response_model=BetOut, status_code=201)
async def place_bet_endpoint(
    body: BetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    bet, new_balance = await place_bet(db, current_user, body.bet_card_id, body.choice, body.amount)

    card_result = await db.execute(select(BetCard).where(BetCard.id == bet.bet_card_id))
    card = card_result.scalar_one_or_none()

    return BetOut(
        id=str(bet.id),
        bet_card_id=str(bet.bet_card_id),
        bet_card_title=card.title if card else "",
        choice=bet.choice,
        amount=bet.amount,
        payout=bet.payout,
        placed_at=bet.placed_at,
        new_balance=new_balance,
    )


@router.get("/my", response_model=list[BetOut])
async def my_bets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Bet)
        .where(Bet.user_id == current_user.id)
        .order_by(Bet.placed_at.desc())
        .offset(skip)
        .limit(limit)
    )
    bets = list(result.scalars().all())

    out = []
    for bet in bets:
        card_result = await db.execute(select(BetCard).where(BetCard.id == bet.bet_card_id))
        card = card_result.scalar_one_or_none()
        out.append(
            BetOut(
                id=str(bet.id),
                bet_card_id=str(bet.bet_card_id),
                bet_card_title=card.title if card else "",
                choice=bet.choice,
                amount=bet.amount,
                payout=bet.payout,
                placed_at=bet.placed_at,
            )
        )
    return out
