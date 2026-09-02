from typing import Literal

from pydantic import (
    BaseModel,
    Field,
)


# ============================================================
# CREATE COMPLAINT
# ============================================================

class ComplaintCreate(BaseModel):

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )

    # Kept for frontend compatibility.
    # Backend ML prediction determines the final category.

    category: str = Field(
        default="Other",
        max_length=50,
    )

    severity: str = Field(
        default="medium",
        max_length=20,
    )

    priority: str = Field(
        default="medium",
        max_length=20,
    )

    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
    )

    image_url: str | None = Field(
        default=None,
        max_length=1000,
    )


# ============================================================
# PUBLIC COMPLAINT RESPONSE
# ============================================================

class ComplaintResponse(BaseModel):

    id: int

    title: str

    description: str

    category: str

    severity: str

    priority: str

    status: str

    class Config:
        from_attributes = True


# ============================================================
# STATUS UPDATE
# ============================================================

class ComplaintStatusUpdate(BaseModel):

    status: Literal[
        "pending",
        "in_progress",
        "resolved",
        "rejected",
    ]