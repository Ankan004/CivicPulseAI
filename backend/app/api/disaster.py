from fastapi import APIRouter
import requests

router = APIRouter(
    prefix="/disaster",
    tags=["Disaster"]
)

API_KEY = "ed4af3893c384deeaf9155217260206"


@router.get("/risk")
def disaster_risk():

    response = requests.get(
        "http://api.weatherapi.com/v1/current.json",
        params={
            "key": API_KEY,
            "q": "Bardhaman"
        }
    )

    data = response.json()

    temp = data["current"]["temp_c"]
    humidity = data["current"]["humidity"]
    wind = data["current"]["wind_kph"]

    flood_risk = min(
        100,
        int((humidity * 0.6) + (wind * 0.4))
    )

    heatwave_risk = min(
        100,
        int(temp * 2)
    )

    thunderstorm_risk = min(
        100,
        int((humidity * 0.5) + (wind * 0.8))
    )

    return {
        "flood_risk": flood_risk,
        "heatwave_risk": heatwave_risk,
        "thunderstorm_risk": thunderstorm_risk,
    }