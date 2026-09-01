from fastapi import APIRouter

from app.ml.predict import (
    analyze_complaint
)

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

@router.post("/classify")
def classify_complaint(
    data: dict
):

    title = data.get(
        "title",
        ""
    )

    description = data.get(
        "description",
        ""
    )

    result = analyze_complaint(
        title,
        description
    )

    return result