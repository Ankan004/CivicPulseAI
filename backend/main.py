import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("civicpulse")


# ============================================================
# APP
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
        "https://civic-pulse-ai-roan.vercel.app",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
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

            connection.execute(
                text("SELECT 1")
            )

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as exc:

        logger.exception(
            "Database connection failed"
        )

        return {
            "status": "error",
            "database": "connection_failed",
            "detail": str(exc),
        }


# ============================================================
# LOAD API ROUTERS
# ============================================================

@app.on_event("startup")
async def load_core_routers():

    logger.info(
        "========================================"
    )

    logger.info(
        "CivicPulse AI startup"
    )

    logger.info(
        "Loading API routers..."
    )

    logger.info(
        "========================================"
    )


    routers = [

        # ----------------------------------------------------
        # AUTHENTICATION
        # ----------------------------------------------------

        (
            "auth",
            "app.api.auth",
            "router",
        ),

        (
            "users",
            "app.api.users",
            "router",
        ),


        # ----------------------------------------------------
        # COMPLAINTS
        # ----------------------------------------------------

        (
            "complaints",
            "app.api.complaints",
            "router",
        ),


        # ----------------------------------------------------
        # DASHBOARD
        # ----------------------------------------------------

        (
            "dashboard",
            "app.api.dashboard",
            "router",
        ),

        (
            "admin_dashboard",
            "app.api.admin_dashboard",
            "router",
        ),


        # ----------------------------------------------------
        # MAP / LOCATION
        # ----------------------------------------------------

        (
            "map_dashboard",
            "app.api.map_dashboard",
            "router",
        ),

        (
            "risk_map",
            "app.api.risk_map",
            "router",
        ),

        (
            "location",
            "app.api.location",
            "router",
        ),


        # ----------------------------------------------------
        # WEATHER / DISASTER
        # ----------------------------------------------------

        (
            "weather",
            "app.api.weather",
            "router",
        ),

        (
            "disaster",
            "app.api.disaster",
            "router",
        ),


        # ----------------------------------------------------
        # ANALYTICS
        # ----------------------------------------------------

        (
            "analytics",
            "app.api.analytics",
            "router",
        ),

        (
            "hotspots",
            "app.api.hotspots",
            "router",
        ),


        # ----------------------------------------------------
        # AI / ML
        # ----------------------------------------------------

        (
            "ai",
            "app.api.ai",
            "router",
        ),

        (
            "vision",
            "app.api.vision",
            "router",
        ),

        (
            "assistant",
            "app.api.assistant",
            "router",
        ),


        # ----------------------------------------------------
        # FILE UPLOAD
        # ----------------------------------------------------

        (
            "upload",
            "app.api.upload",
            "router",
        ),
    ]


    loaded = 0
    failed = 0


    # ========================================================
    # LOAD ROUTERS
    # ========================================================

    for name, module_name, router_name in routers:

        try:

            logger.info(
                "Loading router: %s",
                name,
            )


            module = __import__(
                module_name,
                fromlist=[
                    router_name
                ],
            )


            router = getattr(
                module,
                router_name,
            )


            app.include_router(
                router
            )


            loaded += 1


            logger.info(
                "Router loaded successfully: %s",
                name,
            )


        except Exception as exc:

            failed += 1


            logger.exception(
                "Router failed to load: %s | %s",
                name,
                exc,
            )


    # ========================================================
    # STARTUP SUMMARY
    # ========================================================

    logger.info(
        "========================================"
    )

    logger.info(
        "API routers loaded: %s | failed: %s",
        loaded,
        failed,
    )

    logger.info(
        "AI/ML routers are ENABLED."
    )

    logger.info(
        "========================================"
    )


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True,
)


app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_DIR,
    ),
    name="uploads",
)


# ============================================================
# APPLICATION READY
# ============================================================

logger.info(
    "CivicPulse AI application object created."
)

logger.info(
    "Health endpoint is available."
)