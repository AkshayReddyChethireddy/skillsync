import uuid
from datetime import date, timedelta
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..models.progress_log import ProgressLog
from ..schemas.dashboard import HeatmapCell, HeatmapData


def _compute_intensity(minutes: int, max_minutes: int) -> int:
    if minutes == 0:
        return 0
    if max_minutes == 0:
        return 1
    ratio = minutes / max_minutes
    if ratio < 0.25:
        return 1
    if ratio < 0.50:
        return 2
    if ratio < 0.75:
        return 3
    return 4


def generate_heatmap(user_id: uuid.UUID, db: Session, year: int) -> HeatmapData:
    """Generate GitHub-style heatmap data for a full calendar year."""
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)

    # Aggregate daily minutes for the user across all skills
    result = db.execute(
        select(
            ProgressLog.session_date,
            func.count(ProgressLog.id).label("session_count"),
            func.sum(ProgressLog.duration_minutes).label("total_minutes"),
        )
        .where(
            ProgressLog.user_id == user_id,
            ProgressLog.session_date >= start_date,
            ProgressLog.session_date <= end_date,
        )
        .group_by(ProgressLog.session_date)
        .order_by(ProgressLog.session_date)
    )
    rows = result.fetchall()

    # Build lookup dict
    daily_data: dict[date, tuple[int, int]] = {}
    for row in rows:
        daily_data[row.session_date] = (row.session_count, row.total_minutes)

    max_minutes = max((v[1] for v in daily_data.values()), default=0)

    # Build full year calendar
    cells: list[HeatmapCell] = []
    current = start_date
    total_active_days = 0
    while current <= end_date:
        count, total_min = daily_data.get(current, (0, 0))
        intensity = _compute_intensity(total_min, max_minutes)
        if count > 0:
            total_active_days += 1
        cells.append(
            HeatmapCell(
                date=current,
                count=count,
                total_minutes=total_min,
                intensity=intensity,
            )
        )
        current += timedelta(days=1)

    return HeatmapData(
        year=year,
        data=cells,
        max_minutes_in_day=max_minutes,
        total_active_days=total_active_days,
    )
