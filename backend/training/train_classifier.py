import pandas as pd
import joblib

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

# Load Dataset

df = pd.read_csv(
    "expanded_dataset.csv"
)

# Create Combined Text

df["text"] = (
    df["title"] +
    " " +
    df["description"]
)

X = df["text"]

# =========================
# CATEGORY MODEL
# =========================

category_model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer()
    ),
    (
        "rf",
        RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    )
])

category_model.fit(
    X,
    df["category"]
)

joblib.dump(
    category_model,
    "category_model.pkl"
)

# =========================
# SEVERITY MODEL
# =========================

severity_model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer()
    ),
    (
        "rf",
        RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    )
])

severity_model.fit(
    X,
    df["severity"]
)

joblib.dump(
    severity_model,
    "severity_model.pkl"
)

# =========================
# PRIORITY MODEL
# =========================

priority_model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer()
    ),
    (
        "rf",
        RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    )
])

priority_model.fit(
    X,
    df["priority"]
)

joblib.dump(
    priority_model,
    "priority_model.pkl"
)

print("✅ Category Model Saved")
print("✅ Severity Model Saved")
print("✅ Priority Model Saved")
print("🚀 All Models Trained Successfully")