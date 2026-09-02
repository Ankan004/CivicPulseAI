import os
import uuid

from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)

from PIL import Image

from app.models.user import User
from app.core.dependencies import get_current_user


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


# ============================================================
# CONFIGURATION
# ============================================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


MAX_FILE_SIZE = 5 * 1024 * 1024


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


# ============================================================
# UPLOAD IMAGE
# ============================================================

@router.post("/")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Upload a complaint image.

    Authentication required.

    Allowed:
        JPG
        JPEG
        PNG
        WEBP

    Maximum size:
        5 MB
    """

    # ========================================================
    # VALIDATE FILENAME
    # ========================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No filename provided.",
        )


    # ========================================================
    # VALIDATE EXTENSION
    # ========================================================

    extension = (
        Path(file.filename)
        .suffix
        .lower()
    )


    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid image type. "
                "Allowed: JPG, JPEG, PNG, WEBP."
            ),
        )


    # ========================================================
    # VALIDATE MIME TYPE
    # ========================================================

    if (
        file.content_type
        not in ALLOWED_CONTENT_TYPES
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid image content type."
            ),
        )


    # ========================================================
    # READ FILE WITH SIZE LIMIT
    # ========================================================

    total_size = 0

    chunks = []

    try:

        while True:

            chunk = await file.read(
                1024 * 1024
            )

            if not chunk:
                break

            total_size += len(
                chunk
            )


            if total_size > MAX_FILE_SIZE:

                raise HTTPException(
                    status_code=413,
                    detail=(
                        "Image is too large. "
                        "Maximum size is 5 MB."
                    ),
                )


            chunks.append(
                chunk
            )


    finally:

        await file.close()


    # ========================================================
    # EMPTY FILE CHECK
    # ========================================================

    if total_size == 0:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )


    # ========================================================
    # BUILD IMAGE BYTES
    # ========================================================

    file_data = b"".join(
        chunks
    )


    # ========================================================
    # VALIDATE ACTUAL IMAGE CONTENT
    # ========================================================

    try:

        image = Image.open(
            __import__("io").BytesIO(
                file_data
            )
        )

        # Force Pillow to actually decode
        # the image.

        image.load()

        detected_format = (
            image.format
            or ""
        ).upper()


    except Exception:

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded file is not a valid image."
            ),
        )


    # ========================================================
    # VERIFY IMAGE FORMAT
    # ========================================================

    allowed_formats = {
        "JPEG",
        "PNG",
        "WEBP",
    }


    if detected_format not in allowed_formats:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format."
            ),
        )


    # ========================================================
    # GENERATE SAFE RANDOM FILENAME
    # ========================================================

    filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )


    destination = (
        UPLOAD_DIR
        / filename
    )


    # ========================================================
    # SAVE IMAGE
    # ========================================================

    try:

        with open(
            destination,
            "wb",
        ) as buffer:

            buffer.write(
                file_data
            )


    except Exception as exc:

        if destination.exists():

            try:
                destination.unlink()
            except OSError:
                pass


        raise HTTPException(
            status_code=500,
            detail="Failed to save image.",
        ) from exc


    # ========================================================
    # PRODUCTION URL
    # ========================================================

    base_url = os.getenv("BACKEND_URL")
    if not base_url:
        raise HTTPException(
            status_code=500,
             detail="BACKEND_URL is not configured.",
        )
    base_url = base_url.rstrip("/")
        


    image_url = (
        f"{base_url}/uploads/{filename}"
    )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "image_url": image_url,
        "filename": filename,
        "size": total_size,
        "content_type": file.content_type,
    }