import math
import uuid
from datetime import date, timedelta
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..models.progress_log import ProgressLog


def _sum_minutes(skill_id: uuid.UUID, db: Session, end_date: date, window_days: int) -> int:
    start_date = end_date - timedelta(days=window_days)
    result = db.execute(
        select(func.coalesce(func.sum(ProgressLog.duration_minutes), 0))
        .where(
            ProgressLog.skill_id == skill_id,
            ProgressLog.session_date > start_date,
            ProgressLog.session_date <= end_date,
        )
    )
    return result.scalar() or 0


def _count_active_days(skill_id: uuid.UUID, db: Session, end_date: date, window_days: int) -> int:
    start_date = end_date - timedelta(days=window_days)
    result = db.execute(
        select(func.count(func.distinct(ProgressLog.session_date)))
        .where(
            ProgressLog.skill_id == skill_id,
            ProgressLog.session_date > start_date,
            ProgressLog.session_date <= end_date,
        )
    )
    return result.scalar() or 0


def _get_last_session_date(skill_id: uuid.UUID, db: Session) -> date | None:
    result = db.execute(
        select(func.max(ProgressLog.session_date)).where(ProgressLog.skill_id == skill_id)
    )
    return result.scalar()


def _get_avg_weekly_minutes(skill_id: uuid.UUID, db: Session, ref: date, weeks: int = 4) -> float:
    """Historical average weekly minutes over the past N weeks (excluding current week)."""
    total_minutes = 0
    for w in range(1, weeks + 1):
        week_end = ref - timedelta(days=7 * (w - 1))
        total_minutes += _sum_minutes(skill_id, db, week_end, 7)
    return total_minutes / weeks


def compute_momentum_score(skill_id: uuid.UUID, db: Session, reference_date: date | None = None) -> float:
    """
    Momentum = 0.35*recency + 0.30*consistency + 0.20*volume + 0.15*acceleration
    Returns a score between 0.0 and 100.0.
    """
    ref = reference_date or date.today()

    last_session = _get_last_session_date(skill_id, db)
    if last_session is None:
        return 0.0

    # Factor 1: Recency — exponential decay by days since last session
    days_since = (ref - last_session).days
    recency = max(0.0, 100.0 * math.exp(-0.12 * days_since))

    # Factor 2: Consistency — active days in last 14 days
    active_days_14 = _count_active_days(skill_id, db, ref, 14)
    consistency = (active_days_14 / 14.0) * 100.0

    # Factor 3: Volume — this week vs historical average
    this_week_minutes = _sum_minutes(skill_id, db, ref, 7)
    avg_weekly_minutes = _get_avg_weekly_minutes(skill_id, db, ref)
    if avg_weekly_minutes == 0:
        volume = min(100.0, (this_week_minutes / 60.0) * 20.0)
    else:
        volume = min(100.0, (this_week_minutes / avg_weekly_minutes) * 50.0)

    # Factor 4: Acceleration — this week vs last week
    last_week_minutes = _sum_minutes(skill_id, db, ref - timedelta(days=7), 7)
    if last_week_minutes == 0 and this_week_minutes > 0:
        acceleration = 75.0
    elif last_week_minutes == 0:
        acceleration = 0.0
    else:
        delta = (this_week_minutes - last_week_minutes) / last_week_minutes
        acceleration = max(0.0, min(100.0, 50.0 + delta * 50.0))

    momentum = (
        0.35 * recency
        + 0.30 * consistency
        + 0.20 * volume
        + 0.15 * acceleration
    )
    return round(min(100.0, max(0.0, momentum)), 2)
