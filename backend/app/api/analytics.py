from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# ============================================================
# HOTSPOT / SEVERITY ANALYSIS
# ============================================================

@router.get("/hotspots")
def hotspot_analysis(
    db: Session = Depends(get_db),
):
    """
    Public analytics endpoint.

    Returns aggregate complaint statistics.

    Authentication is intentionally NOT required because
    analytics are part of the public Explore platform.
    """

    complaints = (
        db.query(Complaint)
        .all()
    )

    high = 0
    medium = 0
    low = 0

    categories = {}


    # ========================================================
    # ANALYZE COMPLAINTS
    # ========================================================

    for complaint in complaints:

        severity = (
            complaint.severity
            or ""
        ).strip().lower()


        if severity == "high":

            high += 1

        elif severity == "medium":

            medium += 1

        else:

            low += 1


        category = (
            complaint.category
            or "Unknown"
        ).strip()


        categories[category] = (
            categories.get(
                category,
                0,
            )
            + 1
        )


    # ========================================================
    # TOP CATEGORY
    # ========================================================

    if categories:

        top_category = max(
            categories,
            key=categories.get,
        )

    else:

        top_category = "None"


    # ========================================================
    # RESPONSE
    # ========================================================

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


# ============================================================
# ANALYTICS SUMMARY
# ============================================================

@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
):
    """
    Public analytics summary.

    Returns aggregate complaint statistics.
    """

    complaints = (
        db.query(Complaint)
        .all()
    )


    total = len(
        complaints
    )

    pending = 0
    resolved = 0
    high_priority = 0

    categories = {}


    # ========================================================
    # ANALYZE COMPLAINTS
    # ========================================================

    for complaint in complaints:

        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        status = (
            complaint.status
            or ""
        ).strip().lower()


        if status == "pending":

            pending += 1


        elif status == "resolved":

            resolved += 1


        # ----------------------------------------------------
        # HIGH SEVERITY
        # ----------------------------------------------------

        severity = (
            complaint.severity
            or ""
        ).strip().lower()


        if severity == "high":

            high_priority += 1


        # ----------------------------------------------------
        # CATEGORY
        # ----------------------------------------------------

        category = (
            complaint.category
            or "Unknown"
        ).strip()


        categories[category] = (
            categories.get(
                category,
                0,
            )
            + 1
        )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "total":
            total,

        "pending":
            pending,

        "resolved":
            resolved,

        "high_priority":
            high_priority,

        "categories":
            categories,
    }