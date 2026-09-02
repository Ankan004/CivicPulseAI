from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/risk-map",
    tags=["Risk Map"],
)


# ============================================================
# RISK MAP
# ============================================================

@router.get("/")
def get_risk_map(
    db: Session = Depends(get_db),
):
    """
    Public risk-map data.

    Authentication is intentionally NOT required because
    the risk map is part of the public Explore platform.
    """

    complaints = (
        db.query(Complaint)
        .all()
    )

    results = []


    for complaint in complaints:

        # ====================================================
        # VALIDATE COORDINATES
        # ====================================================

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


        # ====================================================
        # BASE RISK SCORE
        # ====================================================

        score = 30


        # ====================================================
        # SEVERITY
        # ====================================================

        if complaint.severity:

            severity = (
                complaint.severity
                .lower()
                .strip()
            )


            if severity == "high":

                score += 50


            elif severity == "medium":

                score += 25


        # ====================================================
        # KEEP SCORE BETWEEN 0 AND 100
        # ====================================================

        score = max(
            0,
            min(
                score,
                100,
            ),
        )


        # ====================================================
        # PUBLIC RESPONSE
        # ====================================================

        results.append(
            {
                "id":
                    complaint.id,

                "title":
                    complaint.title,

                "latitude":
                    complaint.latitude,

                "longitude":
                    complaint.longitude,

                "risk_score":
                    score,
            }
        )


    return results