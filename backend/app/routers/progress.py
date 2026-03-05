import uuid
from datetime import date
from fastapi import APIRouter, Depends, status, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from ..database import get_db
from ..models.user import User
from ..models.skill import Skill
from ..models.progress_log import ProgressLog
from ..schemas.progress_log import ProgressLogCreate, ProgressLogUpdate, ProgressLogRead, ProgressLogList
from ..dependencies import get_current_user
from ..services.metrics_service import recompute_skill_metrics
from ..utils.exceptions import not_found, forbidden

router = APIRouter(prefix="/progress", tags=["progress"])


def _get_log_or_raise(log_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> ProgressLog:
    log = db.get(ProgressLog, log_id)
    if log is None:
        raise not_found("Progress log")
    if log.user_id != user_id:
        raise forbidden()
    return log


@router.post("/", response_model=ProgressLogRead, status_code=status.HTTP_201_CREATED)
def log_session(
    data: ProgressLogCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify skill ownership
    skill = db.get(Skill, data.skill_id)
    if skill is None or skill.user_id != current_user.id:
        raise not_found("Skill")

    log = ProgressLog(user_id=current_user.id, **data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)

    background_tasks.add_task(recompute_skill_metrics, data.skill_id, db)

    return ProgressLogRead(
        **{**log.__dict__, "skill_name": skill.name, "skill_color": skill.color}
    )


@router.get("/", response_model=ProgressLogList)
def list_logs(
    skill_id: uuid.UUID | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(ProgressLog, Skill.name.label("skill_name"), Skill.color.label("skill_color"))
        .join(Skill, ProgressLog.skill_id == Skill.id)
        .where(ProgressLog.user_id == current_user.id)
    )
    if skill_id:
        query = query.where(ProgressLog.skill_id == skill_id)
    if start_date:
        query = query.where(ProgressLog.session_date >= start_date)
    if end_date:
        query = query.where(ProgressLog.session_date <= end_date)

    total_query = select(func.count()).select_from(query.subquery())
    total = db.execute(total_query).scalar() or 0

    rows = (
        db.execute(query.order_by(ProgressLog.session_date.desc()).limit(limit).offset(offset))
        .all()
    )

    logs = [
        ProgressLogRead(
            **{**row.ProgressLog.__dict__, "skill_name": row.skill_name, "skill_color": row.skill_color}
        )
        for row in rows
    ]
    return ProgressLogList(logs=logs, total=total, has_more=(offset + limit) < total)


@router.get("/skill/{skill_id}", response_model=ProgressLogList)
def logs_for_skill(
    skill_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = db.get(Skill, skill_id)
    if skill is None or skill.user_id != current_user.id:
        raise not_found("Skill")

    query = select(ProgressLog).where(ProgressLog.skill_id == skill_id)
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar() or 0
    logs = db.execute(
        query.order_by(ProgressLog.session_date.desc()).limit(limit).offset(offset)
    ).scalars().all()

    return ProgressLogList(
        logs=[
            ProgressLogRead(**{**log.__dict__, "skill_name": skill.name, "skill_color": skill.color})
            for log in logs
        ],
        total=total,
        has_more=(offset + limit) < total,
    )


@router.get("/{log_id}", response_model=ProgressLogRead)
def get_log(
    log_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = _get_log_or_raise(log_id, current_user.id, db)
    skill = db.get(Skill, log.skill_id)
    return ProgressLogRead(
        **{**log.__dict__, "skill_name": skill.name if skill else None, "skill_color": skill.color if skill else None}
    )


@router.put("/{log_id}", response_model=ProgressLogRead)
def update_log(
    log_id: uuid.UUID,
    data: ProgressLogUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = _get_log_or_raise(log_id, current_user.id, db)
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(log, key, value)
    db.commit()
    db.refresh(log)
    background_tasks.add_task(recompute_skill_metrics, log.skill_id, db)
    skill = db.get(Skill, log.skill_id)
    return ProgressLogRead(
        **{**log.__dict__, "skill_name": skill.name if skill else None, "skill_color": skill.color if skill else None}
    )


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(
    log_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = _get_log_or_raise(log_id, current_user.id, db)
    skill_id = log.skill_id
    db.delete(log)
    db.commit()
    background_tasks.add_task(recompute_skill_metrics, skill_id, db)
