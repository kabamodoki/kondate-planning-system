"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MealPlan, ShoppingCategory, DayKey, DAY_KEYS, DAY_LABELS } from "@/types";
import { generateShoppingList } from "@/lib/api";
import ShoppingList from "@/components/ShoppingList";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorBanner from "@/components/ErrorBanner";

export default function ShoppingListPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<DayKey>>(new Set(DAY_KEYS));
  const [categories, setCategories] = useState<ShoppingCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildFilteredMeals = useCallback((p: MealPlan, days: Set<DayKey>): MealPlan["meals"] => {
    return DAY_KEYS.reduce((acc, day) => {
      acc[day] = days.has(day) ? p.meals[day] : { breakfast: null, lunch: null, dinner: null };
      return acc;
    }, {} as MealPlan["meals"]);
  }, []);

  const loadShoppingList = useCallback(async (p: MealPlan, days: Set<DayKey>) => {
    setLoading(true);
    setError(null);
    try {
      const filtered = buildFilteredMeals(p, days);
      const cats = await generateShoppingList(filtered);
      setCategories(cats);
    } catch {
      setError("買い物リストの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [buildFilteredMeals]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kondate_current");
      if (!raw) { router.replace("/"); return; }
      const loaded = JSON.parse(raw) as MealPlan;
      setPlan(loaded);
      loadShoppingList(loaded, new Set(DAY_KEYS));
    } catch {
      setError("買い物リストの取得に失敗しました。");
      setLoading(false);
    }
  }, [router, loadShoppingList]);

  const toggleDay = (day: DayKey) => {
    if (!plan) return;
    const next = new Set(selectedDays);
    next.has(day) ? next.delete(day) : next.add(day);
    setSelectedDays(next);
    loadShoppingList(plan, next);
  };

  const hasMeals = (day: DayKey) => {
    if (!plan) return false;
    const d = plan.meals[day];
    return !!(d.breakfast || d.lunch || d.dinner);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="text-warm-400 hover:text-terra transition-colors text-lg"
        >
          ←
        </button>
        <h2 className="text-xl font-extrabold text-warm-900">🛒 買い物リスト</h2>
      </div>

      {/* 曜日フィルタ */}
      <div className="card mb-4">
        <p className="text-xs font-bold text-warm-600 mb-2">含める曜日を選ぶ</p>
        <div className="flex gap-1.5 flex-wrap">
          {DAY_KEYS.map((day) => {
            const active = selectedDays.has(day);
            const has = hasMeals(day);
            return (
              <button
                key={day}
                onClick={() => has && toggleDay(day)}
                disabled={!has}
                className={`w-10 h-9 rounded-lg border-2 text-xs font-bold transition-all ${
                  !has
                    ? "border-warm-100 bg-warm-50 text-warm-200 cursor-not-allowed"
                    : active
                    ? "border-terra bg-terra text-white shadow-sm"
                    : "border-warm-200 bg-white text-warm-400 hover:border-terra hover:text-terra"
                }`}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
        {selectedDays.size === 0 && (
          <p className="text-xs text-warm-400 mt-2">曜日を選んでください</p>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-warm-400">
          <div className="w-5 h-5 rounded-full border-2 border-warm-200 border-t-terra animate-spin" />
          <span className="text-sm">更新中...</span>
        </div>
      ) : (
        categories && selectedDays.size > 0 && <ShoppingList categories={categories} />
      )}
    </div>
  );
}
