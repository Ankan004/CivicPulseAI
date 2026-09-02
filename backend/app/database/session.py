from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# ============================================================
# DATABASE ENGINE
# ============================================================

if settings.DATABASE_URL.startswith("sqlite"):

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={
            "check_same_thread": False,
        },
    )

else:

    engine = create_engine(
        settings.DATABASE_URL,

        # Check that pooled connections are still alive
        # before giving them to the application.
        pool_pre_ping=True,

        # Recycle long-lived connections.
        pool_recycle=1800,
    )


# ============================================================
# SESSION FACTORY
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)