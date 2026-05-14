"use client";

import { useState, useEffect } from "react";

const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? "";

const cache = new Map<string, string | null>();

export function useUnsplashImage(mealName: string): string | null {
  const [url, setUrl] = useState<string | null>(cache.get(mealName) ?? null);

  useEffect(() => {
    if (!ACCESS_KEY || !mealName) return;
    if (cache.has(mealName)) {
      setUrl(cache.get(mealName) ?? null);
      return;
    }

    let cancelled = false;
    fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(mealName)}&per_page=1&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const imgUrl = data?.results?.[0]?.urls?.small ?? null;
        cache.set(mealName, imgUrl);
        setUrl(imgUrl);
      })
      .catch(() => {
        cache.set(mealName, null);
      });

    return () => { cancelled = true; };
  }, [mealName]);

  return url;
}
