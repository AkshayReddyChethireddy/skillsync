from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://skillsync:skillsync_dev@localhost:5432/skillsync"

    # Security
    secret_key: str = "dev-secret-key-change-in-production-must-be-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # CORS (allow frontend access)
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://skillsync.vercel.app"
    ]

    # Logging
    log_level: str = "INFO"

    # Environment
    environment: str = "development"

    # Load environment variables from .env
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()