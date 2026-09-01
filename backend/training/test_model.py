import joblib

model = joblib.load(
    "category_model.pkl"
)

text = (
    "Huge pothole near railway station"
)

prediction = model.predict(
    [text]
)

print(prediction[0])