"use client";

import { useState, useMemo } from "react";
import { ShoppingCategory } from "@/types";

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;
const AMAZON_EXCLUDED_CATEGORIES = ["肉・魚類", "野菜", "卵・乳製品"];

const CATEGORY_EMOJI: Record<string, string> = {
  "肉・魚類": "🥩",
  "野菜": "🥦",
  "卵・乳製品": "🥚",
  "調味料": "🧂",
  "その他": "🛒",
};

interface ShoppingListProps {
  categories: ShoppingCategory[];
}

export default function ShoppingList({ categories }: ShoppingListProps) {
  const allKeys = useMemo(
    () => categories.flatMap(cat => cat.items.map(item => `${cat.category}::${item.name}`)),
    [categories]
  );
  const [checked, setChecked] = useState<Set<string>>(() => new Set(allKeys));

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectAll = () => setChecked(new Set(allKeys));
  const deselectAll = () => setChecked(new Set());

  const handleCopy = () => {
    const text = categories
      .map((cat) => {
        const items = cat.items
          .filter(item => checked.has(`${cat.category}::${item.name}`))
          .map((item) => `  □ ${item.name}  ${item.totalAmount}  （${item.usedIn.join("・")}）`)
          .join("\n");
        return items ? `■ ${cat.category}\n${items}` : null;
      })
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button onClick={handleCopy} className="btn-secondary text-sm">
          📋 コピー
        </button>
        <button onClick={() => window.print()} className="btn-secondary text-sm">
          🖨️ 印刷
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <button onClick={selectAll} className="text-terra hover:underline">全選択</button>
          <span className="text-warm-200">|</span>
          <button onClick={deselectAll} className="text-warm-400 hover:underline">全解除</button>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.category} className="card">
            <h3 className="font-bold text-warm-900 mb-3 flex items-center gap-2">
              <span>{CATEGORY_EMOJI[cat.category] ?? "🛒"}</span>
              <span>{cat.category}</span>
            </h3>
            <ul className="space-y-2">
              {cat.items.map((item) => {
                const key = `${cat.category}::${item.name}`;
                const isChecked = checked.has(key);
                return (
                  <li key={item.name} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(key)}
                      className="mt-0.5 accent-terra flex-shrink-0 cursor-pointer"
                    />
                    <div className={`flex-1 min-w-0 transition-opacity ${isChecked ? "opacity-100" : "opacity-40"}`}>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-warm-900 text-sm">{item.name}</span>
                        <span className="text-warm-500 text-sm">{item.totalAmount}</span>
                        {AMAZON_TAG && !AMAZON_EXCLUDED_CATEGORIES.includes(cat.category) && (
                          <a
                            href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(item.name)}&tag=${AMAZON_TAG}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-terra hover:underline flex-shrink-0 no-underline"
                          >
                            Amazon PR
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-warm-300 mt-0.5">{item.usedIn.join("・")}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
