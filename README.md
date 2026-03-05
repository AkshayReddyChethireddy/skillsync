# SkillSync — Learning Momentum Intelligence Platform

SkillSync is a full-stack web application designed to help people **track their learning progress, stay consistent, and understand how their skills evolve over time**.

Instead of simply logging hours, SkillSync analyzes learning behavior to generate insights such as **momentum scores, learning streaks, activity heatmaps, and progress analytics**.

The goal of SkillSync is to solve a common problem: many people start learning something but struggle to stay consistent or measure real improvement. SkillSync provides a structured way to track learning and visualize growth.

---

# Architecture

SkillSync follows a modern full-stack architecture with a clear separation between frontend and backend services.

```
skillsync/
├── backend/           FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── models/    Database models (User, Skill, ProgressLog, SkillMetrics)
│   │   ├── schemas/   Request/response validation schemas
│   │   ├── routers/   API endpoints (auth, skills, progress, dashboard)
│   │   └── services/  Core business logic and analytics
│   ├── alembic/       Database migrations
│   └── tests/         Automated tests
│
└── frontend/          React + TypeScript + Vite
    └── src/
        ├── api/       API communication layer
        ├── store/     Global state management (Zustand)
        ├── pages/     Application pages
        └── components/Reusable UI components
```

The **frontend communicates with the backend via REST APIs**, while the backend handles authentication, analytics computation, and database operations.

---

# Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Zustand (state management)
* Framer Motion (animations)
* Recharts (data visualization)

### Backend

* FastAPI
* SQLAlchemy ORM
* PostgreSQL
* Alembic (database migrations)
* JWT Authentication (python-jose)
* Password hashing with bcrypt (passlib)

### DevOps

* Docker
* Docker Compose

---

# Core Features

### Momentum Scores

Each skill receives a **momentum score** calculated from multiple learning factors including recency, consistency, learning volume, and acceleration.

### Streak Tracking

Tracks **consecutive learning days** to help users maintain consistent learning habits.

### Stagnation Detection

Automatically detects when a skill has **not been practiced for 14+ days**.

### GitHub-Style Heatmap

Displays learning activity using a **year-long contribution grid** similar to GitHub.

### Progress Tracking

Users can set **target learning hours for each skill** and monitor their progress.

### Learning Analytics

Dashboards provide insights including:

* Weekly learning patterns
* Momentum trends
* Skill distribution
* Activity heatmaps

### Secure Authentication

SkillSync uses **JWT-based authentication** with:

* Secure password hashing
* Protected API routes
* Token-based session management

---

# Running the Project Locally

## Requirements

Before running the project, ensure you have:

* Docker & Docker Compose
* Node.js 20+
* Python 3.12+

---

# Quick Start (Docker)

The easiest way to run SkillSync locally is using Docker.

```
cd skillsync
cp backend/.env.example backend/.env
docker compose up --build
```

Once running:

Frontend
http://localhost:5173

Backend API Docs
http://localhost:8000/docs

PostgreSQL
localhost:5432

---

# Manual Setup

## Backend Setup

```
cd backend

python -m venv .venv

# Linux / Mac
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env

alembic upgrade head

uvicorn app.main:app --reload
```

---

## Frontend Setup

```
cd frontend

npm install

cp .env.example .env

npm run dev
```

Your frontend `.env` should contain:

```
VITE_API_URL=http://localhost:8000/api/v1
```

---

# Running Tests

Backend tests use **pytest**.

```
cd backend
pytest tests/ -v
```

---

# API Overview

SkillSync provides a REST API for authentication, skill management, progress tracking, and analytics.

| Category       | Endpoints                             |
| -------------- | ------------------------------------- |
| Authentication | POST /auth/register, POST /auth/login |
| User           | GET /auth/me                          |
| Skills         | CRUD operations for skills            |
| Progress       | Add and retrieve learning sessions    |
| Dashboard      | Learning analytics and heatmap        |
| Metrics        | Skill-specific performance data       |

Interactive API documentation is available at:

```
/docs
```

when the backend server is running.

---

# Deployment

## Backend Deployment (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Build command

```
pip install -r requirements.txt
```

4. Start command

```
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Frontend Deployment (Vercel)

1. Import the GitHub repository into Vercel
2. Set the root directory to:

```
frontend
```

3. Add environment variable

```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## Database (Neon PostgreSQL)

1. Create a PostgreSQL database on Neon
2. Copy the connection string
3. Add it as:

```
DATABASE_URL
```

in backend environment variables

4. Run migrations:

```
alembic upgrade head
```

---

# Momentum Score Calculation

SkillSync calculates learning momentum using a weighted formula:

```
Momentum =
 0.35 × recency
+0.30 × consistency
+0.20 × volume
+0.15 × acceleration
```

Score interpretation:

| Score  | Status   |
| ------ | -------- |
| 0–20   | Dormant  |
| 21–40  | Low      |
| 41–60  | Building |
| 61–80  | Active   |
| 81–100 | Peak     |

---

# Database Relationships

```
users
  └── skills
        └── progress_logs
        └── skill_metrics
```

Each user can track multiple skills, and each skill records learning sessions and analytics metrics.

---

# License

MIT License
