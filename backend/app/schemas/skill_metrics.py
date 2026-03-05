import uuid
from datetime import datetime, date
from pydantic import BaseModel


class SkillMetricsRead(BaseModel):
    id: uuid.UUID
    skill_id: uuid.UUID
    total_hours: float
    total_sessions: int
    current_streak: int
    longest_streak: int
    last_session_date: date | None
    momentum_score: float
    progress_percent: float
    is_stagnant: bool
    stagnant_since: date | None
    avg_session_minutes: float
    weekly_hours: float
    monthly_hours: float
    computed_at: datetime

    model_config = {"from_attributes": True}
