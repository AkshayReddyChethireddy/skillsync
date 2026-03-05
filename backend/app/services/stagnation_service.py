import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from ..models.skill_metrics import SkillMetrics


def detect_stagnation(
    skill_id: uuid.UUID,
    db: Session,
    stagnation_threshold_days: int = 14,
) -> tuple[bool, date | None]:
    """
    A skill is stagnant if total_sessions >= 3 and no session in last N days.
    Returns (is_stagnant, stagnant_since).
    """
    metrics = db.query(SkillMetrics).filter(SkillMetrics.skill_id == skill_id).first()
    if metrics is None or metrics.total_sessions < 3:
        return False, None

    if metrics.last_session_date is None:
        return True, None

    days_inactive = (date.today() - metrics.last_session_date).days
    if days_inactive >= stagnation_threshold_days:
        stagnant_since = metrics.last_session_date + timedelta(days=1)
        return True, stagnant_since

    return False, None


def get_stagnation_severity(stagnant_since: date | None) -> str:
    """Returns 'warning', 'stagnant', or 'critical' based on how long stagnant."""
    if stagnant_since is None:
        return "stagnant"
    days_stagnant = (date.today() - stagnant_since).days
    if days_stagnant < 7:
        return "warning"
    if days_stagnant < 17:
        return "stagnant"
    return "critical"
