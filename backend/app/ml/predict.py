import joblib
from pathlib import Path

BASE = Path(__file__).parent

_category_model = None
_severity_model = None
_priority_model = None


def get_category_model():
    global _category_model

    if _category_model is None:
        print("Loading category model...")
        _category_model = joblib.load(
            BASE / "category_model.pkl"
        )

    return _category_model


def get_severity_model():
    global _severity_model

    if _severity_model is None:
        print("Loading severity model...")
        _severity_model = joblib.load(
            BASE / "severity_model.pkl"
        )

    return _severity_model


def get_priority_model():
    global _priority_model

    if _priority_model is None:
        print("Loading priority model...")
        _priority_model = joblib.load(
            BASE / "priority_model.pkl"
        )

    return _priority_model


def analyze_complaint(
    title: str,
    description: str
):
    text = title + " " + description

    category_model = get_category_model()
    severity_model = get_severity_model()
    priority_model = get_priority_model()

    category = category_model.predict(
        [text]
    )[0]

    try:
        category_confidence = max(
            category_model.predict_proba(
                [text]
            )[0]
        )
    except Exception:
        category_confidence = None

    severity = severity_model.predict(
        [text]
    )[0]

    priority = priority_model.predict(
        [text]
    )[0]

    return {
        "category": category,
        "severity": severity,
        "priority": priority,
        "category_confidence":
            round(category_confidence * 100, 2)
            if category_confidence is not None
            else None
    }


def predict_category(
    title: str,
    description: str
):
    result = analyze_complaint(
        title,
        description
    )

    return result["category"]