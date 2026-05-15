"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UsageData {
  remaining: number;
  total: number;
}

export default function UsageBanner() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => (r.ok ? r.json() : null))
      .then(data => data && setUsage(data))
      .catch(() => {});
  }, []);

  if (!usage) return null;

  if (usage.remaining === 0) {
    return (
      <div className="bg-warm-100 border border-warm-200 rounded-xl px-4 py-3 mb-6 text-sm text-warm-700 space-y-1">
        <p className="font-medium">本日の生成枠が終了しました。</p>
        <p className="text-xs text-warm-400">AI の無料 API を全ユーザーで共有しているため、上限に達することがあります。</p>
        <Link href="/community" className="text-terra font-medium hover:underline">
          みんなの献立をご覧ください →
        </Link>
      </div>
    );
  }

  const pct = Math.round((usage.remaining / usage.total) * 100);
  const barColor =
    usage.remaining <= 10 ? "bg-red-400" :
    usage.remaining <= 30 ? "bg-amber-400" :
    "bg-green-400";

  return (
    <div className="bg-warm-100 border border-warm-200 rounded-xl px-4 py-3 mb-6">
      <div className="flex items-center justify-between text-xs text-warm-600 mb-1.5">
        <span>本日の空き枠</span>
        <span className="font-bold text-warm-800">{usage.remaining} <span className="font-normal text-warm-400">/ {usage.total}</span></span>
      </div>
      <div className="h-1.5 bg-warm-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-warm-300 mt-1.5">AI の無料 API を全ユーザーで共有しています</p>
    </div>
  );
}
