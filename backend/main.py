import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.base import Base
from app.database.session import engine

from app.models.user import User
from app.models.complaint import Complaint

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

# IMPORTANT:
# image_ai.py is the local ViT / Transformers / PyTorch system.
# We are NOT enabling it for now because your current frontend uses
# /vision/analyze-image (Gemini Vision), not /image-ai/analyze.
#
# from app.api.image_ai import router as image_ai_router


# =========================
# DATABASE
# =========================

Base.metadata.create_all(bind=engine)


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
        "https://civic-pulse-ai-ashy.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# REGISTER ROUTERS
# =========================

# Authentication
app.include_router(auth_router)

# Users
app.include_router(users_router)

# Citizen dashboard
app.include_router(dashboard_router)

# Admin dashboard
app.include_router(admin_dashboard_router)

# Complaints
app.include_router(complaints_router)

# AI text classification
app.include_router(ai_router)

# Gemini Vision
app.include_router(vision_router)

# Map
app.include_router(map_router)

# Risk Map
app.include_router(risk_map_router)

# AI Hotspots
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
# ROOT ENDPOINT
# =========================

@app.get("/")
def home():
    return {
        "message": "CivicPulse Backend Running",
        "status": "active"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================
# STATIC UPLOADS
# =========================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)