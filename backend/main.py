from fastapi import FastAPI

app = FastAPI(
    title="CivicPulse AI",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "CivicPulse AI Backend Running"
    }