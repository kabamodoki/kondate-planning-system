"use client";

import Image from "next/image";
import { useUnsplashImage } from "@/hooks/useUnsplashImage";

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;

export interface CarouselItem {
  label: string;
  emoji: string;
  query: string;
  imageQuery: string;
}

export const FOOD_ITEMS: CarouselItem[] = [
  { label: "カレー",       emoji: "🍛", query: "カレールウ",            imageQuery: "curry japanese food" },
  { label: "ラーメン",     emoji: "🍜", query: "ラーメン 乾麺",          imageQuery: "ramen noodles japanese" },
  { label: "パスタ",       emoji: "🍝", query: "パスタ 乾麺",            imageQuery: "pasta spaghetti italian" },
  { label: "鍋の素",       emoji: "🫕", query: "鍋の素 鍋つゆ",          imageQuery: "japanese hot pot nabe" },
  { label: "お米",         emoji: "🍚", query: "お米 5kg 白米",          imageQuery: "japanese rice bowl" },
  { label: "だし・スープ", emoji: "🧂", query: "だし スープ 調味料",     imageQuery: "japanese soup miso" },
];

export const KITCHEN_ITEMS: CarouselItem[] = [
  { label: "フライパン",  emoji: "🍳", query: "フライパン テフロン",           imageQuery: "frying pan kitchen cooking" },
  { label: "包丁",        emoji: "🔪", query: "包丁 三徳包丁",                imageQuery: "kitchen knife chef cutting" },
  { label: "深鍋",        emoji: "🥘", query: "深型鍋 ステンレス",             imageQuery: "cooking pot stainless" },
  { label: "保存容器",    emoji: "🥡", query: "保存容器 作り置き",             imageQuery: "food storage container glass" },
  { label: "計量セット",  emoji: "🥄", query: "計量カップ 計量スプーン セット", imageQuery: "measuring cups spoons baking" },
];

interface CardProps {
  item: CarouselItem;
  amazonTag: string;
}

function ImageCard({ item, amazonTag }: CardProps) {
  const imageUrl = useUnsplashImage(item.imageQuery);

  return (
    <a
      href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(item.query)}&tag=${amazonTag}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-28 rounded-2xl overflow-hidden bg-warm-50 hover:scale-105 transition-transform no-underline shadow-sm"
    >
      <div className="relative h-24 bg-warm-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.label}
            fill
            className="object-cover"
            sizes="112px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {item.emoji}
          </div>
        )}
      </div>
      <div className="px-2 py-2 text-center">
        <span className="text-xs font-medium text-warm-700">{item.label}</span>
      </div>
    </a>
  );
}

interface Props {
  items: CarouselItem[];
  label?: string;
}

export default function AmazonCarousel({ items, label }: Props) {
  if (!AMAZON_TAG) return null;

  const doubled = [...items, ...items];
  const duration = items.length * 3;

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-3">
        {label && <p className="text-xs text-warm-400">{label}</p>}
        <span className="text-xs text-warm-300 border border-warm-100 px-1.5 py-0.5 rounded">PR</span>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex gap-3 hover:[animation-play-state:paused]"
          style={{
            animation: `carousel-scroll ${duration}s linear infinite`,
            width: "max-content",
          }}
        >
          {doubled.map((item, i) => (
            <ImageCard key={`${item.label}-${i}`} item={item} amazonTag={AMAZON_TAG} />
          ))}
        </div>
      </div>
    </div>
  );
}
