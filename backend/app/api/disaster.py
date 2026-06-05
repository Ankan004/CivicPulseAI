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

    response = requests.get(
        "http://api.weatherapi.com/v1/current.json",
        params={
            "key": API_KEY,
            "q": f"{lat},{lon}"
        }
    )

    data = response.json()

    temp = data["current"]["temp_c"]
    humidity = data["current"]["humidity"]
    wind = data["current"]["wind_kph"]

    drainage_count = db.query(
        Complaint
    ).filter(
        Complaint.category.ilike("%drain%")
    ).count()

    water_count = db.query(
        Complaint
    ).filter(
        Complaint.category.ilike("%water%")
    ).count()

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

    "temperature": temp,
    "humidity": humidity,
    "wind_speed": wind,
}