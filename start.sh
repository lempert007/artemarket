#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Add Postgres.app CLI tools to PATH
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo -e "${GREEN}Done.${NC}"
}
trap cleanup EXIT INT TERM

# ── Backend setup ──────────────────────────────────────────────────────────────
echo -e "${BLUE}[backend]${NC} Checking Python environment..."

if [ ! -f "$BACKEND/.env" ]; then
  echo -e "${YELLOW}[backend]${NC} .env not found — copying from .env.example"
  cp "$BACKEND/.env.example" "$BACKEND/.env"
  echo -e "${RED}[backend]${NC} Edit $BACKEND/.env with your DATABASE_URL and SECRET_KEY, then re-run."
  exit 1
fi

cd "$BACKEND"

# Use a venv if it exists, otherwise install directly
if [ ! -d ".venv" ]; then
  echo -e "${BLUE}[backend]${NC} Creating virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
echo -e "${BLUE}[backend]${NC} Installing dependencies..."
pip install -r requirements.txt -q

# Create the database if it doesn't exist (Postgres.app uses current OS user, no password)
echo -e "${BLUE}[backend]${NC} Ensuring database exists..."
createdb artemarket 2>/dev/null && echo -e "${GREEN}[backend]${NC} Database created." || echo -e "${BLUE}[backend]${NC} Database already exists."

echo -e "${BLUE}[backend]${NC} Running Alembic migrations..."
alembic upgrade head

echo -e "${GREEN}[backend]${NC} Starting FastAPI on http://localhost:8000"
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# ── Frontend setup ─────────────────────────────────────────────────────────────
cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}[frontend]${NC} Installing npm dependencies..."
  npm install -q
fi

echo -e "${GREEN}[frontend]${NC} Starting Vite dev server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

# ── Wait ───────────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}Both services running.${NC}"
echo -e "  Frontend → ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend  → ${BLUE}http://localhost:8000/docs${NC}"
echo -e "\nPress ${YELLOW}Ctrl+C${NC} to stop.\n"

wait "$BACKEND_PID" "$FRONTEND_PID"
