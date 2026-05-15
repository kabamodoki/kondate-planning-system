"use client";

import { useEffect } from "react";
import { Meal } from "@/types";

interface MealDetailModalProps {
  meal: Meal;
  label: string;
  onClose: () => void;
}

export default function MealDetailModal({ meal, label, onClose }: MealDetailModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* モーダル本体: スマホ=ボトムシート、PC=中央 */}
      <div className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto shadow-xl">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-warm-100">
            <div>
              <p className="text-xs text-warm-400 mb-0.5">{label}</p>
              <h3 className="font-bold text-warm-900 text-base leading-tight">{meal.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-warm-400 hover:text-terra text-xl leading-none p-1"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* メタ情報 */}
          <div className="flex gap-4 px-5 py-3 border-b border-warm-100">
            {meal.cooking_time != null && (
              <span className="text-sm text-warm-600">🕐 約{meal.cooking_time}分</span>
            )}
            {meal.estimated_cost != null && (
              <span className="text-sm text-warm-600">💰 食材費目安 ¥{meal.estimated_cost.toLocaleString()}</span>
            )}
          </div>

          {/* 説明 */}
          {meal.description && (
            <p className="px-5 pt-3 text-sm text-warm-500">{meal.description}</p>
          )}

          {/* 材料リスト */}
          <div className="px-5 py-4">
            <p className="text-xs font-bold text-warm-500 uppercase tracking-wide mb-3">材料</p>
            <ul className="space-y-2">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-baseline justify-between text-sm">
                  <span className="text-warm-800">{ing.name}</span>
                  <span className="text-warm-400 ml-4 flex-shrink-0">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* スマホ用スワイプハンドル */}
          <div className="sm:hidden flex justify-center pb-4">
            <div className="w-10 h-1 rounded-full bg-warm-200" />
          </div>
        </div>
      </div>
    </>
  );
}
