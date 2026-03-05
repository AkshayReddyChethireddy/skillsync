import uuid
from datetime import datetime, date, timezone
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..models.progress_log import ProgressLog
from ..models.skill import Skill
from ..models.skill_metrics import SkillMetrics
from .streak_service import compute_streak
from .momentum_service import compute_momentum_score, _sum_minutes
from .stagnation_service import detect_stagnation


def recompute_skill_metrics(skill_id: uuid.UUID, db: Session) -> SkillMetrics:
    """
    Recomputes all metrics for a skill and upserts the skill_metrics row.
    Called as a BackgroundTask after every progress log write/delete.
    """
    # Aggregate total minutes and sessions
    result = db.execute(
        select(
            func.coalesce(func.sum(ProgressLog.duration_minutes), 0).label("total_minutes"),
            func.count(ProgressLog.id).label("total_sessions"),
            func.max(ProgressLog.session_date).label("last_session_date"),
        ).where(ProgressLog.skill_id == skill_id)
    )
    row = result.fetchone()
    total_minutes = row.total_minutes or 0
    total_sessions = row.total_sessions or 0
    last_session_date = row.last_session_date

    total_hours = total_minutes / 60.0

    # Skill for progress percent
    skill = db.get(Skill, skill_id)
    if skill is None:
        return None

    progress_percent = 0.0
    if skill.target_hours > 0:
        progress_percent = round(min(100.0, (total_hours / skill.target_hours) * 100.0), 1)

    current_streak, longest_streak = compute_streak(skill_id, db)
    momentum_score = compute_momentum_score(skill_id, db)

    # Ensure metrics row exists before stagnation check (needs total_sessions)
    metrics = db.query(SkillMetrics).filter(SkillMetrics.skill_id == skill_id).first()
    if metrics is None:
        metrics = SkillMetrics(
            skill_id=skill_id,
            user_id=skill.user_id,
        )
        db.add(metrics)

    # Update fields before stagnation check (it reads from DB metrics)
    metrics.total_hours = total_hours
    metrics.total_sessions = total_sessions
    metrics.last_session_date = last_session_date
    db.flush()

    is_stagnant, stagnant_since = detect_stagnation(skill_id, db)

    today = date.today()
    weekly_minutes = _sum_minutes(skill_id, db, today, 7)
    monthly_minutes = _sum_minutes(skill_id, db, today, 30)
    avg_session_minutes = total_minutes / total_sessions if total_sessions > 0 else 0.0

    metrics.current_streak = current_streak
    metrics.longest_streak = longest_streak
    metrics.momentum_score = momentum_score
    metrics.progress_percent = progress_percent
    metrics.is_stagnant = is_stagnant
    metrics.stagnant_since = stagnant_since
    metrics.avg_session_minutes = avg_session_minutes
    metrics.weekly_hours = weekly_minutes / 60.0
    metrics.monthly_hours = monthly_minutes / 60.0
    metrics.computed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(metrics)
    return metrics
