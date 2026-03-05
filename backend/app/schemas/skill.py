import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator
from .skill_metrics import SkillMetricsRead


class SkillCreate(BaseModel):
    name: str
    description: str | None = None
    category: str | None = None
    target_hours: float = 100.0
    color: str = "#6366f1"
    icon: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Skill name cannot be empty")
        if len(v) > 200:
            raise ValueError("Skill name too long")
        return v

    @field_validator("target_hours")
    @classmethod
    def target_hours_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Target hours must be positive")
        return v

    @field_validator("color")
    @classmethod
    def valid_hex_color(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith("#") or len(v) not in (4, 7):
            raise ValueError("Color must be a valid hex color like #6366f1")
        return v


class SkillUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    target_hours: float | None = None
    color: str | None = None
    icon: str | None = None


class SkillRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    category: str | None
    target_hours: float
    color: str
    icon: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SkillWithMetrics(SkillRead):
    metrics: SkillMetricsRead | None = None


class SkillDetail(SkillWithMetrics):
    recent_logs: list = []
