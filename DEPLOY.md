# Artemarket — GCP Deployment Guide

## Architecture

| Component | GCP Service |
|-----------|-------------|
| Backend (FastAPI) | Cloud Run |
| Database (PostgreSQL) | Cloud SQL |
| Frontend (React SPA) | Firebase Hosting |
| Secrets | Cloud Run env vars (or Secret Manager) |

---

## Prerequisites

```bash
# Install gcloud CLI: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Install Firebase CLI
npm install -g firebase-tools
firebase login
```

---

## Step 1 — Cloud SQL (PostgreSQL)

```bash
# Create a PostgreSQL 15 instance (db-f1-micro = cheapest)
gcloud sql instances create artemarket-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-auto-increase

# Create the database
gcloud sql databases create artemarket --instance=artemarket-db

# Create a user (replace YOUR_PASSWORD)
gcloud sql users create artemarket \
  --instance=artemarket-db \
  --password=YOUR_PASSWORD

# Note the connection name (used below)
gcloud sql instances describe artemarket-db --format="value(connectionName)"
# → YOUR_PROJECT_ID:us-central1:artemarket-db
```

---

## Step 2 — Backend on Cloud Run

### 2a. Build and push the Docker image

```bash
cd backend

# Enable Artifact Registry
gcloud services enable artifactregistry.googleapis.com

# Create a repository
gcloud artifacts repositories create artemarket \
  --repository-format=docker \
  --location=us-central1

# Build and push
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/artemarket/backend:latest .
```

### 2b. Generate a strong secret key

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 2c. Deploy to Cloud Run

Replace the placeholder values before running:

```bash
gcloud run deploy artemarket-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/artemarket/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:artemarket-db \
  --set-env-vars "\
DATABASE_URL=postgresql+asyncpg://artemarket:YOUR_PASSWORD@/artemarket?host=/cloudsql/YOUR_PROJECT_ID:us-central1:artemarket-db,\
SECRET_KEY=YOUR_GENERATED_SECRET_KEY,\
ALLOWED_ORIGINS=https://artemarket.web.app,\
ACCESS_TOKEN_EXPIRE_MINUTES=10080"
```

After deploy, note the backend URL — it looks like:
```
https://artemarket-backend-XXXX-uc.a.run.app
```

---

## Step 3 — Frontend on Firebase Hosting

### 3a. Build with the backend URL

```bash
cd frontend

# Set the backend URL (the Cloud Run URL from Step 2c)
VITE_API_BASE_URL=https://artemarket-backend-XXXX-uc.a.run.app/api npm run build
```

### 3b. Deploy to Firebase

```bash
firebase init hosting
# → Use existing project → select YOUR_PROJECT_ID
# → Public directory: dist
# → Single-page app: Yes
# → Overwrite index.html: No

firebase deploy --only hosting
```

Firebase will give you a URL like `https://YOUR_PROJECT_ID.web.app`.

### 3c. Update CORS on the backend

Now that you have the final frontend URL, update the backend's `ALLOWED_ORIGINS`:

```bash
gcloud run services update artemarket-backend \
  --region us-central1 \
  --update-env-vars ALLOWED_ORIGINS=https://YOUR_PROJECT_ID.web.app
```

---

## Step 4 — Custom Domain (optional)

```bash
# Firebase custom domain
firebase hosting:channel:deploy production
# Then add in Firebase console: Hosting → Add custom domain

# Or point your DNS CNAME to the Firebase URL
```

---

## Redeploying

**Backend change:**
```bash
cd backend
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/artemarket/backend:latest .
gcloud run deploy artemarket-backend --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/artemarket/backend:latest --region us-central1
```

**Frontend change:**
```bash
cd frontend
VITE_API_BASE_URL=https://artemarket-backend-XXXX-uc.a.run.app/api npm run build
firebase deploy --only hosting
```

---

## Estimated Cost (~20 users, low traffic)

| Service | Est. Monthly |
|---------|-------------|
| Cloud Run | ~$0 (free tier: 2M req/mo) |
| Cloud SQL db-f1-micro | ~$7–10 |
| Firebase Hosting | ~$0 (free tier: 10 GB/mo) |
| **Total** | **~$7–10/mo** |

> To minimize cost: pause the Cloud SQL instance when not in use via the GCP console.
