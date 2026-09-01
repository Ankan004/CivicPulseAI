from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


router = APIRouter(
    prefix="/hotspots",
    tags=["Hotspots"],
)


@router.get("/")
def get_hotspots(
    db: Session = Depends(get_db),
):
    """
    Generate geographic civic hotspots.

    The actual ML detector is imported lazily here so that
    scikit-learn and NumPy do not delay application startup.
    """

    from app.ml.hotspot_detector import detect_hotspots

    complaints = (
        db.query(Complaint)
        .all()
    )

    return detect_hotspots(
        complaints
    )