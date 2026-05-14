from pydantic import BaseModel
from typing import List, Optional


class Ingredient(BaseModel):
    name: str
    amount: str


class Meal(BaseModel):
    name: str
    description: str
    estimated_cost: Optional[int] = None
    ingredients: List[Ingredient]


class DayMeals(BaseModel):
    breakfast: Optional[Meal] = None
    lunch: Optional[Meal] = None
    dinner: Optional[Meal] = None


class MealPlan(BaseModel):
    monday: DayMeals
    tuesday: DayMeals
    wednesday: DayMeals
    thursday: DayMeals
    friday: DayMeals
    saturday: DayMeals
    sunday: DayMeals


class ShoppingItem(BaseModel):
    name: str
    total_amount: str
    used_in: List[str]


class ShoppingCategory(BaseModel):
    category: str
    items: List[ShoppingItem]


class MealTypeSelection(BaseModel):
    breakfast: bool = True
    lunch: bool = True
    dinner: bool = True


class MealSelection(BaseModel):
    monday: MealTypeSelection = MealTypeSelection()
    tuesday: MealTypeSelection = MealTypeSelection()
    wednesday: MealTypeSelection = MealTypeSelection()
    thursday: MealTypeSelection = MealTypeSelection()
    friday: MealTypeSelection = MealTypeSelection()
    saturday: MealTypeSelection = MealTypeSelection()
    sunday: MealTypeSelection = MealTypeSelection()


# Request / Response schemas

class GenerateMealPlanRequest(BaseModel):
    servings: int = 2
    meal_selection: MealSelection = MealSelection()
    forbidden_ingredients: List[str] = []
    preferences: str = ""
    budget: Optional[int] = None


class GenerateMealPlanResponse(BaseModel):
    meal_plan: MealPlan


class RegenerateMealRequest(BaseModel):
    day: str
    meal_type: str
    servings: int = 2
    current_plan: MealPlan
    budget: Optional[int] = None


class RegenerateMealResponse(BaseModel):
    meal: Meal


class GenerateShoppingListRequest(BaseModel):
    meal_plan: MealPlan


class GenerateShoppingListResponse(BaseModel):
    shopping_list: List[ShoppingCategory]
