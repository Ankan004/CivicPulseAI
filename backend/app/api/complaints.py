import csv
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException
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
from app.core.dependencies import get_current_user
from app.core.admin import admin_required


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

@router.post("/")
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a civic complaint.

    The trained ML models are loaded lazily only when a
    complaint is submitted.

    ML prediction:
        - category
        - severity
        - priority

    This keeps the models out of FastAPI startup.
    """

    # ========================================================
    # LAZY LOAD ML PREDICTION
    # ========================================================

    from app.ml.predict import analyze_complaint

    ai_result = analyze_complaint(
        complaint.title,
        complaint.description,
    )

    # ========================================================
    # ML RESULTS
    # ========================================================

    category = ai_result["category"]

    severity = ai_result["severity"]

    priority = ai_result["priority"]

    # ========================================================
    # CREATE DATABASE OBJECT
    # ========================================================

    new_complaint = Complaint(
        title=complaint.title,

        description=complaint.description,

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

    db.add(new_complaint)

    db.commit()

    db.refresh(new_complaint)

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

@router.get("/my-complaints")
def my_complaints(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    complaints = (
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

    return complaints


# ============================================================
# EXPORT CSV
# ============================================================

# IMPORTANT:
# Keep this route before /{complaint_id}

@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
):
    complaints = (
        db.query(Complaint)
        .order_by(
            Complaint.id.asc()
        )
        .all()
    )

    output = StringIO()

    writer = csv.writer(output)

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

    admin_user=Depends(
        admin_required
    ),
):
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
            detail="Complaint not found",
        )

    complaint.status = data.status

    db.commit()

    db.refresh(complaint)

    return complaint


# ============================================================
# GET SINGLE COMPLAINT
# ============================================================

@router.get(
    "/{complaint_id}"
)
def get_complaint(
    complaint_id: int,

    db: Session = Depends(get_db),
):
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
            detail="Complaint not found",
        )

    return complaint