from datetime import date, timedelta
from app.models.progress_log import ProgressLog
from app.models.skill_metrics import SkillMetrics
from app.services.stagnation_service import detect_stagnation


def _set_metrics(db, skill, total_sessions, last_session_date):
    metrics = db.query(SkillMetrics).filter(SkillMetrics.skill_id == skill.id).first()
    metrics.total_sessions = total_sessions
    metrics.last_session_date = last_session_date
    db.commit()


def test_not_stagnant_new_skill(db, test_skill):
    _set_metrics(db, test_skill, 2, date.today() - timedelta(days=20))
    is_stagnant, _ = detect_stagnation(test_skill.id, db)
    assert not is_stagnant  # fewer than 3 sessions


def test_not_stagnant_recent(db, test_skill):
    _set_metrics(db, test_skill, 10, date.today() - timedelta(days=5))
    is_stagnant, _ = detect_stagnation(test_skill.id, db)
    assert not is_stagnant


def test_stagnant_14_days(db, test_skill):
    _set_metrics(db, test_skill, 10, date.today() - timedelta(days=14))
    is_stagnant, stagnant_since = detect_stagnation(test_skill.id, db)
    assert is_stagnant
    assert stagnant_since is not None


def test_stagnant_since_correct(db, test_skill):
    last_session = date.today() - timedelta(days=20)
    _set_metrics(db, test_skill, 5, last_session)
    is_stagnant, stagnant_since = detect_stagnation(test_skill.id, db)
    assert is_stagnant
    assert stagnant_since == last_session + timedelta(days=1)
