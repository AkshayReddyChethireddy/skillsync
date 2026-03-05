from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://skillsync:skillsync_dev@localhost:5432/skillsync"
    secret_key: str = "dev-secret-key-change-in-production-must-be-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: List[str] = ["http://localhost:5173"]
    log_level: str = "INFO"
    environment: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
