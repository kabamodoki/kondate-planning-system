"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MealPlan, DayKey, MealType } from "@/types";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import ErrorBanner from "@/components/ErrorBanner";

export default function MealPlanPage() {
  const router = useRouter();
  const { currentPlan, setCurrentPlan, regeneratingKey, error, setError, regenerate } = useMealPlan();
  const [history, setHistory] = useLocalStorage<MealPlan[]>("kondate_history", []);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kondate_current");
      if (raw) {
        setCurrentPlan(JSON.parse(raw) as MealPlan);
      } else {
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentPlan) return;
    try { localStorage.setItem("kondate_current", JSON.stringify(currentPlan)); } catch {/* ignore */}
  }, [currentPlan]);

  const handleRegenerate = (day: DayKey, mealType: MealType) => {
    setSaved(false);
    regenerate(day, mealType);
  };

  const handleSave = () => {
    if (!currentPlan) return;
    const updated = [currentPlan, ...history.filter((h) => h.id !== currentPlan.id)].slice(0, 10);
    setHistory(updated);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2500);
  };

  if (!currentPlan) {
    return <p className="text-warm-400 text-center py-16">読み込み中...</p>;
  }

  return (
    <div>
      {/* ナビゲーションバー */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-warm-400 hover:text-terra transition-colors flex items-center gap-1"
          >
            ← ホーム
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-warm-900">今週の献立 🍽️</h2>
            <p className="text-xs text-warm-400 mt-0.5">{currentPlan.servings}人分 · {currentPlan.weekStart}〜</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 保存ボタン（保存済みでトグル） */}
          <button
            onClick={handleSave}
            className={`text-sm py-2 px-4 rounded-xl font-bold border-2 transition-all ${
              saved
                ? "bg-sage text-white border-sage"
                : "bg-terra text-white border-terra hover:bg-terra-dark"
            }`}
          >
            {saved ? "✓ 保存しました" : "保存する"}
          </button>
          <button
            onClick={() => router.push("/shopping-list")}
            className="btn-secondary text-sm py-2 px-4"
          >
            🛒 買い物リスト
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <MealPlanCalendar
        plan={currentPlan}
        regeneratingKey={regeneratingKey}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
}
