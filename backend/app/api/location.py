import os

import requests

from fastapi import APIRouter
from fastapi import HTTPException


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/location",
    tags=["Location"],
)


# ============================================================
# CONFIGURATION
# ============================================================

GEOCODING_API_KEY = os.getenv(
    "GEOCODING_API_KEY"
)


GEOCODING_URL = (
    "https://geocode.maps.co/search"
)


# ============================================================
# LOCATION SEARCH
# ============================================================

@router.get("/search")
def search_location(
    q: str,
):
    """
    Public location search.

    Used by the map/location picker.

    Authentication is intentionally NOT required.
    """

    # ========================================================
    # API KEY
    # ========================================================

    if not GEOCODING_API_KEY:

        raise HTTPException(
            status_code=500,
            detail=(
                "Location service is not configured."
            ),
        )


    # ========================================================
    # QUERY VALIDATION
    # ========================================================

    if not isinstance(
        q,
        str,
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid search query.",
        )


    q = q.strip()


    if not q:

        raise HTTPException(
            status_code=400,
            detail=(
                "Search query cannot be empty."
            ),
        )


    # Prevent unnecessarily large requests.

    if len(q) > 200:

        raise HTTPException(
            status_code=400,
            detail=(
                "Search query is too long."
            ),
        )


    # ========================================================
    # GEOCODING REQUEST
    # ========================================================

    try:

        response = requests.get(
            GEOCODING_URL,

            params={
                "q": q,
                "api_key":
                    GEOCODING_API_KEY,
            },

            timeout=10,
        )

        response.raise_for_status()


    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail=(
                "Location service timed out."
            ),
        )


    except requests.exceptions.HTTPError:

        raise HTTPException(
            status_code=502,
            detail=(
                "Location service returned an error."
            ),
        )


    except requests.exceptions.RequestException:

        raise HTTPException(
            status_code=502,
            detail=(
                "Location service is unavailable."
            ),
        )


    # ========================================================
    # PARSE RESPONSE
    # ========================================================

    try:

        data = response.json()

    except ValueError:

        raise HTTPException(
            status_code=502,
            detail=(
                "Invalid response from "
                "location service."
            ),
        )


    # ========================================================
    # NORMALIZE RESPONSE
    # ========================================================

    if not isinstance(
        data,
        list,
    ):

        return []


    results = []


    for item in data[:5]:

        if not isinstance(
            item,
            dict,
        ):
            continue


        results.append(
            {
                "place_id":
                    item.get(
                        "place_id"
                    ),

                "display_name":
                    item.get(
                        "display_name"
                    ),

                "lat":
                    item.get(
                        "lat"
                    ),

                "lon":
                    item.get(
                        "lon"
                    ),
            }
        )


    return results