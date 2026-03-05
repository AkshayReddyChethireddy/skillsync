import uuid
from datetime import date
from sqlalchemy import select, distinct
from sqlalchemy.orm import Session
from ..models.progress_log import ProgressLog


def get_unique_session_dates(skill_id: uuid.UUID, db: Session) -> list[date]:
    """Returns unique session dates for a skill, sorted descending."""
    result = db.execute(
        select(distinct(ProgressLog.session_date))
        .where(ProgressLog.skill_id == skill_id)
        .order_by(ProgressLog.session_date.desc())
    )
    return [row[0] for row in result.fetchall()]


def compute_streak(skill_id: uuid.UUID, db: Session) -> tuple[int, int]:
    """
    Returns (current_streak, longest_streak).
    A streak is consecutive calendar days with ≥1 session.
    Grace period: gap of ≤2 days continues the streak (allows 1 missed day).
    """
    session_dates = get_unique_session_dates(skill_id, db)
    if not session_dates:
        return 0, 0

    today = date.today()

    # Current streak — count from most recent session
    if (today - session_dates[0]).days > 1:
        current_streak = 0
    else:
        current_streak = 1
        for i in range(1, len(session_dates)):
            gap = (session_dates[i - 1] - session_dates[i]).days
            if gap <= 2:
                current_streak += 1
            else:
                break

    # Longest streak — scan full history
    if len(session_dates) == 0:
        return 0, 0

    longest = 1
    run = 1
    for i in range(1, len(session_dates)):
        gap = (session_dates[i - 1] - session_dates[i]).days
        if gap <= 2:
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    return current_streak, longest
