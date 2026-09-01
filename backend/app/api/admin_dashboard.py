from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.dependencies import get_db
from app.models.complaint import Complaint

router = APIRouter(
    prefix="/admin-dashboard",
    tags=["Admin Dashboard"]
)

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db)
):

    complaints = db.query(
        Complaint
    ).all()

    total = len(
        complaints
    )

    high_priority = len([
        c for c in complaints
        if c.priority
        and c.priority.lower() == "high"
    ])

    road = len([
        c for c in complaints
        if c.category
        and c.category.lower() == "road"
    ])

    water = len([
        c for c in complaints
        if c.category
        and c.category.lower() == "water"
    ])

    electricity = len([
        c for c in complaints
        if c.category
        and c.category.lower() == "electricity"
    ])

    waste = len([
        c for c in complaints
        if c.category
        and c.category.lower() == "waste"
    ])

    return {
        "total_complaints":
            total,

        "high_priority":
            high_priority,

        "road":
            road,

        "water":
            water,

        "electricity":
            electricity,

        "waste":
            waste
    }