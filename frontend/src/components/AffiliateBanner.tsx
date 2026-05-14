const OISIX_URL = process.env.NEXT_PUBLIC_OISIX_AFFILIATE_URL;

export default function AffiliateBanner() {
  if (!OISIX_URL) return null;

  return (
    <div className="mb-4 px-4">
      <p className="text-xs text-warm-300 text-center mb-1">PR</p>
      <a
        href={OISIX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 max-w-sm mx-auto px-4 py-3 rounded-xl border border-sage/30 bg-sage/5 hover:bg-sage/10 transition-colors text-warm-700 no-underline"
      >
        <span className="text-lg">🥦</span>
        <span className="text-sm font-medium">食材をまとめて注文するなら Oisix</span>
        <span className="text-terra text-sm">→</span>
      </a>
    </div>
  );
}
