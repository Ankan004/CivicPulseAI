import io
import json
import os
import time

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)

from PIL import Image
from dotenv import load_dotenv

from app.models.user import User
from app.core.dependencies import get_current_user


load_dotenv()


router = APIRouter(
    prefix="/vision",
    tags=["Vision AI"],
)


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_NAME = "gemini-2.5-flash"

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


ALLOWED_CATEGORIES = {
    "Road",
    "Water",
    "Waste",
    "Electricity",
    "Drainage",
    "Streetlight",
    "Other",
}


ALLOWED_SEVERITIES = {
    "Low",
    "Medium",
    "High",
}


ALLOWED_PRIORITIES = {
    "Low",
    "Medium",
    "High",
}


# ============================================================
# GEMINI CLIENT
# ============================================================

def get_gemini_client():
    """
    Create the Gemini client lazily.

    Gemini is initialized only when Vision is actually used.
    """

    from google import genai

    api_key = os.getenv(
        "GOOGLE_API_KEY"
    )

    if not api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY environment variable is not configured."
        )

    return genai.Client(
        api_key=api_key
    )


# ============================================================
# FALLBACK RESPONSE
# ============================================================

def vision_error_response(
    message: str,
    description: str = "Vision analysis unavailable.",
):
    return {
        "error": True,
        "message": message,
        "category": "Other",
        "severity": "Medium",
        "priority": "Medium",
        "confidence": 0,
        "description": description,
    }


# ============================================================
# VISION ANALYSIS
# ============================================================

@router.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Analyze a civic complaint image using Gemini Vision.

    Authentication required.

    Allowed:
        - Citizen
        - Admin

    Not allowed:
        - Unauthenticated visitors
    """

    start = time.time()

    try:

        # ====================================================
        # FILE VALIDATION
        # ====================================================

        if not image.filename:
            raise HTTPException(
                status_code=400,
                detail="Image filename is required.",
            )


        if (
            image.content_type
            not in ALLOWED_CONTENT_TYPES
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported image type. "
                    "Allowed types: JPEG, PNG, WebP."
                ),
            )


        # ====================================================
        # READ IMAGE WITH SIZE LIMIT
        # ====================================================

        contents = await image.read(
            MAX_IMAGE_SIZE + 1
        )


        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )


        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image size must not exceed 5 MB.",
            )


        # ====================================================
        # OPEN IMAGE
        # ====================================================

        try:

            pil_image = Image.open(
                io.BytesIO(contents)
            )

            # Force image loading so corrupt images
            # are detected before sending them to Gemini.

            pil_image.load()

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid or unsupported image.",
            )


        # ====================================================
        # GEMINI CLIENT
        # ====================================================

        client = get_gemini_client()


        # ====================================================
        # PROMPT
        # ====================================================

        prompt = """
Analyze this civic complaint image.

Return ONLY valid JSON.

Example:

{
  "category": "Road",
  "severity": "High",
  "priority": "High",
  "confidence": 95,
  "description": "Large pothole detected on road surface."
}

Possible categories:

Road
Water
Waste
Electricity
Drainage
Streetlight
Other

Severity values:

Low
Medium
High

Priority values:

Low
Medium
High

Rules:

- Return raw JSON only.
- Do not use markdown.
- Do not use ```json.
- Confidence must be between 0 and 100.
- The description should briefly explain the civic issue visible in the image.
"""


        # ====================================================
        # GEMINI REQUEST
        # ====================================================

        from google.genai import types

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                prompt,
                pil_image,
            ],
            config=types.GenerateContentConfig(
                temperature=0,
            ),
        )


        elapsed = (
            time.time() - start
        )

        print(
            f"Gemini Vision Time: {elapsed:.2f}s"
        )


        # ====================================================
        # RESPONSE TEXT
        # ====================================================

        text = (
            response.text or ""
        ).strip()


        if not text:

            return vision_error_response(
                "Gemini returned an empty response.",
                "Vision analysis returned no result.",
            )


        # ====================================================
        # REMOVE MARKDOWN FENCES
        # ====================================================

        if text.startswith(
            "```json"
        ):

            text = text[
                len("```json"):
            ]

        elif text.startswith(
            "```"
        ):

            text = text[
                len("```"):
            ]


        if text.endswith(
            "```"
        ):

            text = text[
                :-3
            ]


        text = text.strip()


        # ====================================================
        # PARSE JSON
        # ====================================================

        try:

            result = json.loads(
                text
            )

        except json.JSONDecodeError:

            return vision_error_response(
                "Gemini returned an invalid response.",
                "Vision analysis could not be parsed.",
            )


        # ====================================================
        # NORMALIZE CATEGORY
        # ====================================================

        category = result.get(
            "category",
            "Other",
        )

        if category not in ALLOWED_CATEGORIES:

            category = "Other"


        # ====================================================
        # NORMALIZE SEVERITY
        # ====================================================

        severity = result.get(
            "severity",
            "Medium",
        )

        if severity not in ALLOWED_SEVERITIES:

            severity = "Medium"


        # ====================================================
        # NORMALIZE PRIORITY
        # ====================================================

        priority = result.get(
            "priority",
            "Medium",
        )

        if priority not in ALLOWED_PRIORITIES:

            priority = "Medium"


        # ====================================================
        # NORMALIZE CONFIDENCE
        # ====================================================

        confidence = result.get(
            "confidence",
            0,
        )

        try:

            confidence = float(
                confidence
            )

            confidence = max(
                0,
                min(
                    confidence,
                    100,
                ),
            )

            confidence = round(
                confidence,
                2,
            )

        except (
            TypeError,
            ValueError,
        ):

            confidence = 0


        # ====================================================
        # DESCRIPTION
        # ====================================================

        description = result.get(
            "description",
            "Vision analysis completed.",
        )


        if not isinstance(
            description,
            str,
        ):

            description = (
                "Vision analysis completed."
            )


        # Prevent unnecessarily huge model output.

        description = description[
            :1000
        ]


        # ====================================================
        # SUCCESS
        # ====================================================

        return {
            "category": category,
            "severity": severity,
            "priority": priority,
            "confidence": confidence,
            "description": description,
        }


    # ========================================================
    # HTTP ERRORS
    # ========================================================

    except HTTPException:
        raise


    # ========================================================
    # GENERAL ERRORS
    # ========================================================

    except Exception as e:

        error = str(e)

        print(
            "Vision Error:",
            error,
        )


        # ----------------------------------------------------
        # GEMINI QUOTA
        # ----------------------------------------------------

        if (
            "429" in error
            or "quota"
            in error.lower()
            or "resource exhausted"
            in error.lower()
        ):

            return vision_error_response(
                "Gemini quota exceeded. Please try again later.",
                "Vision analysis is temporarily unavailable.",
            )


        # ----------------------------------------------------
        # GENERIC ERROR
        # ----------------------------------------------------

        return vision_error_response(
            "Vision analysis failed.",
            "The image could not be analyzed at this time.",
        )