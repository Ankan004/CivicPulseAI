import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("civicpulse")

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
        "https://civic-pulse-ai-ashy.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HEALTH
# ============================================================

@app.get("/")
def home():
    return {
        "message": "CivicPulse Backend Running",
        "status": "active",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CivicPulse AI backend",
    }


# ============================================================
# DATABASE HEALTH
# ============================================================

@app.get("/health/database")
def database_health():
    try:
        from sqlalchemy import text
        from app.database.session import engine

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as exc:
        logger.exception("Database connection failed")

        return {
            "status": "error",
            "database": "connection_failed",
            "detail": str(exc),
        }


# ============================================================
# CORE API ROUTERS
# ============================================================

from app.api.auth import router as auth_router
from app.api.users import router as users_router

from app.api.dashboard import router as dashboard_router
from app.api.admin_dashboard import router as admin_dashboard_router

from app.api.complaints import router as complaints_router

from app.api.map_dashboard import router as map_router
from app.api.risk_map import router as risk_map_router

from app.api.location import router as location_router
from app.api.upload import router as upload_router

from app.api.weather import router as weather_router
from app.api.disaster import router as disaster_router

from app.api.analytics import router as analytics_router


# ============================================================
# REGISTER CORE ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(users_router)

app.include_router(dashboard_router)
app.include_router(admin_dashboard_router)

app.include_router(complaints_router)

app.include_router(map_router)
app.include_router(risk_map_router)

app.include_router(location_router)
app.include_router(upload_router)

app.include_router(weather_router)
app.include_router(disaster_router)

app.include_router(analytics_router)


# ============================================================
# HEAVY AI/ML FEATURES TEMPORARILY DISABLED
# ============================================================

logger.info("Heavy AI/ML routers disabled for stable deployment.")

# Temporarily disabled:
#
# from app.api.ai import router as ai_router
# from app.api.vision import router as vision_router
# from app.api.assistant import router as assistant_router
# from app.api.hotspots import router as hotspots_router
#
# app.include_router(ai_router)
# app.include_router(vision_router)
# app.include_router(assistant_router)
# app.include_router(hotspots_router)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

import os

os.makedirs("uploads", exist_ok=True)

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
    logger.info("CivicPulse AI backend started")
    logger.info("Core APIs enabled")
    logger.info("Heavy AI/ML features disabled")
    logger.info("Application startup complete")
    logger.info("========================================")