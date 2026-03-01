import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.bet import Bet
from app.models.bet_card import BetCard, BetCardStatus
from app.models.user import User
from app.schemas.user import LeaderboardEntry, UserOut, UserStats

router = APIRouter()


@router.get("/", response_model=list[UserOut])
async def list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.is_admin == False).order_by(User.username)
    )
    return list(result.scalars().all())


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin or user.username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin users")

    # Transfer bet cards to admin so created_by (NOT NULL) stays valid
    await db.execute(
        update(BetCard).where(BetCard.created_by == user_id).values(created_by=admin.id)
    )
    # Delete the user's bets
    await db.execute(delete(Bet).where(Bet.user_id == user_id))
    # Delete the user
    await db.delete(user)
    await db.commit()


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
