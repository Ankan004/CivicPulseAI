from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint

from app.ml.hotspot_detector import (
    detect_hotspots
)

router = APIRouter(
    prefix="/hotspots",
    tags=["Hotspots"]
)


@router.get("/")
def get_hotspots(
    db: Session = Depends(get_db)
):

    complaints = db.query(
        Complaint
    ).all()

    return detect_hotspots(
        complaints
    )