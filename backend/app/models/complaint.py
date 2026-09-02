from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
)

from app.database.base import Base


class Complaint(Base):

    __tablename__ = "complaints"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # COMPLAINT INFORMATION
    # ========================================================

    title = Column(
        String,
        nullable=False,
    )

    description = Column(
        String,
        nullable=False,
    )

    category = Column(
        String,
        nullable=False,
    )

    severity = Column(
        String,
        default="medium",
    )

    priority = Column(
        String,
        default="medium",
    )

    status = Column(
        String,
        default="pending",
    )

    # ========================================================
    # LOCATION
    # ========================================================

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    # ========================================================
    # IMAGE
    # ========================================================

    image_url = Column(
        String,
        nullable=True,
    )

    # ========================================================
    # AI / ML EMBEDDING
    # ========================================================

    embedding = Column(
        Text,
        nullable=True,
    )

    # ========================================================
    # TIMESTAMP
    # ========================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    # ========================================================
    # USER RELATION
    # ========================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )