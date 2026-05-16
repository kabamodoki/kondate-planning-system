"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MealPlan, DayKey, MEAL_TYPES, DEFAULT_MEAL_SELECTION } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface CommunityPlan {
  id: string;
  generatedAt: string;
  servings: number;
  meals: MealPlan["meals"];
  tags: {
    forbidden: string[];
    preferences: string[];
  };
  meta: {
    selectedCount: number;
  };
}

export default function CommunityPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<CommunityPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community-plans")
      .then(r => (r.ok ? r.json() : { plans: [] }))
      .then(data => setPlans(data.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const viewPlan = (cp: CommunityPlan) => {
    const mealSelection = structuredClone(DEFAULT_MEAL_SELECTION);
    (Object.keys(cp.meals) as DayKey[]).forEach(day => {
      const dayMeals = cp.meals[day];
      MEAL_TYPES.forEach(mt => {
        mealSelection[day][mt] = dayMeals[mt] !== null;
      });
    });

    const genDate = new Date(cp.generatedAt);
    const dow = genDate.getDay();
    genDate.setDate(genDate.getDate() + (dow === 0 ? -6 : 1 - dow));
    const weekStart = genDate.toISOString().split("T")[0];

    const plan: MealPlan = {
      id: cp.id ?? uuidv4(),
      createdAt: cp.generatedAt,
      weekStart,
      servings: cp.servings,
      mealSelection,
      meals: cp.meals,
    };
    try { localStorage.setItem("kondate_current", JSON.stringify(plan)); } catch { /* ignore */ }
    router.push("/meal-plan");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-warm-900 mb-1">みんなの献立</h1>
        <p className="text-warm-500 text-sm">他のユーザーが生成した献立を参考にしてみましょう。</p>
      </div>

      {loading ? (
        <div className="text-center text-warm-400 py-16 text-sm">読み込み中...</div>
      ) : plans.length === 0 ? (
        <div className="text-center text-warm-400 py-16 text-sm">
          <p>まだ献立がありません。</p>
          <p className="mt-1">最初の献立を生成してみましょう！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => viewPlan(plan)}
              className="card w-full text-left hover:shadow-card-hover transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-warm-800">
                      {plan.servings}人分 · {plan.meta.selectedCount}食
                    </span>
                    <span className="text-xs text-warm-400">
                      {new Date(plan.generatedAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  {plan.tags.forbidden.length > 0 || plan.tags.preferences.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {plan.tags.forbidden.map(tag => (
                        <span key={tag} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                          🚫 {tag}
                        </span>
                      ))}
                      {plan.tags.preferences.map(tag => (
                        <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                          ✨ {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">制限なし</span>
                  )}
                </div>
                <span className="text-warm-300 text-sm flex-shrink-0 mt-0.5">→</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
