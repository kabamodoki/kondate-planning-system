import asyncio
import json
import os
import time
from google import genai
from google.genai import types

from app.models.schemas import MealPlan, MealSelection, DayMeals, Meal
from app.prompts.meal_plan_prompts import (
    SYSTEM_PROMPT,
    build_week_plan_prompt,
    build_meal_type_plan_prompt,
    REGENERATE_MEAL_TEMPLATE,
    DAY_JP,
    MEAL_JP,
    DAY_KEYS,
    MEAL_KEYS,
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

_client = genai.Client(api_key=GEMINI_API_KEY)

# thinking_budget=0 で推論モード（Thinking）を無効化しコストを抑える
_config = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    temperature=0.7,
    max_output_tokens=8192,
    thinking_config=types.ThinkingConfig(thinking_budget=0),
)


class GeminiAPIError(Exception):
    pass


def _call_gemini(prompt: str) -> str:
    for attempt in range(3):
        try:
            response = _client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=_config,
            )
            return response.text
        except Exception as e:
            msg = str(e)
            is_quota = "429" in msg or "RESOURCE_EXHAUSTED" in msg.upper()
            if is_quota and attempt < 2:
                time.sleep(15 * (attempt + 1))
            else:
                raise GeminiAPIError(msg) from e


def _parse_json_with_retry(prompt: str) -> dict:
    last_error = None
    for attempt in range(1, 4):
        try:
            raw = _call_gemini(prompt)
            text = raw.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
            return json.loads(text)
        except (json.JSONDecodeError, KeyError) as e:
            last_error = e
            if attempt == 3:
                raise ValueError(f"JSON パース失敗（3回試行）: {last_error}") from last_error


async def generate_week_plan(
    servings: int,
    meal_selection: MealSelection,
    forbidden_ingredients: list[str] | None = None,
    preferences: str = "",
    budget: int | None = None,
    breakfast_cooking_limit: int | None = None,
    lunch_cooking_limit: int | None = None,
    dinner_cooking_limit: int | None = None,
) -> tuple[MealPlan, dict]:
    sel_dict = {
        day: {
            "breakfast": getattr(getattr(meal_selection, day), "breakfast"),
            "lunch": getattr(getattr(meal_selection, day), "lunch"),
            "dinner": getattr(getattr(meal_selection, day), "dinner"),
        }
        for day in DAY_KEYS
    }

    cooking_limits = {
        "breakfast": breakfast_cooking_limit,
        "lunch": lunch_cooking_limit,
        "dinner": dinner_cooking_limit,
    }

    # 食事タイプごとに選択されている曜日リストを作成
    meal_type_days: dict[str, list[str]] = {
        mt: [day for day in DAY_KEYS if sel_dict[day][mt]]
        for mt in MEAL_KEYS
    }
    active_meal_types = [mt for mt in MEAL_KEYS if meal_type_days[mt]]

    # 各食事タイプを並列実行（最初のタイプのみ tags を生成）
    async def _call(meal_type: str, include_tags: bool) -> dict:
        prompt = build_meal_type_plan_prompt(
            meal_type=meal_type,
            servings=servings,
            selected_days=meal_type_days[meal_type],
            forbidden_ingredients=forbidden_ingredients,
            preferences=preferences,
            budget=budget,
            cooking_limit=cooking_limits[meal_type],
            include_tags=include_tags,
        )
        return await asyncio.to_thread(_parse_json_with_retry, prompt)

    results = await asyncio.gather(*[
        _call(mt, include_tags=(i == 0))
        for i, mt in enumerate(active_meal_types)
    ])

    # tags は最初の結果から取得
    raw_tags = results[0].get("tags", {}) if results else {}
    tags = {
        "forbidden": [str(t) for t in raw_tags.get("forbidden", []) if t],
        "preferences": [str(t) for t in raw_tags.get("preferences", []) if t],
    }

    # 結果をマージして MealPlan を構築
    merged: dict[str, dict[str, Meal | None]] = {
        day: {"breakfast": None, "lunch": None, "dinner": None}
        for day in DAY_KEYS
    }
    for mt, data in zip(active_meal_types, results):
        for day in meal_type_days[mt]:
            day_data = data.get(day, {})
            if mt in day_data:
                try:
                    merged[day][mt] = Meal(**day_data[mt])
                except Exception:
                    pass

    day_meals = {
        day: DayMeals(
            breakfast=merged[day]["breakfast"],
            lunch=merged[day]["lunch"],
            dinner=merged[day]["dinner"],
        )
        for day in DAY_KEYS
    }
    return MealPlan(**day_meals), tags


def regenerate_meal(day: str, meal_type: str, servings: int, current_plan: MealPlan) -> Meal:
    days_order = DAY_KEYS
    day_index = days_order.index(day)

    used_dishes = []
    for i in range(max(0, day_index - 2), min(len(days_order), day_index + 3)):
        d = days_order[i]
        day_data = getattr(current_plan, d)
        for mt in ["breakfast", "lunch", "dinner"]:
            meal = getattr(day_data, mt)
            if meal and meal.name not in used_dishes:
                used_dishes.append(meal.name)

    already_used = "\n".join(f"- {name}" for name in used_dishes) if used_dishes else "なし"
    prompt = REGENERATE_MEAL_TEMPLATE.format(
        day=DAY_JP.get(day, day),
        meal_type=MEAL_JP.get(meal_type, meal_type),
        already_used_dishes=already_used,
        servings=servings,
    )
    data = _parse_json_with_retry(prompt)
    return Meal(**data)


def check_gemini_health() -> str:
    if not GEMINI_API_KEY:
        return "no_api_key"
    return "connected"
