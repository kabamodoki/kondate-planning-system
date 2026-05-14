"use client";

import { ShoppingCategory } from "@/types";

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;
const AMAZON_EXCLUDED_CATEGORIES = ["調味料"];

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
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-warm-900 text-sm">{item.name}</span>
                      <span className="text-warm-500 text-sm">{item.totalAmount}</span>
                      {AMAZON_TAG && !AMAZON_EXCLUDED_CATEGORIES.includes(cat.category) && (
                        <a
                          href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(item.name)}&tag=${AMAZON_TAG}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-terra hover:underline flex-shrink-0 no-underline"
                        >
                          Amazon PR
                        </a>
                      )}
                    </div>
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
