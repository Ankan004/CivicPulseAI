from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

import shutil

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

@router.post("/")
async def upload_image(
    file: UploadFile = File(...)
):
    path = f"uploads/{file.filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "image_url":
        f"https://civicpulseai-production.up.railway.app//{path}"
    }