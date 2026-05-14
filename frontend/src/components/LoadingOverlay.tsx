"use client";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "読み込み中..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-warm-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-card-hover px-10 py-8 flex flex-col items-center gap-4 max-w-xs mx-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-terra-light border-t-terra animate-spin" />
        <p className="text-warm-700 font-medium text-sm leading-relaxed whitespace-pre-line">{message}</p>
      </div>
    </div>
  );
}
