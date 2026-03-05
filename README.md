# SkillSync — Learning Momentum Intelligence Platform

A production-ready full-stack SaaS application that tracks skill development, measures learning consistency, detects stagnation, and visualizes growth through rich analytics.

## Architecture

```
skillsync/
├── backend/           FastAPI + SQLAlchemy + PostgreSQL + Alembic
│   ├── app/
│   │   ├── models/    SQLAlchemy ORM models (User, Skill, ProgressLog, SkillMetrics)
│   │   ├── schemas/   Pydantic v2 request/response schemas
│   │   ├── routers/   API route handlers (auth, skills, progress, dashboard, metrics)
│   │   └── services/  Business logic (momentum, streaks, stagnation, heatmap)
│   ├── alembic/       Database migrations
│   └── tests/         pytest test suite
└── frontend/          React 18 + TypeScript + Vite
    └── src/
        ├── api/       Axios API layer
        ├── store/     Zustand state management
        ├── pages/     Route-level page components
        └── components/ Reusable UI components
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| State | Zustand with persist middleware |
| Charts | Recharts |
| Animation | Framer Motion |
| Backend | FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Containerization | Docker, Docker Compose |

## Features

- **Momentum Scores** — Weighted formula: 35% recency + 30% consistency + 20% volume + 15% acceleration
- **Streak Tracking** — Consecutive day streaks with 1-day grace period
- **Stagnation Detection** — Automatic alerts when a skill has been inactive 14+ days
- **GitHub-style Heatmap** — Full-year learning activity visualization
- **Progress to Goal** — Track hours toward per-skill targets
- **Rich Analytics** — Momentum trends, weekly patterns, skill distribution charts
- **JWT Authentication** — Secure registration, login, protected routes

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for frontend dev without Docker)
- Python 3.12+ (for backend dev without Docker)

### Quick Start with Docker

```bash
cd skillsync
cp backend/.env.example backend/.env
docker compose up --build
```

Access:
- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

### Run Tests

```bash
cd backend
pytest tests/ -v
```

## API Overview

| Group | Endpoints |
|-------|-----------|
| Auth | POST /auth/register, /auth/login · GET/PUT /auth/me |
| Skills | CRUD /skills/ · GET /skills/{id} |
| Progress | POST /progress/ · GET /progress/?filters |
| Dashboard | GET /dashboard/summary, /heatmap, /analytics |
| Metrics | GET /metrics/skill/{id} · GET /metrics/leaderboard |

Full interactive docs at `/docs` (Swagger UI) when backend is running.

## Deployment

### Backend → Render

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `backend/.env.example`

### Frontend → Vercel

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api/v1`
4. Deploy

### Database → Neon.tech (PostgreSQL)

1. Create a free PostgreSQL database on [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL` in your backend env vars
3. Run `alembic upgrade head` to apply migrations

### Production CORS

Update `CORS_ORIGINS` in your backend environment to include your Vercel domain:
```
CORS_ORIGINS=https://your-app.vercel.app
```

## Business Logic

### Momentum Score Formula

```python
Momentum = 0.35 * recency + 0.30 * consistency + 0.20 * volume + 0.15 * acceleration

recency     = 100 * exp(-0.12 * days_since_last_session)   # exponential decay
consistency = (active_days_last_14 / 14) * 100
volume      = min(100, (this_week_minutes / avg_weekly_minutes) * 50)
acceleration = clamped(50 + delta_pct * 50)
```

Score bands: 0-20 Dormant · 21-40 Low · 41-60 Building · 61-80 Active · 81-100 Peak

### Database Schema

```
users ──< skills ──< progress_logs
              └──── skill_metrics (1:1 cached metrics)
```

## Project Structure Highlights

- `backend/app/services/momentum_service.py` — Core scoring algorithm
- `backend/app/services/metrics_service.py` — Background metrics recomputation
- `frontend/src/components/dashboard/ActivityHeatmap.tsx` — 52-week grid heatmap
- `frontend/src/components/dashboard/MomentumGauge.tsx` — Animated SVG arc gauge
- `frontend/src/store/dashboardStore.ts` — Central data coordinator

## License

MIT
