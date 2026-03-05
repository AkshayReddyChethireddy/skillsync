import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Float, ForeignKey, UniqueConstraint, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_skill_user_name"),
        Index("ix_skills_user_active", "user_id", "is_active"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_hours: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    color: Mapped[str] = mapped_column(String(7), default="#6366f1", nullable=False)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="skills")
    progress_logs: Mapped[list["ProgressLog"]] = relationship(
        "ProgressLog", back_populates="skill", cascade="all, delete-orphan"
    )
    metrics: Mapped["SkillMetrics | None"] = relationship(
        "SkillMetrics", back_populates="skill", uselist=False, cascade="all, delete-orphan"
    )
