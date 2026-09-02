import os

import requests

from fastapi import APIRouter
from fastapi import HTTPException


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/weather",
    tags=["Weather"],
)


# ============================================================
# CONFIGURATION
# ============================================================

API_KEY = os.getenv(
    "WEATHER_API_KEY"
)

WEATHER_URL = (
    "https://api.weatherapi.com/v1/current.json"
)


# ============================================================
# CURRENT WEATHER
# ============================================================

@router.get("/current")
def current_weather(
    lat: float,
    lon: float,
):
    """
    Get current weather for a latitude/longitude.

    Public endpoint.

    Authentication is intentionally NOT required.
    """

    # ========================================================
    # API KEY
    # ========================================================

    if not API_KEY:

        raise HTTPException(
            status_code=500,
            detail=(
                "Weather service is not configured."
            ),
        )


    # ========================================================
    # COORDINATE VALIDATION
    # ========================================================

    if not -90 <= lat <= 90:

        raise HTTPException(
            status_code=400,
            detail="Invalid latitude.",
        )


    if not -180 <= lon <= 180:

        raise HTTPException(
            status_code=400,
            detail="Invalid longitude.",
        )


    # ========================================================
    # WEATHER API REQUEST
    # ========================================================

    try:

        response = requests.get(
            WEATHER_URL,

            params={
                "key": API_KEY,
                "q": f"{lat},{lon}",
            },

            timeout=10,
        )

        response.raise_for_status()


    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail=(
                "Weather service timed out."
            ),
        )


    except requests.exceptions.HTTPError:

        raise HTTPException(
            status_code=502,
            detail=(
                "Weather service returned an error."
            ),
        )


    except requests.exceptions.RequestException:

        raise HTTPException(
            status_code=502,
            detail=(
                "Weather service is unavailable."
            ),
        )


    # ========================================================
    # RESPONSE VALIDATION
    # ========================================================

    try:

        data = response.json()

    except ValueError:

        raise HTTPException(
            status_code=502,
            detail=(
                "Invalid response from "
                "weather service."
            ),
        )


    return data