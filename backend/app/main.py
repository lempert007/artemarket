from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, bet_cards, bets, users
from app.services.scheduler import close_expired_bet_cards


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        close_expired_bet_cards,
        "interval",
        seconds=60,
        id="close_expired_cards",
    )
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Artemarket", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(bet_cards.router, prefix="/api/bet-cards", tags=["bet-cards"])
app.include_router(bets.router, prefix="/api/bets", tags=["bets"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
