import type { Metadata } from "next";
import Link from "next/link";
import AffiliateBanner from "@/components/AffiliateBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "こんだて帖",
  description: "AIが1週間分の献立を自動で考えます",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-cream">
        <header className="bg-white/80 backdrop-blur-sm border-b border-warm-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <span className="text-2xl">🍱</span>
              <span className="font-bold text-lg text-warm-900 tracking-tight">こんだて帖</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/community"
                className="text-sm text-warm-500 hover:text-terra px-3 py-1.5 rounded-lg hover:bg-terra-light transition-colors no-underline"
              >
                みんなの献立
              </Link>
              <Link
                href="/history"
                className="text-sm text-warm-500 hover:text-terra px-3 py-1.5 rounded-lg hover:bg-terra-light transition-colors no-underline"
              >
                履歴
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="mt-16 border-t border-warm-100 bg-white/60 py-6 text-center">
          <AffiliateBanner />
          <div className="flex items-center justify-center gap-4 mb-1">
            <Link href="/terms" className="text-xs text-warm-300 hover:text-terra transition-colors no-underline">
              利用規約
            </Link>
            <a
              href="https://github.com/kabamodoki/kondate-planning-system"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-warm-300 hover:text-terra transition-colors no-underline"
            >
              GitHub
            </a>
          </div>
          <p className="text-xs text-warm-300">© 2026 こんだて帖</p>
        </footer>
      </body>
    </html>
  );
}
