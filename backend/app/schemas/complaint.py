from pydantic import BaseModel


class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    latitude: float
    longitude: float
    image_url: str | None = None


class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    severity: str
    status: str

    class Config:
        from_attributes = True

from typing import Literal


class ComplaintStatusUpdate(BaseModel):
    status: Literal[
        "pending",
        "in_progress",
        "resolved",
        "rejected"
    ]