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

export default function MealPlanCalendar({ plan, regeneratingKey, onRegenerate }: MealPlanCalendarProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[720px]">
        {/* ヘッダー */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-2 mb-2">
          <div />
          {DAY_KEYS.map((day) => (
            <div
              key={day}
              className={`text-center text-sm font-bold py-2 rounded-xl ${
                day === "saturday" ? "text-sky-600 bg-sky-50" :
                day === "sunday" ? "text-rose-500 bg-rose-50" :
                "text-warm-700 bg-warm-100"
              }`}
            >
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>

        {/* 行 */}
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
  );
}
