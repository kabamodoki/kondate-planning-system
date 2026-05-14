from fastapi import APIRouter
from app import state

router = APIRouter(prefix="/api", tags=["community"])


@router.get("/community-plans")
async def get_community_plans():
    plans = state.get_community_plans(limit=20)
    return {"plans": plans}
