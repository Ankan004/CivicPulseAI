import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civicpulse")

app = FastAPI(
    title="CivicPulse AI",
    version="1.0.0",
)

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
# DATABASE TEST
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