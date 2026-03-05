import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .config import get_settings
from .routers import auth, skills, progress, dashboard, metrics
from .utils.logger import setup_logger


settings = get_settings()
logger = setup_logger(__name__)

app = FastAPI(
    title="SkillSync API",
    description="Learning Momentum Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://skillsync-ar.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Version Prefix
PREFIX = "/api/v1"

# Routers
app.include_router(auth.router, prefix=PREFIX)
app.include_router(skills.router, prefix=PREFIX)
app.include_router(progress.router, prefix=PREFIX)
app.include_router(dashboard.router, prefix=PREFIX)
app.include_router(metrics.router, prefix=PREFIX)


# Validation error handler
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "skillsync-api"}


# Startup log
@app.on_event("startup")
async def startup_event():
    logger.info(
        "SkillSync API starting up — environment: %s",
        settings.environment
    )