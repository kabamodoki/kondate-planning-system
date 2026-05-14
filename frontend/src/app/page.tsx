"use client";

import { useRouter } from "next/navigation";
import { MealPlan, MealSelection, MealType, DayKey, DAY_KEYS, DAY_LABELS, MEAL_TYPES, MEAL_LABELS, DEFAULT_MEAL_SELECTION } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMealPlan } from "@/hooks/useMealPlan";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorBanner from "@/components/ErrorBanner";
import UsageBanner from "@/components/UsageBanner";

const MEAL_COLOR: Record<MealType, { on: string; off: string; dot: string }> = {
  breakfast: { on: "bg-amber-100 border-amber-400 text-amber-800", off: "bg-white border-warm-200 text-warm-300", dot: "bg-amber-400" },
  lunch:     { on: "bg-sky-100 border-sky-400 text-sky-800",       off: "bg-white border-warm-200 text-warm-300", dot: "bg-sky-400" },
  dinner:    { on: "bg-purple-100 border-purple-400 text-purple-800", off: "bg-white border-warm-200 text-warm-300", dot: "bg-purple-400" },
};

export default function HomePage() {
  const router = useRouter();
  const [servings, setServings] = useLocalStorage<number>("kondate_servings", 2);
  const [mealSelection, setMealSelection] = useLocalStorage<MealSelection>("kondate_meal_selection", DEFAULT_MEAL_SELECTION);
  const [forbiddenIngredients, setForbiddenIngredients] = useLocalStorage<string>("kondate_forbidden", "");
  const [preferences, setPreferences] = useLocalStorage<string>("kondate_preferences", "");
  const [budget, setBudget] = useLocalStorage<number>("kondate_budget", 0);
  const [history] = useLocalStorage<MealPlan[]>("kondate_history", []);
  const { loading, error, setError, generate } = useMealPlan();

  const toggleMeal = (day: DayKey, mealType: MealType) => {
    setMealSelection({
      ...mealSelection,
      [day]: { ...mealSelection[day], [mealType]: !mealSelection[day][mealType] },
    });
  };

  const selectedCount = DAY_KEYS.reduce((acc, day) =>
    acc + MEAL_TYPES.filter(m => mealSelection[day][m]).length, 0
  );

  const handleGenerate = async () => {
    const forbidden = forbiddenIngredients
      .split(/[、,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const plan = await generate(servings, mealSelection, forbidden, preferences, budget || undefined);
    if (plan) {
      try { localStorage.setItem("kondate_current", JSON.stringify(plan)); } catch {/* ignore */}
      router.push("/meal-plan");
    }
  };

  return (
    <>
      {loading && (
        <LoadingOverlay message={`献立を考えています... (${selectedCount}食分)\nしばらくお待ちください ☕`} />
      )}

      <div className="max-w-2xl mx-auto">
        {/* ヒーロー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-warm-900 mb-2">
            今週の献立、お任せください 🌿
          </h1>
          <p className="text-warm-500 text-sm">作りたい食事を選ぶだけ。AIが美味しい1週間を提案します。</p>
        </div>

        <UsageBanner />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* 人数 */}
        <div className="card mb-4">
          <p className="font-bold text-warm-900 mb-3">何人分？</p>
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4,5,6].map((n) => (
              <button
                key={n}
                onClick={() => setServings(n)}
                className={`w-10 h-10 rounded-full text-sm font-bold border-2 transition-all ${
                  servings === n
                    ? "border-terra bg-terra text-white shadow"
                    : "border-warm-200 bg-white text-warm-600 hover:border-terra hover:text-terra"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 食事選択 */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-warm-900">作る食事を選ぶ</p>
            <span className="text-xs text-warm-400 bg-warm-100 px-3 py-1 rounded-full">
              {selectedCount} / 21 食
            </span>
          </div>

          {/* PC: 横テーブル */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full" style={{ minWidth: "420px" }}>
              <thead>
                <tr>
                  <th className="w-14" />
                  {DAY_KEYS.map(day => (
                    <th key={day} className={`text-center text-xs font-bold pb-2 ${
                      day === "saturday" ? "text-sky-500" :
                      day === "sunday" ? "text-rose-500" : "text-warm-600"
                    }`}>
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map(mealType => (
                  <tr key={mealType}>
                    <td className="pr-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium">
                        <span className={`w-2 h-2 rounded-full ${MEAL_COLOR[mealType].dot}`} />
                        {MEAL_LABELS[mealType]}
                      </span>
                    </td>
                    {DAY_KEYS.map(day => {
                      const selected = mealSelection[day][mealType];
                      return (
                        <td key={day} className="text-center py-1">
                          <button
                            onClick={() => toggleMeal(day, mealType)}
                            className={`w-9 h-8 rounded-lg border-2 text-sm font-bold transition-all ${
                              selected ? MEAL_COLOR[mealType].on : MEAL_COLOR[mealType].off
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* スマホ: 曜日別縦リスト */}
          <div className="sm:hidden space-y-2">
            {DAY_KEYS.map(day => (
              <div key={day} className="border border-warm-200 rounded-xl overflow-hidden">
                <div className={`px-3 py-2 text-xs font-bold ${
                  day === "saturday" ? "bg-sky-50 text-sky-600" :
                  day === "sunday"   ? "bg-rose-50 text-rose-500" :
                  "bg-warm-100 text-warm-600"
                }`}>
                  {DAY_LABELS[day]}曜日
                </div>
                <div className="flex divide-x divide-warm-100">
                  {MEAL_TYPES.map(mealType => {
                    const selected = mealSelection[day][mealType];
                    return (
                      <button
                        key={mealType}
                        onClick={() => toggleMeal(day, mealType)}
                        className={`flex-1 py-2.5 flex flex-col items-center gap-1 transition-colors ${
                          selected ? MEAL_COLOR[mealType].on : "bg-white text-warm-300"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${selected ? MEAL_COLOR[mealType].dot : "bg-warm-200"}`} />
                        <span className="text-xs font-medium">{MEAL_LABELS[mealType]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 禁止食材・好み */}
        <div className="card mb-4 space-y-4">
          <div>
            <label className="block font-bold text-warm-900 mb-2 text-sm">
              🚫 使わない食材
            </label>
            <input
              type="text"
              value={forbiddenIngredients}
              onChange={(e) => setForbiddenIngredients(e.target.value)}
              placeholder="例: レバー、セロリ、ゴーヤ（カンマ区切り）"
              className="input-base"
            />
          </div>
          <div>
            <label className="block font-bold text-warm-900 mb-2 text-sm">
              ✨ 好み・スタイル
            </label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder={"例: 魚料理を週3回以上入れてほしい\n和食中心でお願い\nヘルシー志向で"}
              rows={3}
              className="input-base resize-none"
            />
          </div>
          <div>
            <label className="block font-bold text-warm-900 mb-2 text-sm">
              💰 週の食費予算（任意）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={budget || ""}
                onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : 0)}
                placeholder="例: 5000"
                min={0}
                className="input-base w-36"
              />
              <span className="text-sm text-warm-500">円 / 週</span>
            </div>
          </div>
        </div>

        {/* 生成ボタン */}
        <button
          onClick={handleGenerate}
          disabled={loading || selectedCount === 0}
          className="btn-primary w-full text-base py-4"
        >
          {selectedCount === 0 ? "食事を選んでください" : `${selectedCount}食分の献立を生成する ✨`}
        </button>

        {/* 最近の履歴 */}
        {history.length > 0 && (
          <div className="mt-10">
            <p className="font-bold text-warm-700 mb-3 text-sm">最近の献立</p>
            <div className="space-y-2">
              {history.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => {
                    try { localStorage.setItem("kondate_current", JSON.stringify(plan)); } catch {/* ignore */}
                    router.push("/meal-plan");
                  }}
                  className="card py-3 px-4 cursor-pointer hover:shadow-card-hover transition-shadow flex items-center justify-between"
                >
                  <span className="font-medium text-warm-800 text-sm">{plan.weekStart} の週</span>
                  <span className="text-xs text-warm-400">
                    {new Date(plan.createdAt).toLocaleDateString("ja-JP")} · {plan.servings}人分
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
