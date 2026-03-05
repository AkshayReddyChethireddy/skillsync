import uuid
from datetime import datetime, date
from sqlalchemy import Boolean, DateTime, Date, Float, Integer, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class SkillMetrics(Base):
    __tablename__ = "skill_metrics"
    __table_args__ = (
        Index("ix_skill_metrics_user_momentum", "user_id", "momentum_score"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    total_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_session_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    momentum_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_stagnant: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    stagnant_since: Mapped[date | None] = mapped_column(Date, nullable=True)
    avg_session_minutes: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    weekly_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    monthly_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    skill: Mapped["Skill"] = relationship("Skill", back_populates="metrics")
    user: Mapped["User"] = relationship("User")
