from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

import google.generativeai as genai
from PIL import Image
import io
import os

router = APIRouter(
    prefix="/vision",
    tags=["Vision AI"]
)

genai.configure(
    api_key=os.getenv("GOOGLE_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


@router.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...)
):

    try:

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

Do not return markdown.
Do not use ```json.
Return raw JSON only.
"""

        response = model.generate_content(
            [prompt, pil_image]
        )

        import json

        text = response.text.strip()

        # Remove accidental markdown if Gemini adds it

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

    if "429" in error:

        return {
            "error": True,
            "message":
                "Gemini quota exceeded. Please try again later.",
            "category": "Other",
            "severity": "Medium",
            "priority": "Medium",
            "confidence": 0
        }

    return {
        "error": True,
        "message": error
    }