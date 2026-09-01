import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.base import Base
from app.database.session import engine

from app.models.user import User
from app.models.complaint import Complaint

# =========================
# LOGGING
# =========================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civicpulse")


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="CivicPulse AI",
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Current frontend deployment
        "https://civic-pulse-ai-ashy.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CivicPulse AI backend"
    }


# =========================
# ROOT ENDPOINT
# =========================

@app.get("/")
def home():
    return {
        "message": "CivicPulse Backend Running",
        "status": "active"
    }


# =========================
# DATABASE INITIALIZATION
# =========================

@app.on_event("startup")
def initialize_database():
    """
    Initialize database tables after the FastAPI application
    has been loaded.

    Database errors are logged instead of preventing the
    application process from starting.
    """

    try:
        logger.info("Initializing database...")

        Base.metadata.create_all(bind=engine)

        logger.info("Database initialization completed successfully.")

    except Exception as exc:
        logger.exception(
            "Database initialization failed: %s",
            exc
        )


# =========================
# API ROUTERS
# =========================

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.dashboard import router as dashboard_router
from app.api.map_dashboard import router as map_router
from app.api.upload import router as upload_router
from app.api.location import router as location_router
from app.api.weather import router as weather_router

from app.api.complaints import router as complaints_router
from app.api.ai import router as ai_router
from app.api.vision import router as vision_router
from app.api.risk_map import router as risk_map_router
from app.api.hotspots import router as hotspots_router
from app.api.analytics import router as analytics_router
from app.api.assistant import router as assistant_router
from app.api.disaster import router as disaster_router
from app.api.admin_dashboard import router as admin_dashboard_router


# =========================
# REGISTER ROUTERS
# =========================

app.include_router(auth_router)
app.include_router(users_router)

app.include_router(dashboard_router)
app.include_router(admin_dashboard_router)

app.include_router(complaints_router)

# AI text classification
app.include_router(ai_router)

# Gemini Vision
app.include_router(vision_router)

# Maps
app.include_router(map_router)
app.include_router(risk_map_router)

# Hotspots
app.include_router(hotspots_router)

# Analytics
app.include_router(analytics_router)

# AI Assistant
app.include_router(assistant_router)

# Disaster intelligence
app.include_router(disaster_router)

# Weather
app.include_router(weather_router)

# Location search
app.include_router(location_router)

# Image upload
app.include_router(upload_router)


# =========================
# UPLOAD DIRECTORY
# =========================

os.makedirs("uploads", exist_ok=True)


# =========================
# STATIC UPLOADS
# =========================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)