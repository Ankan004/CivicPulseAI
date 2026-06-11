import time
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
import csv
from fastapi.responses import StreamingResponse
from io import StringIO
from geopy.distance import geodesic

from app.models.complaint import Complaint
from app.models.user import User
from app.core.admin import admin_required

from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate
)
from app.ml.duplicate_detector import (
    get_embedding,
    compare_embeddings
)
from app.ml.predict import analyze_complaint

from app.database.dependencies import get_db

from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)



@router.post("/")
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    start = time.time()

    # AI Prediction

    t = time.time()

    ai_result = analyze_complaint(
        complaint.title,
        complaint.description
    )

    print(
        f"AI Prediction: {time.time()-t:.2f}s"
    )

    print(
        "ML Prediction:",
        ai_result
    )

    # Duplicate Complaint Detection

    duplicate_start = time.time()

    new_text = (
        complaint.title +
        " " +
        complaint.description
    )

    new_embedding = get_embedding(
        new_text
    )

    existing_complaints = db.query(
        Complaint
    ).all()

    print(
        f"DB Fetch: {time.time()-duplicate_start:.2f}s"
    )

    for item in existing_complaints:

        existing_text = (
            item.title +
            " " +
            item.description
        )

        existing_embedding = get_embedding(
            existing_text
        )

        duplicate, score = compare_embeddings(
            new_embedding,
            existing_embedding
        )

        print(
            "Similarity Score:",
            score
        )

        distance = geodesic(
            (
                complaint.latitude,
                complaint.longitude
            ),
            (
                item.latitude,
                item.longitude
            )
        ).km

        print(
            "Distance:",
            distance,
            "km"
        )

        if duplicate and distance < 2:

            print(
                f"Duplicate Detection: {time.time()-duplicate_start:.2f}s"
            )

            print(
                f"TOTAL Complaint Time: {time.time()-start:.2f}s"
            )

            return {
                "message":
                    "Similar complaint already exists",

                "existing_complaint_id":
                    item.id,

                "existing_title":
                    item.title,

                "similarity_score":
                    round(score * 100, 2),

                "distance_km":
                    round(distance, 2),

                "status":
                    item.status
            }

    print(
        f"Duplicate Detection: {time.time()-duplicate_start:.2f}s"
    )

    # Save Complaint

    save_start = time.time()

    new_complaint = Complaint(
        title=complaint.title,
        description=complaint.description,

        category=ai_result["category"],
        severity=ai_result["severity"],
        priority=ai_result["priority"],

        latitude=complaint.latitude,
        longitude=complaint.longitude,

        image_url=complaint.image_url,

        user_id=current_user.id
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    print(
        f"DB Save: {time.time()-save_start:.2f}s"
    )

    print(
        f"TOTAL Complaint Time: {time.time()-start:.2f}s"
    )

    return new_complaint


    


@router.get(
    "/",
    response_model=list[ComplaintResponse]
)
def get_complaints(
    db: Session = Depends(get_db)
):
    return db.query(Complaint).all()


@router.get("/my-complaints")
def my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id
    ).all()

    return complaints


@router.patch("/{complaint_id}/status")
def update_status(
    complaint_id: int,
    data: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    admin_user = Depends(admin_required)
):

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {
            "message": "Complaint not found"
        }

    complaint.status = data.status

    db.commit()
    db.refresh(complaint)

    return complaint
@router.get("/{complaint_id}")
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db)
):

    complaint = db.query(
        Complaint
    ).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint
@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db)
):

    complaints = db.query(
        Complaint
    ).all()

    output = StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow([
        "ID",
        "Title",
        "Category",
        "Priority",
        "Status"
    ])

    for complaint in complaints:

        writer.writerow([
            complaint.id,
            complaint.title,
            complaint.category,
            complaint.priority,
            complaint.status
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=complaints.csv"
        }
    )