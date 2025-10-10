from datetime import datetime

from pydantic import BaseModel


class Query(BaseModel):
    id: int
    symptoms: str
    response: str
    created_at: datetime

class QueryRequest(BaseModel):
    symptoms: str