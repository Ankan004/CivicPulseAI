from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.dependencies import get_db
from app.models.complaint import Complaint
import requests

router = APIRouter(
    prefix="/disaster",
    tags=["Disaster"]
)

API_KEY = "ed4af3893c384deeaf9155217260206"


@router.get("/risk")
def disaster_risk(
    lat: float,
    lon: float,
    db: Session = Depends(get_db)
):

    try:

        response = requests.get(
            "https://api.weatherapi.com/v1/current.json",
            params={
                "key": API_KEY,
                "q": f"{lat},{lon}"
            },
            timeout=10
        )

        data = response.json()

    except Exception:

        return {
            "flood_risk": 0,
            "thunderstorm_risk": 0,
            "heatwave_risk": 0,
            "temperature": 0,
            "humidity": 0,
            "wind_speed": 0,
            "status": "Weather service unavailable"
        }

    temp = data["current"]["temp_c"]

    humidity = data["current"]["humidity"]

    wind = data["current"]["wind_kph"]

    nearby_complaints = db.query(
        Complaint
    ).filter(
        Complaint.latitude.between(
            lat - 0.05,
            lat + 0.05
        ),
        Complaint.longitude.between(
            lon - 0.05,
            lon + 0.05
        )
    ).all()

    drainage_count = len([
        c for c in nearby_complaints
        if c.category and
        "drain" in c.category.lower()
    ])

    water_count = len([
        c for c in nearby_complaints
        if c.category and
        "water" in c.category.lower()
    ])

    road_count = len([
        c for c in nearby_complaints
        if c.category and
        "road" in c.category.lower()
    ])

    flood_risk = min(
        100,
        int(
            humidity * 0.4 +
            wind * 0.2 +
            drainage_count * 3 +
            water_count * 2
        )
    )

    thunderstorm_risk = min(
        100,
        int(
            humidity * 0.5 +
            wind * 0.8
        )
    )

    heatwave_risk = min(
        100,
        int(temp * 2)
    )

    return {
        "flood_risk": flood_risk,
        "thunderstorm_risk": thunderstorm_risk,
        "heatwave_risk": heatwave_risk,

        "drainage_complaints": drainage_count,
        "water_complaints": water_count,
        "road_complaints": road_count,

        "temperature": temp,
        "humidity": humidity,
        "wind_speed": wind
    }