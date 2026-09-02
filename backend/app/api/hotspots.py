from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/hotspots",
    tags=["Hotspots"],
)


# ============================================================
# GEOGRAPHIC HOTSPOTS
# ============================================================

@router.get("/")
def get_hotspots(
    db: Session = Depends(get_db),
):
    """
    Generate geographic civic hotspots.

    Public endpoint.

    Authentication is intentionally NOT required because
    hotspot visualization is part of the public Explore
    platform.

    The ML detector is imported lazily so that scikit-learn
    and NumPy do not delay FastAPI startup.
    """

    # ========================================================
    # LAZY LOAD ML DETECTOR
    # ========================================================

    try:

        from app.ml.hotspot_detector import (
            detect_hotspots
        )

    except Exception as exc:

        print(
            "Hotspot detector import error:",
            str(exc),
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Hotspot analysis is temporarily unavailable."
            ),
        )


    # ========================================================
    # LOAD COMPLAINTS
    # ========================================================

    complaints = (
        db.query(Complaint)
        .all()
    )


    # ========================================================
    # RUN ML HOTSPOT DETECTOR
    # ========================================================

    try:

        results = detect_hotspots(
            complaints
        )

    except Exception as exc:

        print(
            "Hotspot detection error:",
            str(exc),
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Hotspot analysis failed temporarily."
            ),
        )


    # ========================================================
    # RETURN RESULTS
    # ========================================================

    return results