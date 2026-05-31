from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.complaint import Complaint


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):

    total = db.query(Complaint).count()

    pending = db.query(Complaint).filter(
        Complaint.status == "pending"
    ).count()

    in_progress = db.query(Complaint).filter(
        Complaint.status == "in_progress"
    ).count()

    resolved = db.query(Complaint).filter(
        Complaint.status == "resolved"
    ).count()

    return {
        "total_complaints": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved
    }