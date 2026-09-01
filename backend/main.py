import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("civicpulse")


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="CivicPulse AI",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Current Vercel frontend
        "https://civic-pulse-ai-ashy.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def home():
    return {
        "message": "CivicPulse Backend Running",
        "status": "active",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CivicPulse AI backend",
    }


# ============================================================
# API ROUTERS
# ============================================================

from app.api.auth import router as auth_router
from app.api.users import router as users_router

from app.api.dashboard import router as dashboard_router
from app.api.admin_dashboard import router as admin_dashboard_router

from app.api.complaints import router as complaints_router

from app.api.ai import router as ai_router
from app.api.vision import router as vision_router
from app.api.assistant import router as assistant_router

from app.api.map_dashboard import router as map_router
from app.api.risk_map import router as risk_map_router
from app.api.hotspots import router as hotspots_router

from app.api.analytics import router as analytics_router

from app.api.disaster import router as disaster_router
from app.api.weather import router as weather_router

from app.api.location import router as location_router
from app.api.upload import router as upload_router


# ============================================================
# REGISTER ROUTERS
# ============================================================

# Authentication
app.include_router(auth_router)

# Users
app.include_router(users_router)

# Dashboards
app.include_router(dashboard_router)
app.include_router(admin_dashboard_router)

# Complaints
app.include_router(complaints_router)

# AI
app.include_router(ai_router)
app.include_router(vision_router)
app.include_router(assistant_router)

# Maps
app.include_router(map_router)
app.include_router(risk_map_router)

# Hotspots
app.include_router(hotspots_router)

# Analytics
app.include_router(analytics_router)

# Disaster / Weather
app.include_router(disaster_router)
app.include_router(weather_router)

# Location
app.include_router(location_router)

# Uploads
app.include_router(upload_router)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

os.makedirs("uploads", exist_ok=True)


# ============================================================
# STATIC UPLOADS
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():
    logger.info("========================================")
    logger.info("CivicPulse AI backend starting")
    logger.info("Database initialization deferred")
    logger.info("Application startup complete")
    logger.info("========================================")