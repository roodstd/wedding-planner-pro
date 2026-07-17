"use client";

import { usePlanner } from "@/context/PlannerContext";

export default function Header({
  onMenu,
  search,
  onSearch,
}: {
  onMenu: () => void;
  search: string;
  onSearch: (v: string) => void;
}) {
  const { undo, redo, saving } = usePlanner();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100/70 bg-parchment-50/85 px-5 py-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenu}
          className="rounded-lg border border-ink-100 bg-white p-2 text-ink-600 shadow-soft lg:hidden"
          aria-label="Buka menu"
        >
          ☰
        </button>
        <div>
          <h2 className="font-display text-xl text-ink-900">Manajemen Rundown</h2>
          <p className="text-xs text-ink-400">
            {saving ? "Menyimpan perubahan…" : "Tersimpan otomatis"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Cari prosesi..."
          className="hidden w-44 rounded-xl border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none transition focus:w-64 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15 sm:block"
        />
        <div className="hidden h-8 w-px bg-ink-100 sm:block" />
        <button
          onClick={undo}
          title="Undo (Ctrl+Z)"
          className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-600 shadow-soft transition hover:bg-parchment-100"
        >
          ↺
        </button>
        <button
          onClick={redo}
          title="Redo (Ctrl+Y)"
          className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-600 shadow-soft transition hover:bg-parchment-100"
        >
          ↻
        </button>
      </div>
    </header>
  );
}
