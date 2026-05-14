import os
from fastapi import Header, HTTPException

_API_SECRET = os.getenv("API_SECRET", "")


async def verify_secret(x_api_secret: str = Header(default=None)):
    if _API_SECRET and x_api_secret != _API_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
