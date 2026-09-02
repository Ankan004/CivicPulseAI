from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post("/classify")
def classify_complaint(
    data: dict,
    current_user: User = Depends(get_current_user),
):
    """
    Classify a civic complaint using the trained ML models.

    Login required.
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