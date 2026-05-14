"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MealPlan, ShoppingCategory } from "@/types";
import { generateShoppingList } from "@/lib/api";
import ShoppingList from "@/components/ShoppingList";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorBanner from "@/components/ErrorBanner";

export default function ShoppingListPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ShoppingCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem("kondate_current");
        if (!raw) { router.replace("/"); return; }
        const plan = JSON.parse(raw) as MealPlan;
        const cats = await generateShoppingList(plan.meals);
        setCategories(cats);
      } catch {
        setError("買い物リストの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return <LoadingOverlay message="買い物リストを生成中..." />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-warm-400 hover:text-terra transition-colors text-lg"
        >
          ←
        </button>
        <h2 className="text-xl font-extrabold text-warm-900">🛒 買い物リスト</h2>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {categories && <ShoppingList categories={categories} />}
    </div>
  );
}
