"use client";

import { useState } from "react";
import { Meal } from "@/types";
import MealDetailModal from "@/components/MealDetailModal";

interface MealCardProps {
  meal: Meal;
  label: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

const MEAL_EMOJI: Record<string, string> = {
  ご飯: "🍚", 丼: "🍚", チャーハン: "🍳", おにぎり: "🍙",
  麺: "🍜", ラーメン: "🍜", うどん: "🍜", そば: "🍜", パスタ: "🍝", スパゲティ: "🍝",
  カレー: "🍛", シチュー: "🍲", スープ: "🍲", 鍋: "🫕",
  魚: "🐟", 鯖: "🐟", 鮭: "🐟", 鱈: "🐟", 鯵: "🐟", 秋刀魚: "🐟", 刺身: "🍣",
  肉: "🥩", 鶏: "🍗", 豚: "🥩", 牛: "🥩", ハンバーグ: "🍔", ステーキ: "🥩",
  卵: "🥚", オムレツ: "🍳", 目玉焼き: "🍳",
  サラダ: "🥗", 野菜: "🥦",
  パン: "🍞", トースト: "🍞",
  餃子: "🥟", 春巻き: "🥟",
  寿司: "🍣", 天ぷら: "🍤",
};

function getMealEmoji(name: string): string {
  for (const [key, emoji] of Object.entries(MEAL_EMOJI)) {
    if (name.includes(key)) return emoji;
  }
  return "🍽️";
}

function toSearchKeyword(name: string): string {
  return name
    .replace(/定食|セット|プレート|ランチ|ディナー|風|仕立て|添え|乗せ|のせ|がけ|かけ/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function MealCard({ meal, label, isRegenerating, onRegenerate }: MealCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const keyword = toSearchKeyword(meal.name);

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow cursor-pointer"
        onClick={() => !isRegenerating && setShowDetail(true)}
      >
        {isRegenerating ? (
          <div className="h-36 flex flex-col items-center justify-center gap-2 text-warm-300">
            <div className="w-6 h-6 rounded-full border-2 border-warm-200 border-t-terra animate-spin" />
            <span className="text-xs">再生成中...</span>
          </div>
        ) : (
          <>
            {/* 絵文字エリア */}
            <div className="relative h-28 bg-warm-100 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {getMealEmoji(meal.name)}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                title={`${label}を再生成`}
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-warm-600 hover:text-terra rounded-lg px-2 py-0.5 text-sm font-medium shadow transition-colors"
              >
                ↺
              </button>
            </div>

            {/* コンテンツエリア */}
            <div className="p-3">
              <p className="font-bold text-sm text-warm-900 mb-1 leading-tight">{meal.name}</p>
              <p className="text-xs text-warm-500 mb-2 leading-relaxed line-clamp-2">{meal.description}</p>
              <div className="flex gap-3 mb-2">
                {meal.cooking_time != null && (
                  <p className="text-xs text-warm-400">🕐 約{meal.cooking_time}分</p>
                )}
                {meal.estimated_cost != null && (
                  <p className="text-xs text-warm-400">💰 ¥{meal.estimated_cost.toLocaleString()}</p>
                )}
              </div>
              <ul className="text-xs text-warm-700 space-y-0.5 mb-3">
                {meal.ingredients.slice(0, 3).map((ing, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="text-warm-300">·</span>
                    <span>{ing.name}</span>
                    <span className="text-warm-400">{ing.amount}</span>
                  </li>
                ))}
                {meal.ingredients.length > 3 && (
                  <li className="text-warm-300 text-xs">他 {meal.ingredients.length - 3} 種... （タップで全表示）</li>
                )}
              </ul>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { label: "クックパッド", url: `https://cookpad.com/search/${encodeURIComponent(keyword)}` },
                  { label: "クラシル", url: `https://www.kurashiru.com/search?query=${encodeURIComponent(keyword)}` },
                ].map(({ label: siteName, url }) => (
                  <a
                    key={siteName}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-terra bg-terra-light rounded-md px-2 py-0.5 hover:bg-terra hover:text-white transition-colors no-underline"
                  >
                    {siteName}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showDetail && (
        <MealDetailModal
          meal={meal}
          label={label}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
