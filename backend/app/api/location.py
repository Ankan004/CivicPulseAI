from fastapi import APIRouter
import requests

router = APIRouter(
    prefix="/location",
    tags=["Location"]
)

@router.get("/search")
def search_location(q: str):

    response = requests.get(
        "https://geocode.maps.co/search",
        params={
            "q": q,
            "api_key": "6a1e74ec1baf4674310806fgsb0a1b5"
        }
    )

    data = response.json()

    return [
        {
            "place_id": item.get("place_id"),
            "display_name": item.get("display_name"),
            "lat": item.get("lat"),
            "lon": item.get("lon"),
        }
        for item in data[:5]
    ]