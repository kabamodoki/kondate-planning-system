"use client";

import { ShoppingCategory } from "@/types";

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
  const handleCopy = () => {
    const text = categories
      .map((cat) => {
        const items = cat.items
          .map((item) => `  □ ${item.name}  ${item.totalAmount}  （${item.usedIn.join("・")}）`)
          .join("\n");
        return `■ ${cat.category}\n${items}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={handleCopy} className="btn-secondary text-sm">
          📋 コピー
        </button>
        <button onClick={() => window.print()} className="btn-secondary text-sm">
          🖨️ 印刷
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.category} className="card">
            <h3 className="font-bold text-warm-900 mb-3 flex items-center gap-2">
              <span>{CATEGORY_EMOJI[cat.category] ?? "🛒"}</span>
              <span>{cat.category}</span>
            </h3>
            <ul className="space-y-2">
              {cat.items.map((item) => (
                <li key={item.name} className="flex items-start gap-3">
                  <input type="checkbox" className="mt-0.5 accent-terra flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-warm-900 text-sm">{item.name}</span>
                    <span className="text-warm-500 text-sm ml-2">{item.totalAmount}</span>
                    <p className="text-xs text-warm-300 mt-0.5">{item.usedIn.join("・")}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
