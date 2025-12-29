from typing import Any, Dict, List, Optional
from pydantic import BaseModel

# Generic response wrapper
class ResponseBase(BaseModel):
    code: int = 200
    message: str = "success"
    data: Optional[Any] = None

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
