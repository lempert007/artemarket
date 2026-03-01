import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.bet import Bet
from app.models.bet_card import BetCard, BetCardStatus
from app.models.user import User
from app.schemas.user import LeaderboardEntry, UserStats

router = APIRouter()


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    users_result = await db.execute(
        select(User).where(User.is_admin == False).order_by(User.balance.desc()).limit(50)
    )
    users = list(users_result.scalars().all())

    entries = []
    for rank, user in enumerate(users, start=1):
        bets_result = await db.execute(
            select(Bet).where(Bet.user_id == user.id)
        )
        bets = list(bets_result.scalars().all())
        total_bets = len(bets)
        won = sum(1 for b in bets if b.payout is not None and b.payout > 0)
        resolved = sum(1 for b in bets if b.payout is not None)
        win_rate = round(won / resolved, 2) if resolved > 0 else 0.0

        entries.append(
            LeaderboardEntry(
                rank=rank,
                username=user.username,
                balance=user.balance,
                total_bets=total_bets,
                won=won,
                win_rate=win_rate,
            )
        )
    return entries


@router.get("/me/stats", response_model=UserStats)
async def my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _build_stats(current_user, db)


@router.get("/{user_id}/stats", response_model=UserStats)
async def user_stats(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return await _build_stats(user, db)


async def _build_stats(user: User, db: AsyncSession) -> UserStats:
    bets_result = await db.execute(select(Bet).where(Bet.user_id == user.id))
    bets = list(bets_result.scalars().all())

    total_bets = len(bets)
    total_wagered = sum(b.amount for b in bets)

    won_bets = [b for b in bets if b.payout is not None and b.payout > 0]
    lost_bets = [b for b in bets if b.payout == 0]
    pending_bets = [b for b in bets if b.payout is None]

    total_won = sum(b.payout for b in won_bets)
    net_profit = total_won - total_wagered

    return UserStats(
        username=user.username,
        balance=user.balance,
        total_bets=total_bets,
        won=len(won_bets),
        lost=len(lost_bets),
        pending=len(pending_bets),
        total_wagered=total_wagered,
        total_won=total_won,
        net_profit=net_profit,
    )
