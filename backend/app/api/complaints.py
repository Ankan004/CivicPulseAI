from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.models.user import User
from app.core.admin import admin_required

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate
)

from app.database.dependencies import get_db

from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


@router.post(
    "/",
    response_model=ComplaintResponse
)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_complaint = Complaint(
    title=complaint.title,
    description=complaint.description,
    category=complaint.category,

    severity=complaint.severity,
    priority=complaint.priority,

    latitude=complaint.latitude,
    longitude=complaint.longitude,

    image_url=complaint.image_url,

    user_id=current_user.id
)

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return new_complaint


@router.get(
    "/",
    response_model=list[ComplaintResponse]
)
def get_complaints(
    db: Session = Depends(get_db)
):
    return db.query(Complaint).all()


@router.get("/my-complaints")
def my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id
    ).all()

    return complaints


@router.patch("/{complaint_id}/status")
def update_status(
    complaint_id: int,
    data: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    admin_user = Depends(admin_required)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {
            "message": "Complaint not found"
        }

    complaint.status = data.status

    db.commit()
    db.refresh(complaint)

    return complaint