from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/hotspots")
def hotspot_analysis(
    db: Session = Depends(get_db)
):
    complaints = db.query(
        Complaint
    ).all()

    high = 0
    medium = 0
    low = 0

    categories = {}

    for complaint in complaints:

        severity = (
            complaint.severity or ""
        ).lower()

        if severity == "high":
            high += 1

        elif severity == "medium":
            medium += 1

        else:
            low += 1

        category = complaint.category

        categories[category] = (
            categories.get(category, 0) + 1
        )

    top_category = (
        max(
            categories,
            key=categories.get
        )
        if categories
        else "None"
    )

    return {
        "total_complaints":
            len(complaints),

        "high_severity":
            high,

        "medium_severity":
            medium,

        "low_severity":
            low,

        "top_category":
            top_category,
    }