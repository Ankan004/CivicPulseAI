from fastapi import APIRouter, UploadFile, File

from google import genai
from google.genai import types

from PIL import Image
from dotenv import load_dotenv


import io
import os
import json
import time
load_dotenv()


router = APIRouter(
    prefix="/vision",
    tags=["Vision AI"]
)


# =========================
# GEMINI CONFIGURATION
# =========================

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)

MODEL_NAME = "gemini-2.5-flash"


# =========================
# VISION ANALYSIS
# =========================

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

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                prompt,
                pil_image
            ],
            config=types.GenerateContentConfig(
                temperature=0
            )
        )

        print(
            f"Gemini Vision Time: {time.time() - start:.2f}s"
        )

        text = response.text.strip()

        # Remove accidental markdown fences
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

        result = json.loads(text)

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
                "message": "Gemini quota exceeded. Please try again later.",
                "category": "Other",
                "severity": "Medium",
                "priority": "Medium",
                "confidence": 0,
                "description": "Vision analysis unavailable."
            }

        return {
            "error": True,
            "message": error,
            "category": "Other",
            "severity": "Medium",
            "priority": "Medium",
            "confidence": 0,
            "description": "Failed to analyze image."
        }