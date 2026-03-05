from datetime import date, timedelta
from app.models.progress_log import ProgressLog
from app.services.streak_service import compute_streak


def test_streak_empty(db, test_skill):
    current, longest = compute_streak(test_skill.id, db)
    assert current == 0
    assert longest == 0


def test_streak_single_session_today(db, test_skill):
    log = ProgressLog(
        skill_id=test_skill.id,
        user_id=test_skill.user_id,
        session_date=date.today(),
        duration_minutes=30,
    )
    db.add(log)
    db.commit()
    current, longest = compute_streak(test_skill.id, db)
    assert current == 1
    assert longest == 1


def test_streak_consecutive_5_days(db, test_skill):
    for i in range(5):
        log = ProgressLog(
            skill_id=test_skill.id,
            user_id=test_skill.user_id,
            session_date=date.today() - timedelta(days=i),
            duration_minutes=45,
        )
        db.add(log)
    db.commit()
    current, longest = compute_streak(test_skill.id, db)
    assert current == 5
    assert longest == 5


def test_streak_broken(db, test_skill):
    """Gap of 3+ days breaks the streak."""
    # Sessions 0 and 1 day ago
    for i in [0, 1]:
        log = ProgressLog(
            skill_id=test_skill.id,
            user_id=test_skill.user_id,
            session_date=date.today() - timedelta(days=i),
            duration_minutes=30,
        )
        db.add(log)
    # Session 10 days ago (different streak)
    log_old = ProgressLog(
        skill_id=test_skill.id,
        user_id=test_skill.user_id,
        session_date=date.today() - timedelta(days=10),
        duration_minutes=30,
    )
    db.add(log_old)
    db.commit()
    current, longest = compute_streak(test_skill.id, db)
    assert current == 2


def test_streak_grace_period(db, test_skill):
    """Gap of 2 days (1 missed day) keeps streak alive."""
    for i in [0, 2]:
        log = ProgressLog(
            skill_id=test_skill.id,
            user_id=test_skill.user_id,
            session_date=date.today() - timedelta(days=i),
            duration_minutes=30,
        )
        db.add(log)
    db.commit()
    current, longest = compute_streak(test_skill.id, db)
    assert current == 2
