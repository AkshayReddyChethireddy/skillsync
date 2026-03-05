import uuid
from datetime import date
from pydantic import BaseModel


class TopSkill(BaseModel):
    id: uuid.UUID
    name: str
    momentum_score: float
    total_hours: float
    color: str


class DashboardSummary(BaseModel):
    total_skills: int
    active_skills: int
    total_hours: float
    weekly_hours: float
    monthly_hours: float
    current_streak: int
    longest_streak: int
    avg_momentum_score: float
    stagnant_skills_count: int
    top_skill: TopSkill | None
    today_logged: bool
    today_minutes: int


class HeatmapCell(BaseModel):
    date: date
    count: int
    total_minutes: int
    intensity: int


class HeatmapData(BaseModel):
    year: int
    data: list[HeatmapCell]
    max_minutes_in_day: int
    total_active_days: int


class SkillHoursItem(BaseModel):
    skill_id: uuid.UUID
    name: str
    color: str
    total_hours: float


class WeeklyHoursItem(BaseModel):
    week_start: date
    hours: float


class DayOfWeekItem(BaseModel):
    day: str
    avg_minutes: float


class MomentumPoint(BaseModel):
    date: date
    avg_momentum: float


class SkillProgressItem(BaseModel):
    skill_id: uuid.UUID
    name: str
    progress_percent: float
    target_hours: float
    actual_hours: float
    color: str


class AnalyticsData(BaseModel):
    hours_by_skill: list[SkillHoursItem]
    hours_by_week: list[WeeklyHoursItem]
    hours_by_day_of_week: list[DayOfWeekItem]
    momentum_over_time: list[MomentumPoint]
    skill_progress_comparison: list[SkillProgressItem]


class MomentumHistoryPoint(BaseModel):
    date: date
    score: float


class StreakCalendarDay(BaseModel):
    date: date
    had_session: bool


class SkillMetricsDetail(BaseModel):
    skill_id: uuid.UUID
    name: str
    color: str
    total_hours: float
    total_sessions: int
    current_streak: int
    longest_streak: int
    momentum_score: float
    progress_percent: float
    is_stagnant: bool
    stagnant_since: date | None
    avg_session_minutes: float
    weekly_hours: float
    monthly_hours: float
    momentum_history: list[MomentumHistoryPoint]
    streak_calendar: list[StreakCalendarDay]
