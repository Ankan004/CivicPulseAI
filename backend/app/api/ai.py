from fastapi import APIRouter

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

@router.post("/classify")
def classify_complaint(data: dict):

    text = data.get("text", "").lower()

    category = "General"
    severity = "Low"
    priority = "Low"

    # Category Detection

    if any(word in text for word in [
        "pothole",
        "road",
        "street",
        "accident"
    ]):
        category = "Road"

    elif any(word in text for word in [
        "water",
        "leakage",
        "pipe",
        "drain"
    ]):
        category = "Water"

    elif any(word in text for word in [
        "garbage",
        "waste",
        "dump"
    ]):
        category = "Waste"

    elif any(word in text for word in [
        "light",
        "electricity",
        "transformer",
        "power"
    ]):
        category = "Electricity"

    # Severity Detection

    if any(word in text for word in [
        "huge",
        "major",
        "dangerous",
        "critical",
        "flooding"
    ]):
        severity = "High"

    elif any(word in text for word in [
        "moderate",
        "medium"
    ]):
        severity = "Medium"

    # Priority Detection

    if severity == "High":
        priority = "High"

    elif severity == "Medium":
        priority = "Medium"

    return {
        "category": category,
        "severity": severity,
        "priority": priority
    }