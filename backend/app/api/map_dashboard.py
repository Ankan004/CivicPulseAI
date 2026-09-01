from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.dependencies import get_db
from app.models.complaint import Complaint

router = APIRouter(
    prefix="/map",
    tags=["Map"]
)

@router.get("/complaints")
def complaint_locations(
    db: Session = Depends(get_db)
):
    complaints = db.query(Complaint).all()

    return [
        {
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "status": c.status,
            "latitude": c.latitude,
            "longitude": c.longitude,
        }
        for c in complaints
    ]