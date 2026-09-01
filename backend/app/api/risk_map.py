from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint

router = APIRouter(
    prefix="/risk-map",
    tags=["Risk Map"]
)

@router.get("/")
def get_risk_map(
    db: Session = Depends(get_db)
):

    complaints = db.query(
        Complaint
    ).all()

    results = []

    for complaint in complaints:

        score = 30

        if complaint.severity:
            severity = complaint.severity.lower()

            if severity == "high":
                score += 50

            elif severity == "medium":
                score += 25

        results.append({
            "id": complaint.id,
            "title": complaint.title,
            "latitude": complaint.latitude,
            "longitude": complaint.longitude,
            "risk_score": score
        })

    return results