export interface Ingredient {
  name: string;
  amount: string;
}

export interface Meal {
  name: string;
  description: string;
  ingredients: Ingredient[];
}

export interface MealTypeSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export type MealSelection = Record<DayKey, MealTypeSelection>;

// null = 外食・生成しない
export interface DayMeals {
  breakfast: Meal | null;
  lunch: Meal | null;
  dinner: Meal | null;
}

export interface MealPlan {
  id: string;
  createdAt: string;
  weekStart: string;
  servings: number;
  mealSelection: MealSelection;
  meals: {
    monday: DayMeals;
    tuesday: DayMeals;
    wednesday: DayMeals;
    thursday: DayMeals;
    friday: DayMeals;
    saturday: DayMeals;
    sunday: DayMeals;
  };
}

export interface ShoppingItem {
  name: string;
  totalAmount: string;
  usedIn: string[];
}

export interface ShoppingCategory {
  category: string;
  items: ShoppingItem[];
}

export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type MealType = "breakfast" | "lunch" | "dinner";

export const DAY_LABELS: Record<DayKey, string> = {
  monday: "月",
  tuesday: "火",
  wednesday: "水",
  thursday: "木",
  friday: "金",
  saturday: "土",
  sunday: "日",
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
};

export const DAY_KEYS: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const DEFAULT_MEAL_SELECTION: MealSelection = {
  monday:    { breakfast: true, lunch: true, dinner: true },
  tuesday:   { breakfast: true, lunch: true, dinner: true },
  wednesday: { breakfast: true, lunch: true, dinner: true },
  thursday:  { breakfast: true, lunch: true, dinner: true },
  friday:    { breakfast: true, lunch: true, dinner: true },
  saturday:  { breakfast: true, lunch: true, dinner: true },
  sunday:    { breakfast: true, lunch: true, dinner: true },
};
