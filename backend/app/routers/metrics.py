import uuid
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.skill import Skill
from ..models.skill_metrics import SkillMetrics
from ..models.progress_log import ProgressLog
from ..schemas.dashboard import SkillMetricsDetail, MomentumHistoryPoint, StreakCalendarDay
from ..dependencies import get_current_user
from ..services.metrics_service import recompute_skill_metrics
from ..services.momentum_service import compute_momentum_score
from ..utils.exceptions import not_found, forbidden

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/skill/{skill_id}", response_model=SkillMetricsDetail)
def get_skill_metrics(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = db.get(Skill, skill_id)
    if skill is None or skill.user_id != current_user.id:
        raise not_found("Skill")

    metrics = db.query(SkillMetrics).filter(SkillMetrics.skill_id == skill_id).first()
    if metrics is None:
        raise not_found("Metrics")

    today = date.today()

    # Momentum history last 30 days
    momentum_history = []
    for d in range(29, -1, -1):
        day = today - timedelta(days=d)
        score = compute_momentum_score(skill_id, db, reference_date=day)
        momentum_history.append(MomentumHistoryPoint(date=day, score=score))

    # Streak calendar last 60 days
    session_dates_result = db.execute(
        select(ProgressLog.session_date)
        .where(
            ProgressLog.skill_id == skill_id,
            ProgressLog.session_date >= today - timedelta(days=59),
        )
    ).all()
    session_date_set = {row[0] for row in session_dates_result}

    streak_calendar = [
        StreakCalendarDay(
            date=today - timedelta(days=d),
            had_session=(today - timedelta(days=d)) in session_date_set,
        )
        for d in range(59, -1, -1)
    ]

    return SkillMetricsDetail(
        skill_id=skill.id,
        name=skill.name,
        color=skill.color,
        total_hours=metrics.total_hours,
        total_sessions=metrics.total_sessions,
        current_streak=metrics.current_streak,
        longest_streak=metrics.longest_streak,
        momentum_score=metrics.momentum_score,
        progress_percent=metrics.progress_percent,
        is_stagnant=metrics.is_stagnant,
        stagnant_since=metrics.stagnant_since,
        avg_session_minutes=metrics.avg_session_minutes,
        weekly_hours=metrics.weekly_hours,
        monthly_hours=metrics.monthly_hours,
        momentum_history=momentum_history,
        streak_calendar=streak_calendar,
    )


@router.post("/skill/{skill_id}/recompute", response_model=dict)
def force_recompute(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = db.get(Skill, skill_id)
    if skill is None or skill.user_id != current_user.id:
        raise not_found("Skill")
    recompute_skill_metrics(skill_id, db)
    return {"status": "recomputed"}


@router.get("/leaderboard", response_model=list[dict])
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skills = (
        db.execute(
            select(Skill, SkillMetrics)
            .join(SkillMetrics, Skill.id == SkillMetrics.skill_id)
            .where(Skill.user_id == current_user.id, Skill.is_active == True)
            .order_by(SkillMetrics.momentum_score.desc())
        )
        .all()
    )
    return [
        {
            "skill_id": str(row.Skill.id),
            "name": row.Skill.name,
            "color": row.Skill.color,
            "momentum_score": row.SkillMetrics.momentum_score,
            "total_hours": row.SkillMetrics.total_hours,
            "current_streak": row.SkillMetrics.current_streak,
            "progress_percent": row.SkillMetrics.progress_percent,
            "is_stagnant": row.SkillMetrics.is_stagnant,
        }
        for row in skills
    ]
