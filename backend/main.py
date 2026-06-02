from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.location import router as location_router

from app.database.base import Base
from app.database.session import engine

from app.models.user import User
from app.models.complaint import Complaint

from app.api.auth import router as auth_router
from app.api.complaints import router as complaint_router
from app.api.users import router as users_router
from app.api.dashboard import router as dashboard_router
from app.api.map_dashboard import router as map_router
from app.api.upload import router as upload_router
from app.api.location import router as location_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicPulse AI"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(complaint_router)
app.include_router(users_router)
app.include_router(dashboard_router)
app.include_router(map_router)
app.include_router(upload_router)
app.include_router(location_router)


@app.get("/")
def home():
    return {
        "message": "CivicPulse Backend Running"
    }
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)