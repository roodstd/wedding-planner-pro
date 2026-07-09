"use client";

type Props = {
  groom: string;
  bride: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenTemplates: () => void;
  onSignOut: () => void;
};

export default function Sidebar({ groom, bride, mobileOpen, onCloseMobile, onOpenTemplates, onSignOut }: Props) {
  const initials = `${(groom || "P").charAt(0).toUpperCase()}${(bride || "W").charAt(0).toUpperCase()}`;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed z-40 flex h-screen w-72 flex-col bg-ink-gradient text-parchment-100 transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/40 font-display text-base italic text-gold-300">
            {initials}
          </div>
          <div>
            <p className="font-display text-lg leading-none text-parchment-50">Planner Pro</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-parchment-100/40">
              Rundown &amp; Naskah Acara
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-parchment-100/35">
            Menu Utama
          </p>
          <div className="flex items-center gap-3 rounded-xl bg-gold-400/10 px-4 py-2.5 text-sm font-semibold text-gold-300 ring-1 ring-gold-400/20">
            <span className="text-base">◆</span> Dashboard Rundown
          </div>
          <button
            onClick={onOpenTemplates}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-parchment-100/75 transition hover:bg-white/5"
          >
            <span className="text-base opacity-70">▤</span> Preset Tersimpan
          </button>
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-parchment-100/60 transition hover:bg-white/5 hover:text-parchment-50"
          >
            <span className="text-base opacity-70">⏻</span> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
