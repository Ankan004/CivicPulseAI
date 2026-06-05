from fastapi import APIRouter
import requests

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)

API_KEY = "ed4af3893c384deeaf9155217260206"

@router.get("/current")
def current_weather(
    lat: float,
    lon: float
):

    response = requests.get(
        "http://api.weatherapi.com/v1/current.json",
        params={
            "key": API_KEY,
            "q": f"{lat},{lon}"
        }
    )

    return response.json()


