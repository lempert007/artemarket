from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserOut
from app.services.auth_service import create_access_token

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            username=body.username,
            is_admin=(body.username == "admin"),
            balance=1000,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(str(user.id), user.username)
    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=str(user.id),
            username=user.username,
            is_admin=user.is_admin,
            balance=user.balance,
        ),
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        username=current_user.username,
        is_admin=current_user.is_admin,
        balance=current_user.balance,
    )
