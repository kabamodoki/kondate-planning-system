import { MealPlan, MealSelection, ShoppingCategory } from "@/types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, detail: body.detail ?? body };
  }
  return res.json() as Promise<T>;
}

interface ApiShoppingItem {
  name: string;
  total_amount: string;
  used_in: string[];
}
interface ApiShoppingCategory {
  category: string;
  items: ApiShoppingItem[];
}

export async function generateMealPlan(
  servings: number,
  mealSelection: MealSelection,
  forbiddenIngredients: string[],
  preferences: string,
): Promise<{ meal_plan: MealPlan["meals"] }> {
  return request("/api/meal-plan/generate", {
    method: "POST",
    body: JSON.stringify({
      servings,
      meal_selection: mealSelection,
      forbidden_ingredients: forbiddenIngredients,
      preferences,
    }),
  });
}

export async function regenerateMeal(
  day: string,
  mealType: string,
  servings: number,
  currentPlan: MealPlan["meals"]
): Promise<{ meal: MealPlan["meals"]["monday"]["breakfast"] }> {
  return request("/api/meal-plan/regenerate-meal", {
    method: "POST",
    body: JSON.stringify({ day, meal_type: mealType, servings, current_plan: currentPlan }),
  });
}

export async function generateShoppingList(mealPlan: MealPlan["meals"]): Promise<ShoppingCategory[]> {
  const res = await request<{ shopping_list: ApiShoppingCategory[] }>("/api/shopping-list/generate", {
    method: "POST",
    body: JSON.stringify({ meal_plan: mealPlan }),
  });
  return res.shopping_list.map((cat) => ({
    category: cat.category,
    items: cat.items.map((item) => ({
      name: item.name,
      totalAmount: item.total_amount,
      usedIn: item.used_in,
    })),
  }));
}

export async function healthCheck(): Promise<{ status: string; gemini: string }> {
  return request("/api/health");
}
