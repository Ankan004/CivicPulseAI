import joblib
from pathlib import Path

BASE = Path(__file__).parent

category_model = joblib.load(
    BASE / "category_model.pkl"
)

severity_model = joblib.load(
    BASE / "severity_model.pkl"
)

priority_model = joblib.load(
    BASE / "priority_model.pkl"
)

def analyze_complaint(
    title: str,
    description: str
):
    text = title + " " + description

    print(type(category_model))

    category = category_model.predict(
    [text]
    )[0]

    try:

        category_confidence = max(
        category_model.predict_proba(
            [text]
        )[0]
      )

    except:

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
           round(
               category_confidence * 100,
               2
           )
           if category_confidence
           else None
    }

# Backward compatibility
def predict_category(
    title: str,
    description: str
):
    result = analyze_complaint(
        title,
        description
    )

    return result["category"]