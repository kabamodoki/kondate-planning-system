import json
import os
import time
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPIError, ResourceExhausted

from app.models.schemas import MealPlan, MealSelection, DayMeals, Meal
from app.prompts.meal_plan_prompts import (
    SYSTEM_PROMPT,
    build_week_plan_prompt,
    REGENERATE_MEAL_TEMPLATE,
    DAY_JP,
    MEAL_JP,
    DAY_KEYS,
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

genai.configure(api_key=GEMINI_API_KEY)

_model = genai.GenerativeModel(
    model_name=GEMINI_MODEL,
    system_instruction=SYSTEM_PROMPT,
    generation_config=genai.GenerationConfig(
        temperature=0.7,
        max_output_tokens=8192,
    ),
)


def _call_gemini(prompt: str) -> str:
    for attempt in range(3):
        try:
            response = _model.generate_content(prompt)
            return response.text
        except ResourceExhausted as e:
            if attempt < 2:
                time.sleep(15 * (attempt + 1))
            else:
                raise GoogleAPIError(str(e)) from e


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


def generate_week_plan(
    servings: int,
    meal_selection: MealSelection,
    forbidden_ingredients: list[str] | None = None,
    preferences: str = "",
) -> tuple[MealPlan, dict]:
    sel_dict = {
        day: {
            "breakfast": getattr(getattr(meal_selection, day), "breakfast"),
            "lunch": getattr(getattr(meal_selection, day), "lunch"),
            "dinner": getattr(getattr(meal_selection, day), "dinner"),
        }
        for day in DAY_KEYS
    }

    prompt = build_week_plan_prompt(servings, sel_dict, forbidden_ingredients, preferences)
    data = _parse_json_with_retry(prompt)

    # AIが生成したタグを取得（失敗時は空配列でフォールバック）
    raw_tags = data.get("tags", {})
    tags = {
        "forbidden": [str(t) for t in raw_tags.get("forbidden", []) if t],
        "preferences": [str(t) for t in raw_tags.get("preferences", []) if t],
    }

    day_meals = {}
    for day in DAY_KEYS:
        day_data = data.get(day, {})
        day_sel = sel_dict[day]
        day_meals[day] = DayMeals(
            breakfast=Meal(**day_data["breakfast"]) if day_sel["breakfast"] and "breakfast" in day_data else None,
            lunch=Meal(**day_data["lunch"]) if day_sel["lunch"] and "lunch" in day_data else None,
            dinner=Meal(**day_data["dinner"]) if day_sel["dinner"] and "dinner" in day_data else None,
        )

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
    )
    data = _parse_json_with_retry(prompt)
    return Meal(**data)


def check_gemini_health() -> str:
    if not GEMINI_API_KEY:
        return "no_api_key"
    return "connected"
