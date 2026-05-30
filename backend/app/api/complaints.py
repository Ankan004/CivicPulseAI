from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.models.complaint import Complaint

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse
)

from app.database.dependencies import get_db


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
    db: Session = Depends(get_db)
):

    new_complaint = Complaint(
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        latitude=complaint.latitude,
        longitude=complaint.longitude
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