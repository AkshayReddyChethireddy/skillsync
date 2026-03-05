import uuid
from datetime import datetime, date
from pydantic import BaseModel, field_validator


class ProgressLogCreate(BaseModel):
    skill_id: uuid.UUID
    session_date: date
    duration_minutes: int
    notes: str | None = None
    difficulty: int | None = None
    mood: int | None = None

    @field_validator("duration_minutes")
    @classmethod
    def duration_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Duration must be positive")
        if v > 1440:
            raise ValueError("Duration cannot exceed 24 hours (1440 minutes)")
        return v

    @field_validator("difficulty", "mood")
    @classmethod
    def rating_range(cls, v: int | None) -> int | None:
        if v is not None and (v < 1 or v > 5):
            raise ValueError("Rating must be between 1 and 5")
        return v


class ProgressLogUpdate(BaseModel):
    session_date: date | None = None
    duration_minutes: int | None = None
    notes: str | None = None
    difficulty: int | None = None
    mood: int | None = None


class ProgressLogRead(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID
    user_id: uuid.UUID
    session_date: date
    duration_minutes: int
    notes: str | None
    difficulty: int | None
    mood: int | None
    created_at: datetime
    skill_name: str | None = None
    skill_color: str | None = None

    model_config = {"from_attributes": True}


class ProgressLogList(BaseModel):
    logs: list[ProgressLogRead]
    total: int
    has_more: bool
