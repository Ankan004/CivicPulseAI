import io
import json
import os
import time

from fastapi import APIRouter, UploadFile, File
from PIL import Image
from dotenv import load_dotenv


load_dotenv()


router = APIRouter(
    prefix="/vision",
    tags=["Vision AI"],
)


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

MODEL_NAME = "gemini-2.5-flash"


def get_gemini_client():
    """
    Create the Gemini client only when Vision is actually used.

    This prevents Gemini initialization from blocking FastAPI
    startup.
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
# VISION ANALYSIS
# ============================================================

@router.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...),
):
    try:

        start = time.time()

        # ----------------------------------------------------
        # Read uploaded image
        # ----------------------------------------------------

        contents = await image.read()

        if not contents:
            return {
                "error": True,
                "message": "Uploaded image is empty.",
                "category": "Other",
                "severity": "Medium",
                "priority": "Medium",
                "confidence": 0,
                "description": "No image data was provided.",
            }

        # ----------------------------------------------------
        # Open image
        # ----------------------------------------------------

        try:

            pil_image = Image.open(
                io.BytesIO(contents)
            )

            # Force image loading so invalid/corrupt images
            # are detected before sending to Gemini.
            pil_image.load()

        except Exception:

            return {
                "error": True,
                "message": "Invalid or unsupported image.",
                "category": "Other",
                "severity": "Medium",
                "priority": "Medium",
                "confidence": 0,
                "description": "The uploaded file could not be read as an image.",
            }

        # ----------------------------------------------------
        # Gemini client
        # ----------------------------------------------------

        client = get_gemini_client()

        # ----------------------------------------------------
        # Prompt
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Gemini Vision request
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Response validation
        # ----------------------------------------------------

        text = (
            response.text or ""
        ).strip()

        if not text:

            return {
                "error": True,
                "message": "Gemini returned an empty response.",
                "category": "Other",
                "severity": "Medium",
                "priority": "Medium",
                "confidence": 0,
                "description": "Vision analysis returned no result.",
            }

        # Remove accidental markdown fences.

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

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        result = json.loads(
            text
        )

        # ----------------------------------------------------
        # Normalize result
        # ----------------------------------------------------

        category = result.get(
            "category",
            "Other",
        )

        severity = result.get(
            "severity",
            "Medium",
        )

        priority = result.get(
            "priority",
            "Medium",
        )

        confidence = result.get(
            "confidence",
            0,
        )

        description = result.get(
            "description",
            "Vision analysis completed.",
        )

        # Keep confidence within 0-100.

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

        return {
            "category": category,
            "severity": severity,
            "priority": priority,
            "confidence": confidence,
            "description": description,
        }

    except Exception as e:

        error = str(e)

        print(
            "Vision Error:",
            error,
        )

        # ----------------------------------------------------
        # Gemini quota
        # ----------------------------------------------------

        if (
            "429" in error
            or "quota" in error.lower()
            or "resource exhausted"
            in error.lower()
        ):

            return {
                "error": True,
                "message":
                    "Gemini quota exceeded. "
                    "Please try again later.",
                "category": "Other",
                "severity": "Medium",
                "priority": "Medium",
                "confidence": 0,
                "description":
                    "Vision analysis unavailable.",
            }

        # ----------------------------------------------------
        # Generic error
        # ----------------------------------------------------

        return {
            "error": True,
            "message": error,
            "category": "Other",
            "severity": "Medium",
            "priority": "Medium",
            "confidence": 0,
            "description":
                "Failed to analyze image.",
        }