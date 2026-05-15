"use client";

import { useState } from "react";
import { CHANGELOG } from "@/lib/changelog";

export default function VersionHistory() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-warm-300 hover:text-warm-500 transition-colors mx-auto"
      >
        <span>{open ? "▲" : "▼"}</span>
        <span>アップデート履歴</span>
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="border border-warm-100 rounded-xl p-4 bg-white/60">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold bg-terra text-white px-2 py-0.5 rounded-full">
                  {entry.version}
                </span>
                <span className="text-xs text-warm-400">{entry.date}</span>
              </div>
              <ul className="space-y-1">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-warm-600">
                    <span className="text-terra mt-0.5 flex-shrink-0">·</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
