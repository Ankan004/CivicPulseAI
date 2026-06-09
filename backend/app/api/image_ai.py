from fastapi import APIRouter
from fastapi import UploadFile

from app.ml.image_classifier import (
    analyze_image
)

router = APIRouter(
    prefix="/image-ai",
    tags=["Image AI"]
)

@router.post("/analyze")
async def analyze(
    file: UploadFile
):

    path = f"temp_{file.filename}"

    with open(
        path,
        "wb"
    ) as buffer:

        buffer.write(
            await file.read()
        )

    result = analyze_image(
        path
    )

    return result