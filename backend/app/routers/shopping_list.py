from fastapi import APIRouter

from app.models.schemas import GenerateShoppingListRequest, GenerateShoppingListResponse
from app.services.shopping_service import aggregate_shopping_list

router = APIRouter(prefix="/api/shopping-list", tags=["shopping-list"])


@router.post("/generate", response_model=GenerateShoppingListResponse)
async def generate_shopping_list(req: GenerateShoppingListRequest):
    shopping_list = aggregate_shopping_list(req.meal_plan)
    return GenerateShoppingListResponse(shopping_list=shopping_list)
