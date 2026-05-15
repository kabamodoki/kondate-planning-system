from fastapi import APIRouter
from app.services import community_service

router = APIRouter(prefix="/api", tags=["community"])


@router.get("/community-plans")
async def get_community_plans():
    plans = community_service.get_plans(limit=20)
    return {"plans": plans}
