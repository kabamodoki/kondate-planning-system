"use client";

import { MealPlan, DAY_KEYS, DAY_LABELS, MEAL_TYPES, MEAL_LABELS, DayKey, MealType } from "@/types";
import MealCard from "./MealCard";

interface MealPlanCalendarProps {
  plan: MealPlan;
  regeneratingKey: string | null;
  onRegenerate: (day: DayKey, mealType: MealType) => void;
}

const MEAL_BG: Record<MealType, string> = {
  breakfast: "bg-amber-50 text-amber-700",
  lunch: "bg-sky-50 text-sky-700",
  dinner: "bg-purple-50 text-purple-700",
};

const MEAL_DOT: Record<MealType, string> = {
  breakfast: "bg-amber-400",
  lunch: "bg-sky-400",
  dinner: "bg-purple-400",
};

export default function MealPlanCalendar({ plan, regeneratingKey, onRegenerate }: MealPlanCalendarProps) {
  return (
    <>
      {/* ── PC: 7列グリッド ── */}
      <div className="hidden md:block overflow-x-auto -mx-4 px-4">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-2 mb-2">
            <div />
            {DAY_KEYS.map((day) => (
              <div key={day} className={`text-center text-sm font-bold py-2 rounded-xl ${
                day === "saturday" ? "text-sky-600 bg-sky-50" :
                day === "sunday"   ? "text-rose-500 bg-rose-50" :
                "text-warm-700 bg-warm-100"
              }`}>
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>

          {MEAL_TYPES.map((mealType) => (
            <div key={mealType} className="grid grid-cols-[56px_repeat(7,1fr)] gap-2 mb-2">
              <div className={`flex items-center justify-center rounded-xl text-xs font-bold ${MEAL_BG[mealType]}`}>
                {MEAL_LABELS[mealType]}
              </div>
              {DAY_KEYS.map((day) => {
                const meal = plan.meals[day][mealType];
                const key = `${day}-${mealType}`;
                const isSelected = plan.mealSelection?.[day]?.[mealType] ?? meal !== null;
                if (!isSelected || meal === null) {
                  return (
                    <div key={day} className="rounded-2xl bg-warm-100/60 flex items-center justify-center min-h-[60px]">
                      <span className="text-xs text-warm-300">外食</span>
                    </div>
                  );
                }
                return (
                  <MealCard
                    key={day}
                    meal={meal}
                    label={`${DAY_LABELS[day]}・${MEAL_LABELS[mealType]}`}
                    isRegenerating={regeneratingKey === key}
                    onRegenerate={() => onRegenerate(day, mealType)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── スマホ: 日別縦スクロール ── */}
      <div className="md:hidden space-y-4">
        {DAY_KEYS.map((day) => {
          const hasAnyMeal = MEAL_TYPES.some((mt) => {
            const isSelected = plan.mealSelection?.[day]?.[mt] ?? true;
            return isSelected && plan.meals[day][mt] !== null;
          });

          return (
            <div key={day} className="card p-0 overflow-hidden">
              {/* 曜日ヘッダー */}
              <div className={`px-4 py-2.5 font-bold text-sm ${
                day === "saturday" ? "bg-sky-50 text-sky-600" :
                day === "sunday"   ? "bg-rose-50 text-rose-500" :
                "bg-warm-100 text-warm-700"
              }`}>
                {DAY_LABELS[day]}曜日
              </div>

              {!hasAnyMeal ? (
                <div className="px-4 py-3 text-xs text-warm-300">外食日</div>
              ) : (
                <div className="divide-y divide-warm-100">
                  {MEAL_TYPES.map((mealType) => {
                    const meal = plan.meals[day][mealType];
                    const key = `${day}-${mealType}`;
                    const isSelected = plan.mealSelection?.[day]?.[mealType] ?? meal !== null;
                    if (!isSelected || meal === null) return null;

                    return (
                      <div key={mealType} className="px-3 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`w-2 h-2 rounded-full ${MEAL_DOT[mealType]}`} />
                          <span className={`text-xs font-bold ${MEAL_BG[mealType].split(" ")[1]}`}>
                            {MEAL_LABELS[mealType]}
                          </span>
                        </div>
                        <MealCard
                          meal={meal}
                          label={`${DAY_LABELS[day]}・${MEAL_LABELS[mealType]}`}
                          isRegenerating={regeneratingKey === key}
                          onRegenerate={() => onRegenerate(day, mealType)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
