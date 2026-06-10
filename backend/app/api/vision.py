from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

import google.generativeai as genai

from PIL import Image

import io
import os
import json
import time

router = APIRouter(
    prefix="/vision",
    tags=["Vision AI"]
)

genai.configure(
    api_key=os.getenv(
        "GOOGLE_API_KEY"
    )
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


@router.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...)
):

    try:

        start = time.time()

        contents = await image.read()

        pil_image = Image.open(
            io.BytesIO(contents)
        )

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
- Return raw JSON only
- Do not use markdown
- Do not use ```json
- Confidence should be between 0 and 100
"""

        response = model.generate_content(
            [prompt, pil_image]
        )

        print(
            f"Gemini Vision Time: {time.time()-start:.2f}s"
        )

        text = response.text.strip()

        text = text.replace(
            "```json",
            ""
        )

        text = text.replace(
            "```",
            ""
        )

        result = json.loads(
            text
        )

        return result

    except Exception as e:

        error = str(e)

        print(
            "Vision Error:",
            error
        )

        if "429" in error:

            return {
                "error": True,
                "message":
                    "Gemini quota exceeded. Please try again later.",
                "category": "Other",
                "severity": "Medium",
                "priority": "Medium",
                "confidence": 0,
                "description":
                    "Vision analysis unavailable."
            }

        return {
            "error": True,
            "message": error,
            "category": "Other",
            "severity": "Medium",
            "priority": "Medium",
            "confidence": 0,
            "description":
                "Failed to analyze image."
        }