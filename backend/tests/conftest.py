import pytest
import uuid
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.user import User
from app.models.skill import Skill
from app.models.skill_metrics import SkillMetrics
from app.models.progress_log import ProgressLog
from app.services.auth_service import hash_password

TEST_DB_URL = "sqlite:///:memory:"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db):
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hash_password("password123"),
        full_name="Test User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_skill(db, test_user):
    skill = Skill(
        user_id=test_user.id,
        name="Python",
        target_hours=100.0,
        color="#3b82f6",
    )
    db.add(skill)
    db.flush()
    metrics = SkillMetrics(skill_id=skill.id, user_id=test_user.id)
    db.add(metrics)
    db.commit()
    db.refresh(skill)
    return skill


@pytest.fixture
def skill_with_logs(db, test_skill):
    """Skill with 10 sessions over the past 12 days."""
    logs = []
    for i in range(10):
        log = ProgressLog(
            skill_id=test_skill.id,
            user_id=test_skill.user_id,
            session_date=date.today() - timedelta(days=i),
            duration_minutes=60,
        )
        logs.append(log)
        db.add(log)
    db.commit()
    return test_skill
