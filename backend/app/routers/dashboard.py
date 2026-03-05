import uuid
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from ..database import get_db
from ..models.user import User
from ..models.skill import Skill
from ..models.skill_metrics import SkillMetrics
from ..models.progress_log import ProgressLog
from ..schemas.dashboard import (
    DashboardSummary, TopSkill, HeatmapData, AnalyticsData,
    SkillHoursItem, WeeklyHoursItem, DayOfWeekItem, MomentumPoint, SkillProgressItem,
)
from ..services.heatmap_service import generate_heatmap
from ..dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    # Skills counts
    skills_query = select(Skill).where(Skill.user_id == user_id)
    all_skills = db.execute(skills_query).scalars().all()
    active_skills = [s for s in all_skills if s.is_active]

    # Aggregate from skill_metrics for active skills
    active_skill_ids = [s.id for s in active_skills]
    metrics_rows = (
        db.execute(
            select(SkillMetrics).where(
                SkillMetrics.user_id == user_id,
                SkillMetrics.skill_id.in_(active_skill_ids),
            )
        )
        .scalars()
        .all()
        if active_skill_ids
        else []
    )

    total_hours = sum(m.total_hours for m in metrics_rows)
    weekly_hours = sum(m.weekly_hours for m in metrics_rows)
    monthly_hours = sum(m.monthly_hours for m in metrics_rows)
    current_streak = max((m.current_streak for m in metrics_rows), default=0)
    longest_streak = max((m.longest_streak for m in metrics_rows), default=0)
    avg_momentum = (
        round(sum(m.momentum_score for m in metrics_rows) / len(metrics_rows), 1)
        if metrics_rows
        else 0.0
    )
    stagnant_count = sum(1 for m in metrics_rows if m.is_stagnant)

    top_metric = max(metrics_rows, key=lambda m: m.momentum_score, default=None)
    top_skill = None
    if top_metric:
        skill_obj = db.get(Skill, top_metric.skill_id)
        if skill_obj:
            top_skill = TopSkill(
                id=skill_obj.id,
                name=skill_obj.name,
                momentum_score=top_metric.momentum_score,
                total_hours=top_metric.total_hours,
                color=skill_obj.color,
            )

    today = date.today()
    today_result = db.execute(
        select(func.coalesce(func.sum(ProgressLog.duration_minutes), 0))
        .where(ProgressLog.user_id == user_id, ProgressLog.session_date == today)
    )
    today_minutes = today_result.scalar() or 0

    return DashboardSummary(
        total_skills=len(all_skills),
        active_skills=len(active_skills),
        total_hours=round(total_hours, 1),
        weekly_hours=round(weekly_hours, 1),
        monthly_hours=round(monthly_hours, 1),
        current_streak=current_streak,
        longest_streak=longest_streak,
        avg_momentum_score=avg_momentum,
        stagnant_skills_count=stagnant_count,
        top_skill=top_skill,
        today_logged=today_minutes > 0,
        today_minutes=today_minutes,
    )


@router.get("/heatmap", response_model=HeatmapData)
def get_heatmap(
    year: int = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if year is None:
        year = date.today().year
    return generate_heatmap(current_user.id, db, year)


@router.get("/analytics", response_model=AnalyticsData)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    today = date.today()

    # Active skills
    active_skills = (
        db.execute(select(Skill).where(Skill.user_id == user_id, Skill.is_active == True))
        .scalars()
        .all()
    )
    skill_map = {s.id: s for s in active_skills}
    active_ids = list(skill_map.keys())

    # Hours by skill
    metrics_rows = (
        db.execute(
            select(SkillMetrics).where(
                SkillMetrics.user_id == user_id,
                SkillMetrics.skill_id.in_(active_ids),
                SkillMetrics.total_hours > 0,
            )
        )
        .scalars()
        .all()
        if active_ids
        else []
    )
    hours_by_skill = [
        SkillHoursItem(
            skill_id=m.skill_id,
            name=skill_map[m.skill_id].name,
            color=skill_map[m.skill_id].color,
            total_hours=round(m.total_hours, 1),
        )
        for m in sorted(metrics_rows, key=lambda x: x.total_hours, reverse=True)
    ]

    # Hours by week (last 12 weeks)
    hours_by_week = []
    for w in range(11, -1, -1):
        week_end = today - timedelta(days=7 * w)
        week_start = week_end - timedelta(days=6)
        result = db.execute(
            select(func.coalesce(func.sum(ProgressLog.duration_minutes), 0))
            .where(
                ProgressLog.user_id == user_id,
                ProgressLog.session_date >= week_start,
                ProgressLog.session_date <= week_end,
            )
        )
        minutes = result.scalar() or 0
        hours_by_week.append(WeeklyHoursItem(week_start=week_start, hours=round(minutes / 60.0, 1)))

    # Hours by day of week (average minutes per weekday)
    day_totals = {d: 0 for d in range(7)}
    day_counts = {d: 0 for d in range(7)}
    logs_90d = db.execute(
        select(ProgressLog.session_date, ProgressLog.duration_minutes)
        .where(
            ProgressLog.user_id == user_id,
            ProgressLog.session_date >= today - timedelta(days=90),
        )
    ).all()
    for row in logs_90d:
        dow = row.session_date.weekday()
        day_totals[dow] += row.duration_minutes
        day_counts[dow] += 1

    hours_by_day = [
        DayOfWeekItem(
            day=DAYS_OF_WEEK[i],
            avg_minutes=round(day_totals[i] / day_counts[i], 1) if day_counts[i] > 0 else 0.0,
        )
        for i in range(7)
    ]

    # Momentum over time (last 30 days from metrics computed_at approximation)
    # We use rolling average of all active skill momentum scores over time using progress log dates
    momentum_points = []
    for d in range(29, -1, -1):
        day = today - timedelta(days=d)
        # Approximate: for each day, average the momentum of skills that had sessions that week
        result = db.execute(
            select(func.count(func.distinct(ProgressLog.skill_id)))
            .where(
                ProgressLog.user_id == user_id,
                ProgressLog.session_date == day,
                ProgressLog.skill_id.in_(active_ids) if active_ids else False,
            )
        )
        active_count = result.scalar() or 0
        if active_count > 0 and metrics_rows:
            avg_mom = round(sum(m.momentum_score for m in metrics_rows) / len(metrics_rows), 1)
        else:
            avg_mom = 0.0
        momentum_points.append(MomentumPoint(date=day, avg_momentum=avg_mom))

    # Skill progress comparison
    skill_progress = [
        SkillProgressItem(
            skill_id=m.skill_id,
            name=skill_map[m.skill_id].name,
            progress_percent=m.progress_percent,
            target_hours=skill_map[m.skill_id].target_hours,
            actual_hours=round(m.total_hours, 1),
            color=skill_map[m.skill_id].color,
        )
        for m in metrics_rows
        if m.skill_id in skill_map
    ]

    return AnalyticsData(
        hours_by_skill=hours_by_skill,
        hours_by_week=hours_by_week,
        hours_by_day_of_week=hours_by_day,
        momentum_over_time=momentum_points,
        skill_progress_comparison=sorted(skill_progress, key=lambda x: x.progress_percent, reverse=True),
    )
