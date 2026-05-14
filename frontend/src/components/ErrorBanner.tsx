"use client";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start justify-between gap-3 bg-blush-light border border-blush rounded-xl px-4 py-3 mb-4">
      <p className="text-sm text-warm-900 leading-relaxed">{message}</p>
      <button
        onClick={onDismiss}
        className="text-warm-500 hover:text-warm-900 text-lg leading-none flex-shrink-0 transition-colors"
      >
        ×
      </button>
    </div>
  );
}
