"""Initial schema — users, skills, progress_logs, skill_metrics

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    # skills
    op.create_table(
        "skills",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("target_hours", sa.Float(), nullable=False, server_default="100.0"),
        sa.Column("color", sa.String(7), nullable=False, server_default="#6366f1"),
        sa.Column("icon", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "name", name="uq_skill_user_name"),
    )
    op.create_index("ix_skills_user_id", "skills", ["user_id"])
    op.create_index("ix_skills_user_active", "skills", ["user_id", "is_active"])

    # progress_logs
    op.create_table(
        "progress_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("skill_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("session_date", sa.Date(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("notes", sa.String(2000), nullable=True),
        sa.Column("difficulty", sa.SmallInteger(), nullable=True),
        sa.Column("mood", sa.SmallInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("duration_minutes > 0", name="ck_progress_log_duration_positive"),
        sa.CheckConstraint("difficulty >= 1 AND difficulty <= 5", name="ck_progress_log_difficulty_range"),
        sa.CheckConstraint("mood >= 1 AND mood <= 5", name="ck_progress_log_mood_range"),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_progress_logs_skill_id", "progress_logs", ["skill_id"])
    op.create_index("ix_progress_logs_user_id", "progress_logs", ["user_id"])
    op.create_index("ix_progress_logs_skill_date", "progress_logs", ["skill_id", "session_date"])
    op.create_index("ix_progress_logs_user_date", "progress_logs", ["user_id", "session_date"])
    op.create_index("ix_progress_logs_user_skill_date", "progress_logs", ["user_id", "skill_id", "session_date"])

    # skill_metrics
    op.create_table(
        "skill_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("skill_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("total_hours", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("total_sessions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_session_date", sa.Date(), nullable=True),
        sa.Column("momentum_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("progress_percent", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("is_stagnant", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("stagnant_since", sa.Date(), nullable=True),
        sa.Column("avg_session_minutes", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("weekly_hours", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("monthly_hours", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("computed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("skill_id"),
    )
    op.create_index("ix_skill_metrics_skill_id", "skill_metrics", ["skill_id"])
    op.create_index("ix_skill_metrics_user_id", "skill_metrics", ["user_id"])
    op.create_index("ix_skill_metrics_user_momentum", "skill_metrics", ["user_id", "momentum_score"])


def downgrade() -> None:
    op.drop_table("skill_metrics")
    op.drop_table("progress_logs")
    op.drop_table("skills")
    op.drop_table("users")
