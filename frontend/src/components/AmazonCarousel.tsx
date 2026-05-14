const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;

export interface CarouselItem {
  label: string;
  emoji: string;
  query: string;
}

export const FOOD_ITEMS: CarouselItem[] = [
  { label: "カレー",     emoji: "🍛", query: "カレールウ" },
  { label: "ラーメン",   emoji: "🍜", query: "ラーメン 乾麺" },
  { label: "パスタ",     emoji: "🍝", query: "パスタ 乾麺" },
  { label: "鍋の素",     emoji: "🫕", query: "鍋の素 鍋つゆ" },
  { label: "お米",       emoji: "🍚", query: "お米 5kg 白米" },
  { label: "だし・スープ", emoji: "🧂", query: "だし スープ 調味料" },
];

export const KITCHEN_ITEMS: CarouselItem[] = [
  { label: "フライパン", emoji: "🍳", query: "フライパン テフロン" },
  { label: "包丁",       emoji: "🔪", query: "包丁 三徳包丁" },
  { label: "深鍋",       emoji: "🥘", query: "深型鍋 ステンレス" },
  { label: "保存容器",   emoji: "🥡", query: "保存容器 作り置き" },
  { label: "計量セット", emoji: "🥄", query: "計量カップ 計量スプーン セット" },
];

interface Props {
  items: CarouselItem[];
  label?: string;
}

export default function AmazonCarousel({ items, label }: Props) {
  if (!AMAZON_TAG) return null;

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-3">
        {label && <p className="text-xs text-warm-400">{label}</p>}
        <span className="text-xs text-warm-300 border border-warm-100 px-1.5 py-0.5 rounded">PR</span>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {items.map((item) => (
          <a
            key={item.label}
            href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(item.query)}&tag=${AMAZON_TAG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 w-[72px] h-[72px] rounded-2xl bg-warm-50 hover:bg-terra-light hover:scale-105 transition-all no-underline"
          >
            <span className="text-xl leading-none">{item.emoji}</span>
            <span className="text-xs font-medium text-warm-600">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
