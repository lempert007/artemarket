import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.bet import Bet
from app.models.bet_card import BetCard, BetCardOutcome, BetCardStatus
from app.models.user import User
from app.schemas.bet_card import BetCardCreate, BetCardOut, ResolveRequest, UserBetInfo
from app.services.bet_service import resolve_card

router = APIRouter()


async def _enrich_card(card: BetCard, user_id: uuid.UUID, db: AsyncSession) -> BetCardOut:
    bets_result = await db.execute(select(Bet).where(Bet.bet_card_id == card.id))
    bets = list(bets_result.scalars().all())

    yes_pool = sum(b.amount for b in bets if b.choice == "yes")
    no_pool = sum(b.amount for b in bets if b.choice == "no")

    user_bet_row = next((b for b in bets if b.user_id == user_id), None)
    user_bet = UserBetInfo(choice=user_bet_row.choice, amount=user_bet_row.amount) if user_bet_row else None

    creator_result = await db.execute(select(User).where(User.id == card.created_by))
    creator = creator_result.scalar_one_or_none()

    # After db.refresh/query, SQLAlchemy returns the raw VARCHAR string from the DB.
    # Use .value only if the attribute is still an enum instance (e.g. pre-refresh).
    status_val = card.status.value if isinstance(card.status, BetCardStatus) else card.status
    outcome_val = (
        (card.outcome.value if isinstance(card.outcome, BetCardOutcome) else card.outcome)
        if card.outcome
        else None
    )

    return BetCardOut(
        id=str(card.id),
        title=card.title,
        description=card.description,
        created_by_username=creator.username if creator else "unknown",
        closes_at=card.closes_at,
        resolves_at=card.resolves_at,
        status=status_val,
        outcome=outcome_val,
        total_pool=card.total_pool,
        yes_pool=yes_pool,
        no_pool=no_pool,
        user_bet=user_bet,
    )


@router.get("/swipe-queue", response_model=list[BetCardOut])
async def swipe_queue(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    # Cards that are open, not yet expired, and user has not bet on
    already_bet_subq = select(Bet.bet_card_id).where(Bet.user_id == current_user.id)
    result = await db.execute(
        select(BetCard)
        .where(
            BetCard.status == BetCardStatus.open,
            BetCard.closes_at > now,
            BetCard.id.not_in(already_bet_subq),
        )
        .order_by(BetCard.closes_at.asc())
    )
    cards = list(result.scalars().all())
    return [await _enrich_card(c, current_user.id, db) for c in cards]


@router.get("/", response_model=list[BetCardOut])
async def list_bet_cards(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BetCard)
    if status:
        stmt = stmt.where(BetCard.status == BetCardStatus(status))
    stmt = stmt.order_by(BetCard.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    cards = list(result.scalars().all())
    return [await _enrich_card(c, current_user.id, db) for c in cards]


@router.get("/{card_id}", response_model=BetCardOut)
async def get_bet_card(
    card_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(BetCard).where(BetCard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Bet card not found")
    return await _enrich_card(card, current_user.id, db)


@router.post("/", response_model=BetCardOut, status_code=201)
async def create_bet_card(
    body: BetCardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = BetCard(
        title=body.title,
        description=body.description,
        created_by=current_user.id,
        closes_at=body.closes_at,
        resolves_at=body.resolves_at,
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return await _enrich_card(card, current_user.id, db)


@router.patch("/{card_id}/resolve", response_model=BetCardOut)
async def resolve_bet_card(
    card_id: uuid.UUID,
    body: ResolveRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    card = await resolve_card(db, card_id, body.outcome)
    return await _enrich_card(card, admin.id, db)
