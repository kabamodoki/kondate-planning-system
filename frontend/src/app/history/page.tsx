"use client";

import { useRouter } from "next/navigation";
import { MealPlan } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useLocalStorage<MealPlan[]>("kondate_history", []);

  const handleSelect = (plan: MealPlan) => {
    try { localStorage.setItem("kondate_current", JSON.stringify(plan)); } catch {/* ignore */}
    router.push("/meal-plan");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(history.filter((h) => h.id !== id));
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/")} className="text-warm-400 hover:text-terra transition-colors text-lg">
          ←
        </button>
        <h2 className="text-xl font-extrabold text-warm-900">📖 過去の献立</h2>
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-12 text-warm-400">
          <p className="text-4xl mb-3">🍱</p>
          <p className="text-sm">保存された献立はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleSelect(plan)}
              className="card cursor-pointer hover:shadow-card-hover transition-shadow flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-warm-900">{plan.weekStart} の週</p>
                <p className="text-xs text-warm-400 mt-0.5">
                  {new Date(plan.createdAt).toLocaleString("ja-JP")} · {plan.servings}人分
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-warm-300 text-lg">›</span>
                <button
                  onClick={(e) => handleDelete(e, plan.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-warm-300 hover:bg-blush-light hover:text-rose-500 transition-colors text-sm"
                  title="削除"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
