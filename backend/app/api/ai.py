from fastapi import APIRouter


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post("/classify")
def classify_complaint(
    data: dict,
):
    """
    Classify a civic complaint using the trained ML models.

    Models are loaded lazily when this endpoint is called.
    """

    # Lazy import so ML models are not loaded during startup.
    from app.ml.predict import analyze_complaint

    title = data.get(
        "title",
        "",
    )

    description = data.get(
        "description",
        "",
    )

    result = analyze_complaint(
        title,
        description,
    )

    return result