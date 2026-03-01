FROM python:3.11-slim

WORKDIR /app

# Install deps first (cached layer — only re-runs when requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Run as non-root for security
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Run migrations then start the server.
# Cloud Run injects PORT; falls back to 8000 locally.
# `exec` replaces the shell so uvicorn receives SIGTERM directly (graceful shutdown).
ENTRYPOINT ["sh", "-c"]
CMD ["alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
