from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
):
    """
    Public dashboard statistics.
    No login required.
    """

    complaints = db.query(Complaint).all()

    return {
        "total_complaints": len(complaints),

        "pending": sum(
            1
            for complaint in complaints
            if complaint.status
            and complaint.status.lower() == "pending"
        ),

        "in_progress": sum(
            1
            for complaint in complaints
            if complaint.status
            and complaint.status.lower() == "in_progress"
        ),

        "resolved": sum(
            1
            for complaint in complaints
            if complaint.status
            and complaint.status.lower() == "resolved"
        ),
    }