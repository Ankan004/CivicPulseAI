from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/map",
    tags=["Map"],
)


# ============================================================
# COMPLAINT LOCATIONS
# ============================================================

@router.get("/complaints")
def complaint_locations(
    db: Session = Depends(get_db),
):
    """
    Public complaint locations for the CivicPulse map.

    Authentication is intentionally NOT required because
    the map is part of the public Explore platform.
    """

    complaints = (
        db.query(Complaint)
        .all()
    )


    results = []


    for complaint in complaints:

        # ----------------------------------------------------
        # Ignore complaints without valid coordinates
        # ----------------------------------------------------

        if (
            complaint.latitude is None
            or complaint.longitude is None
        ):
            continue


        if not (
            -90
            <= complaint.latitude
            <= 90
        ):
            continue


        if not (
            -180
            <= complaint.longitude
            <= 180
        ):
            continue


        results.append(
            {
                "id":
                    complaint.id,

                "title":
                    complaint.title,

                "category":
                    complaint.category,

                "status":
                    complaint.status,

                "latitude":
                    complaint.latitude,

                "longitude":
                    complaint.longitude,
            }
        )


    return results