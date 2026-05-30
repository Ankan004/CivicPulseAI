from pydantic import BaseModel


class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    latitude: float
    longitude: float


class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    severity: str
    status: str

    class Config:
        from_attributes = True