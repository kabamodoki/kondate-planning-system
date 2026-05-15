import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from app.dependencies import verify_secret
from app.models.schemas import (
    GenerateMealPlanRequest,
    GenerateMealPlanResponse,
    RegenerateMealRequest,
    RegenerateMealResponse,
)
from app.services import gemini_service, community_service
from app.services.gemini_service import GeminiAPIError
from app import state

router = APIRouter(prefix="/api/meal-plan", tags=["meal-plan"], dependencies=[Depends(verify_secret)])


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/generate", response_model=GenerateMealPlanResponse)
async def generate_meal_plan(req: GenerateMealPlanRequest, request: Request):
    sel_dict = req.meal_selection.model_dump()

    # Cache check first — no IP/budget consumed on hit
    cache_key = state.build_cache_key(req.servings, sel_dict, req.forbidden_ingredients, req.preferences, req.budget, req.breakfast_cooking_limit, req.lunch_cooking_limit, req.dinner_cooking_limit)
    cached = state.get_cache(cache_key)
    if cached:
        return GenerateMealPlanResponse(**cached)

    ip = _get_client_ip(request)

    if not state.check_and_consume_generate_ip(ip):
        raise HTTPException(
            status_code=429,
            detail={"error": "ip_limit_exceeded", "message": "1時間以内の生成上限に達しました。しばらく時間をおいてからお試しください。みんなの献立や履歴もぜひご覧ください。"},
        )

    if not state.consume_budget():
        raise HTTPException(
            status_code=503,
            detail={"error": "budget_exceeded", "message": "本日の生成枠が終了しました。明日またお試しください。"},
        )

    try:
        meal_plan, ai_tags = await gemini_service.generate_week_plan(
            servings=req.servings,
            meal_selection=req.meal_selection,
            forbidden_ingredients=req.forbidden_ingredients,
            preferences=req.preferences,
            budget=req.budget,
            breakfast_cooking_limit=req.breakfast_cooking_limit,
            lunch_cooking_limit=req.lunch_cooking_limit,
            dinner_cooking_limit=req.dinner_cooking_limit,
        )
        response = GenerateMealPlanResponse(meal_plan=meal_plan)

        state.set_cache(cache_key, response.model_dump())

        selected_count = sum(1 for day in sel_dict.values() for v in day.values() if v)
        community_service.add_plan({
            "id": str(uuid.uuid4()),
            "servings": req.servings,
            "meals": meal_plan.model_dump(),
            "tags": ai_tags,
            "meta": {"selectedCount": selected_count},
        })

        return response
    except GeminiAPIError:
        raise HTTPException(
            status_code=503,
            detail={"error": "gemini_unavailable", "message": "ただいまAIサービスが利用できません。しばらくしてからお試しください。"},
        )
    except ValueError:
        raise HTTPException(status_code=500, detail={"error": "parse_error", "message": "献立の生成に失敗しました。もう一度お試しください。"})


@router.post("/regenerate-meal", response_model=RegenerateMealResponse)
async def regenerate_meal(req: RegenerateMealRequest, request: Request):
    valid_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    valid_types = ["breakfast", "lunch", "dinner"]
    if req.day not in valid_days or req.meal_type not in valid_types:
        raise HTTPException(status_code=400, detail={"error": "invalid_params", "message": "day または meal_type が不正です。"})

    ip = _get_client_ip(request)

    if not state.check_and_consume_regenerate_ip(ip):
        raise HTTPException(
            status_code=429,
            detail={"error": "regenerate_limit_exceeded", "message": "本日の個別更新上限に達しました。明日またお試しください。"},
        )

    try:
        meal = gemini_service.regenerate_meal(
            day=req.day,
            meal_type=req.meal_type,
            servings=req.servings,
            current_plan=req.current_plan,
        )
        return RegenerateMealResponse(meal=meal)
    except GeminiAPIError:
        raise HTTPException(
            status_code=503,
            detail={"error": "gemini_unavailable", "message": "ただいまAIサービスが利用できません。しばらくしてからお試しください。"},
        )
    except ValueError:
        raise HTTPException(status_code=500, detail={"error": "parse_error", "message": "献立の生成に失敗しました。もう一度お試しください。"})
