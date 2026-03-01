# Artemarket

A private prediction market web app with a Tinder-style swipe interface.

## Stack
- **Backend**: FastAPI + SQLAlchemy (async) + PostgreSQL + APScheduler
- **Frontend**: React 18 + Vite + TypeScript + MUI v5 + React Query v5

## Setup

### 1. PostgreSQL
Create a database named `artemarket`:
```bash
createdb artemarket
```

### 2. Backend

```bash
cd backend
pip install -e .
cp .env.example .env

# Edit .env with your DATABASE_URL and SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Usage

- Visit `http://localhost:5173`
- Enter any username to log in (auto-created with 1000 points)
- Log in as `admin` to get admin privileges
- **Swipe left** on a card = bet YES
- **Swipe right** on a card = bet NO
- Tap **+** to create a new bet card
- Only `admin` can resolve bets

## Payout
Winners split the entire pool proportionally:
`payout = floor(your_bet / total_winning_bets * total_pool)`
Rounding remainder goes to the largest winner.
