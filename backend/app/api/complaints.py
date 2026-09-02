import csv
from io import StringIO

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.models.user import User

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate,
)

from app.database.dependencies import get_db

from app.core.dependencies import (
    get_current_user,
)

from app.core.admin import (
    admin_required,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
)


# ============================================================
# CREATE COMPLAINT
# ============================================================

@router.post(
    "/",
    response_model=ComplaintResponse,
)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Create a civic complaint.

    Authentication required.

    ML prediction:
        - category
        - severity
        - priority
    """

    # ========================================================
    # BASIC INPUT VALIDATION
    # ========================================================

    title = (
        complaint.title
        or ""
    ).strip()

    description = (
        complaint.description
        or ""
    ).strip()


    if not title:

        raise HTTPException(
            status_code=400,
            detail="Complaint title is required.",
        )


    if not description:

        raise HTTPException(
            status_code=400,
            detail="Complaint description is required.",
        )


    # ========================================================
    # LAZY LOAD ML
    # ========================================================

    try:

        from app.ml.predict import (
            analyze_complaint
        )

    except Exception as exc:

        print(
            "ML model import error:",
            str(exc),
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Complaint AI classification "
                "is temporarily unavailable."
            ),
        )


    # ========================================================
    # ML PREDICTION
    # ========================================================

    try:

        ai_result = analyze_complaint(
            title,
            description,
        )

    except Exception as exc:

        print(
            "Complaint ML error:",
            str(exc),
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Complaint AI classification "
                "failed temporarily."
            ),
        )


    # ========================================================
    # ML RESULTS
    # ========================================================

    category = ai_result.get(
        "category",
        "Other",
    )

    severity = ai_result.get(
        "severity",
        "Medium",
    )

    priority = ai_result.get(
        "priority",
        "Medium",
    )


    # ========================================================
    # CREATE DATABASE OBJECT
    # ========================================================

    new_complaint = Complaint(
        title=title,
        description=description,
        category=category,
        severity=severity,
        priority=priority,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        image_url=complaint.image_url,
        user_id=current_user.id,
    )


    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.add(
            new_complaint
        )

        db.commit()

        db.refresh(
            new_complaint
        )

    except Exception as exc:

        db.rollback()

        print(
            "Complaint database error:",
            str(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to create complaint."
            ),
        )


    return new_complaint


# ============================================================
# GET ALL COMPLAINTS
# ============================================================

@router.get(
    "/",
    response_model=list[ComplaintResponse],
)
def get_complaints(
    db: Session = Depends(get_db),
):
    """
    Public endpoint.

    Anyone can explore complaints.
    """

    return (
        db.query(Complaint)
        .order_by(
            Complaint.id.desc()
        )
        .all()
    )


# ============================================================
# GET MY COMPLAINTS
# ============================================================

@router.get(
    "/my-complaints",
    response_model=list[ComplaintResponse],
)
def my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Authentication required.

    Returns only complaints belonging to
    the authenticated user.
    """

    return (
        db.query(Complaint)
        .filter(
            Complaint.user_id
            == current_user.id
        )
        .order_by(
            Complaint.id.desc()
        )
        .all()
    )


# ============================================================
# EXPORT CSV
# ============================================================

# IMPORTANT:
# This route must remain BEFORE /{complaint_id}

@router.get(
    "/export/csv"
)
def export_csv(
    db: Session = Depends(get_db),
    admin_user: User = Depends(
        admin_required
    ),
):
    """
    ADMIN ONLY.

    Export all complaints as CSV.
    """

    complaints = (
        db.query(Complaint)
        .order_by(
            Complaint.id.asc()
        )
        .all()
    )


    output = StringIO()

    writer = csv.writer(
        output
    )


    writer.writerow(
        [
            "ID",
            "Title",
            "Description",
            "Category",
            "Severity",
            "Priority",
            "Status",
            "Latitude",
            "Longitude",
            "User ID",
        ]
    )


    for complaint in complaints:

        writer.writerow(
            [
                complaint.id,
                complaint.title,
                complaint.description,
                complaint.category,
                complaint.severity,
                complaint.priority,
                complaint.status,
                complaint.latitude,
                complaint.longitude,
                complaint.user_id,
            ]
        )


    output.seek(0)


    return StreamingResponse(
        iter(
            [
                output.getvalue()
            ]
        ),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                "attachment; "
                "filename=complaints.csv"
        },
    )


# ============================================================
# UPDATE COMPLAINT STATUS
# ============================================================

@router.patch(
    "/{complaint_id}/status"
)
def update_status(
    complaint_id: int,
    data: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(
        admin_required
    ),
):
    """
    ADMIN ONLY.

    Change complaint status.
    """

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id
            == complaint_id
        )
        .first()
    )


    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found.",
        )


    complaint.status = (
        data.status
    )


    try:

        db.commit()

        db.refresh(
            complaint
        )

    except Exception as exc:

        db.rollback()

        print(
            "Complaint status update error:",
            str(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to update complaint status."
            ),
        )


    return complaint


# ============================================================
# GET SINGLE COMPLAINT
# ============================================================

@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse,
)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
):
    """
    Public endpoint.

    Anyone can view a complaint.
    """

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id
            == complaint_id
        )
        .first()
    )


    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found.",
        )


    return complaint