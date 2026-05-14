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
    budget?: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { meal_plan } = await api.generateMealPlan(servings, mealSelection, forbiddenIngredients, preferences, budget);
      const plan: MealPlan = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        weekStart: getMonday(),
        servings,
        mealSelection,
        budget: budget || undefined,
        meals: meal_plan,
      };
      setCurrentPlan(plan);
      return plan;
    } catch (e: unknown) {
      setError(toUserMessage(e));
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
      setError(toUserMessage(e));
    } finally {
      setRegeneratingKey(null);
    }
  };

  return { currentPlan, setCurrentPlan, loading, regeneratingKey, error, setError, generate, regenerate };
}

type ApiError = { status?: number; detail?: { error?: string; message?: string } | string };

function toUserMessage(e: unknown): string {
  const err = e as ApiError;
  const detail = typeof err.detail === "object" ? err.detail : null;
  switch (detail?.error) {
    case "ip_limit_exceeded":
    case "budget_exceeded":
      return detail.message ?? "ただいまご利用いただけません。";
    case "gemini_unavailable":
      return "ただいまAIサービスが利用できません。しばらくしてからお試しください。";
    default:
      return "献立の生成に失敗しました。もう一度お試しください。";
  }
}

function getMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().split("T")[0];
}
