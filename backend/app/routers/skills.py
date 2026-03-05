import uuid
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.skill import Skill
from ..models.skill_metrics import SkillMetrics
from ..models.progress_log import ProgressLog
from ..schemas.skill import SkillCreate, SkillUpdate, SkillRead, SkillWithMetrics, SkillDetail
from ..schemas.progress_log import ProgressLogRead
from ..schemas.skill_metrics import SkillMetricsRead
from ..dependencies import get_current_user
from ..utils.exceptions import not_found, forbidden, conflict

router = APIRouter(prefix="/skills", tags=["skills"])


def _get_skill_or_raise(skill_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Skill:
    skill = db.get(Skill, skill_id)
    if skill is None:
        raise not_found("Skill")
    if skill.user_id != user_id:
        raise forbidden()
    return skill


@router.get("/", response_model=list[SkillWithMetrics])
def list_skills(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Skill).where(Skill.user_id == current_user.id)
    if active_only:
        query = query.where(Skill.is_active == True)
    query = query.order_by(Skill.created_at.desc())
    skills = db.execute(query).scalars().all()

    result = []
    for skill in skills:
        metrics = db.query(SkillMetrics).filter(SkillMetrics.skill_id == skill.id).first()
        skill_dict = SkillRead.model_validate(skill).model_dump()
        skill_dict["metrics"] = SkillMetricsRead.model_validate(metrics).model_dump() if metrics else None
        result.append(SkillWithMetrics(**skill_dict))
    return result


@router.post("/", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
def create_skill(
    data: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check uniqueness for this user
    existing = db.execute(
        select(Skill).where(
            Skill.user_id == current_user.id,
            Skill.name == data.name,
        )
    ).scalar_one_or_none()
    if existing:
        raise conflict(f"You already have a skill named '{data.name}'")

    skill = Skill(user_id=current_user.id, **data.model_dump())
    db.add(skill)
    db.flush()

    # Create empty metrics row
    metrics = SkillMetrics(skill_id=skill.id, user_id=current_user.id)
    db.add(metrics)
    db.commit()
    db.refresh(skill)
    return skill


@router.get("/{skill_id}", response_model=SkillDetail)
def get_skill(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = _get_skill_or_raise(skill_id, current_user.id, db)
    metrics = db.query(SkillMetrics).filter(SkillMetrics.skill_id == skill.id).first()
    recent_logs = (
        db.execute(
            select(ProgressLog)
            .where(ProgressLog.skill_id == skill_id)
            .order_by(ProgressLog.session_date.desc(), ProgressLog.created_at.desc())
            .limit(10)
        )
        .scalars()
        .all()
    )

    skill_dict = SkillRead.model_validate(skill).model_dump()
    skill_dict["metrics"] = SkillMetricsRead.model_validate(metrics).model_dump() if metrics else None
    skill_dict["recent_logs"] = [
        ProgressLogRead(
            **{
                **log.__dict__,
                "skill_name": skill.name,
                "skill_color": skill.color,
            }
        )
        for log in recent_logs
    ]
    return SkillDetail(**skill_dict)


@router.put("/{skill_id}", response_model=SkillRead)
def update_skill(
    skill_id: uuid.UUID,
    data: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = _get_skill_or_raise(skill_id, current_user.id, db)
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(skill, key, value)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = _get_skill_or_raise(skill_id, current_user.id, db)
    skill.is_active = False
    db.commit()


@router.post("/{skill_id}/reactivate", response_model=SkillRead)
def reactivate_skill(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = db.get(Skill, skill_id)
    if skill is None or skill.user_id != current_user.id:
        raise not_found("Skill")
    skill.is_active = True
    db.commit()
    db.refresh(skill)
    return skill
