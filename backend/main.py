from fastapi import FastAPI

from app.database.base import Base
from app.database.session import engine

from app.models.user import User


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicPulse AI"
)


@app.get("/")
def home():
    return {
        "message": "CivicPulse Backend Running"
    }