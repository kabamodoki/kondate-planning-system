"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MealPlan, MealSelection, DayKey, MealType } from "@/types";
import * as api from "@/lib/api";

export function useMealPlan() {
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    servings: number,
    mealSelection: MealSelection,
    forbiddenIngredients: string[],
    preferences: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { meal_plan } = await api.generateMealPlan(servings, mealSelection, forbiddenIngredients, preferences);
      const plan: MealPlan = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        weekStart: getMonday(),
        servings,
        mealSelection,
        meals: meal_plan,
      };
      setCurrentPlan(plan);
      return plan;
    } catch (e: unknown) {
      const err = e as { detail?: { message?: string } };
      setError(err?.detail?.message ?? "献立の生成に失敗しました。");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async (day: DayKey, mealType: MealType) => {
    if (!currentPlan) return;
    const key = `${day}-${mealType}`;
    setRegeneratingKey(key);
    setError(null);
    try {
      const { meal } = await api.regenerateMeal(day, mealType, currentPlan.servings, currentPlan.meals);
      const updated: MealPlan = {
        ...currentPlan,
        meals: {
          ...currentPlan.meals,
          [day]: { ...currentPlan.meals[day], [mealType]: meal },
        },
      };
      setCurrentPlan(updated);
    } catch (e: unknown) {
      const err = e as { detail?: { message?: string } };
      setError(err?.detail?.message ?? "再生成に失敗しました。");
    } finally {
      setRegeneratingKey(null);
    }
  };

  return { currentPlan, setCurrentPlan, loading, regeneratingKey, error, setError, generate, regenerate };
}

function getMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().split("T")[0];
}
