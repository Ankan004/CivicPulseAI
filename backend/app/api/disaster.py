import os

import requests

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/disaster",
    tags=["Disaster"],
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
# DISASTER RISK
# ============================================================

@router.get("/risk")
def disaster_risk(
    lat: float,
    lon: float,
    db: Session = Depends(get_db),
):
    """
    Calculate approximate disaster risk using:

    - Current weather
    - Nearby drainage complaints
    - Nearby water complaints
    - Nearby road complaints

    Public endpoint.

    Authentication is intentionally NOT required.
    """

    # ========================================================
    # API KEY CHECK
    # ========================================================

    if not API_KEY:

        raise HTTPException(
            status_code=500,
            detail=(
                "Disaster risk service is not configured."
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
    # WEATHER REQUEST
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

        return {
            "flood_risk": 0,
            "thunderstorm_risk": 0,
            "heatwave_risk": 0,
            "temperature": 0,
            "humidity": 0,
            "wind_speed": 0,
            "status": (
                "Weather service unavailable"
            ),
        }


    except requests.exceptions.RequestException:

        return {
            "flood_risk": 0,
            "thunderstorm_risk": 0,
            "heatwave_risk": 0,
            "temperature": 0,
            "humidity": 0,
            "wind_speed": 0,
            "status": (
                "Weather service unavailable"
            ),
        }


    # ========================================================
    # PARSE WEATHER RESPONSE
    # ========================================================

    try:

        data = response.json()

        current = data["current"]

        temp = float(
            current["temp_c"]
        )

        humidity = float(
            current["humidity"]
        )

        wind = float(
            current["wind_kph"]
        )

    except (
        ValueError,
        KeyError,
        TypeError,
    ):

        return {
            "flood_risk": 0,
            "thunderstorm_risk": 0,
            "heatwave_risk": 0,
            "temperature": 0,
            "humidity": 0,
            "wind_speed": 0,
            "status": (
                "Invalid weather data"
            ),
        }


    # ========================================================
    # NEARBY COMPLAINTS
    # ========================================================

    nearby_complaints = (
        db.query(Complaint)
        .filter(
            Complaint.latitude.between(
                lat - 0.05,
                lat + 0.05,
            ),
            Complaint.longitude.between(
                lon - 0.05,
                lon + 0.05,
            ),
        )
        .all()
    )


    # ========================================================
    # CATEGORY COUNTS
    # ========================================================

    drainage_count = sum(
        1
        for complaint
        in nearby_complaints
        if (
            complaint.category
            and "drain"
            in complaint.category.lower()
        )
    )


    water_count = sum(
        1
        for complaint
        in nearby_complaints
        if (
            complaint.category
            and "water"
            in complaint.category.lower()
        )
    )


    road_count = sum(
        1
        for complaint
        in nearby_complaints
        if (
            complaint.category
            and "road"
            in complaint.category.lower()
        )
    )


    # ========================================================
    # FLOOD RISK
    # ========================================================

    flood_risk = min(
        100,
        int(
            humidity * 0.4
            + wind * 0.2
            + drainage_count * 3
            + water_count * 2
        ),
    )


    # ========================================================
    # THUNDERSTORM RISK
    # ========================================================

    thunderstorm_risk = min(
        100,
        int(
            humidity * 0.5
            + wind * 0.8
        ),
    )


    # ========================================================
    # HEATWAVE RISK
    # ========================================================

    heatwave_risk = min(
        100,
        int(
            temp * 2
        ),
    )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "flood_risk": flood_risk,
        "thunderstorm_risk":
            thunderstorm_risk,
        "heatwave_risk":
            heatwave_risk,

        "drainage_complaints":
            drainage_count,

        "water_complaints":
            water_count,

        "road_complaints":
            road_count,

        "temperature":
            temp,

        "humidity":
            humidity,

        "wind_speed":
            wind,

        "status":
            "success",
    }