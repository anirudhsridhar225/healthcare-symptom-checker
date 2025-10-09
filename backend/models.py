from pydantic import BaseModel
from datetime import datetime


class Query(BaseModel):
    id: int
    symptoms: str
    response: str
    created_at: datetime
