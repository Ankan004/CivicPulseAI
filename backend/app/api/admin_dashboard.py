from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.core.admin import admin_required


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/admin-dashboard",
    tags=["Admin Dashboard"],
)


# ============================================================
# ADMIN STATISTICS
# ============================================================

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(
        admin_required
    ),
):
    """
    Get administrative complaint statistics.

    ADMIN ONLY.
    """

    complaints = (
        db.query(Complaint)
        .all()
    )


    # ========================================================
    # TOTAL COMPLAINTS
    # ========================================================

    total = len(
        complaints
    )


    # ========================================================
    # HIGH PRIORITY
    # ========================================================

    high_priority = len(
        [
            complaint
            for complaint in complaints
            if (
                complaint.priority
                and complaint.priority.lower()
                == "high"
            )
        ]
    )


    # ========================================================
    # ROAD
    # ========================================================

    road = len(
        [
            complaint
            for complaint in complaints
            if (
                complaint.category
                and complaint.category.lower()
                == "road"
            )
        ]
    )


    # ========================================================
    # WATER
    # ========================================================

    water = len(
        [
            complaint
            for complaint in complaints
            if (
                complaint.category
                and complaint.category.lower()
                == "water"
            )
        ]
    )


    # ========================================================
    # ELECTRICITY
    # ========================================================

    electricity = len(
        [
            complaint
            for complaint in complaints
            if (
                complaint.category
                and complaint.category.lower()
                == "electricity"
            )
        ]
    )


    # ========================================================
    # WASTE
    # ========================================================

    waste = len(
        [
            complaint
            for complaint in complaints
            if (
                complaint.category
                and complaint.category.lower()
                == "waste"
            )
        ]
    )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "total_complaints": total,
        "high_priority": high_priority,
        "road": road,
        "water": water,
        "electricity": electricity,
        "waste": waste,
    }