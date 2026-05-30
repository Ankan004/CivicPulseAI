from fastapi import FastAPI

from app.database.base import Base
from app.database.session import engine

from app.models.user import User
from app.models.complaint import Complaint

from app.api.auth import router as auth_router
from app.api.complaints import router as complaint_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicPulse AI"
)

app.include_router(auth_router)
app.include_router(complaint_router)


@app.get("/")
def home():
    return {
        "message": "CivicPulse Backend Running"
    }