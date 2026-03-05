import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Integer, SmallInteger, ForeignKey, func, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class ProgressLog(Base):
    __tablename__ = "progress_logs"
    __table_args__ = (
        CheckConstraint("duration_minutes > 0", name="ck_progress_log_duration_positive"),
        CheckConstraint("difficulty >= 1 AND difficulty <= 5", name="ck_progress_log_difficulty_range"),
        CheckConstraint("mood >= 1 AND mood <= 5", name="ck_progress_log_mood_range"),
        Index("ix_progress_logs_skill_date", "skill_id", "session_date"),
        Index("ix_progress_logs_user_date", "user_id", "session_date"),
        Index("ix_progress_logs_user_skill_date", "user_id", "skill_id", "session_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    session_date: Mapped[date] = mapped_column(Date, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    difficulty: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    mood: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    skill: Mapped["Skill"] = relationship("Skill", back_populates="progress_logs")
    user: Mapped["User"] = relationship("User", back_populates="progress_logs")
