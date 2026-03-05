from datetime import date, timedelta
from app.models.progress_log import ProgressLog
from app.services.momentum_service import compute_momentum_score


def test_momentum_zero_no_sessions(db, test_skill):
    score = compute_momentum_score(test_skill.id, db)
    assert score == 0.0


def test_momentum_recent_session(db, test_skill):
    """Session today should yield high recency score."""
    log = ProgressLog(
        skill_id=test_skill.id,
        user_id=test_skill.user_id,
        session_date=date.today(),
        duration_minutes=90,
    )
    db.add(log)
    db.commit()
    score = compute_momentum_score(test_skill.id, db)
    assert score > 30.0  # at minimum recency factor should kick in


def test_momentum_stale_session(db, test_skill):
    """Session 30 days ago should give very low score."""
    log = ProgressLog(
        skill_id=test_skill.id,
        user_id=test_skill.user_id,
        session_date=date.today() - timedelta(days=30),
        duration_minutes=60,
    )
    db.add(log)
    db.commit()
    score = compute_momentum_score(test_skill.id, db)
    assert score < 10.0


def test_momentum_consistent_daily(db, test_skill):
    """Daily sessions for 14 days should give high score."""
    for i in range(14):
        log = ProgressLog(
            skill_id=test_skill.id,
            user_id=test_skill.user_id,
            session_date=date.today() - timedelta(days=i),
            duration_minutes=60,
        )
        db.add(log)
    db.commit()
    score = compute_momentum_score(test_skill.id, db)
    assert score > 70.0


def test_momentum_bounded(db, skill_with_logs):
    score = compute_momentum_score(skill_with_logs.id, db)
    assert 0.0 <= score <= 100.0
