from fastapi import APIRouter, Depends, HTTPException
from google.api_core.exceptions import GoogleAPIError

from app.dependencies import verify_secret
from app.models.schemas import (
    GenerateMealPlanRequest,
    GenerateMealPlanResponse,
    RegenerateMealRequest,
    RegenerateMealResponse,
)
from app.services import gemini_service

router = APIRouter(prefix="/api/meal-plan", tags=["meal-plan"], dependencies=[Depends(verify_secret)])


@router.post("/generate", response_model=GenerateMealPlanResponse)
async def generate_meal_plan(req: GenerateMealPlanRequest):
    try:
        meal_plan = gemini_service.generate_week_plan(
            servings=req.servings,
            meal_selection=req.meal_selection,
            forbidden_ingredients=req.forbidden_ingredients,
            preferences=req.preferences,
        )
        return GenerateMealPlanResponse(meal_plan=meal_plan)
    except GoogleAPIError as e:
        raise HTTPException(
            status_code=503,
            detail={"error": "gemini_unavailable", "message": f"Gemini API エラー: {str(e)}"},
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail={"error": "parse_error", "message": str(e)})


@router.post("/regenerate-meal", response_model=RegenerateMealResponse)
async def regenerate_meal(req: RegenerateMealRequest):
    valid_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    valid_types = ["breakfast", "lunch", "dinner"]
    if req.day not in valid_days or req.meal_type not in valid_types:
        raise HTTPException(status_code=400, detail={"error": "invalid_params", "message": "day または meal_type が不正です。"})

    try:
        meal = gemini_service.regenerate_meal(
            day=req.day,
            meal_type=req.meal_type,
            servings=req.servings,
            current_plan=req.current_plan,
        )
        return RegenerateMealResponse(meal=meal)
    except GoogleAPIError as e:
        raise HTTPException(
            status_code=503,
            detail={"error": "gemini_unavailable", "message": f"Gemini API エラー: {str(e)}"},
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail={"error": "parse_error", "message": str(e)})
