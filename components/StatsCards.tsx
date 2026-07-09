"use client";

import { usePlanner } from "@/context/PlannerContext";
import { fmt } from "@/lib/utils";

export default function StatsCards() {
  const { rundown } = usePlanner();

  const total = rundown.reduce((s, r) => s + r.dur, 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const done = rundown.filter((r) => r.done).length;
  const pct = rundown.length ? Math.round((done / rundown.length) * 100) : 0;
  const pics = [...new Set(rundown.map((r) => r.pic).filter(Boolean))];
  const endTime = rundown.length ? fmt(rundown[rundown.length - 1].end) : "--:--";

  const items = [
    { label: "Total Prosesi", value: rundown.length, icon: "▤", tint: "bg-sky-50 text-sky-500" },
    { label: "Estimasi Durasi", value: h ? `${h}j ${m}m` : `${m}m`, icon: "◷", tint: "bg-emerald-50 text-emerald-500" },
    { label: "Tim PIC", value: pics.length, icon: "◈", tint: "bg-violet-50 text-violet-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="card flex items-center gap-4 p-5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg ${it.tint}`}>
            {it.icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{it.label}</p>
            <p className="font-display text-2xl text-ink-900">{it.value}</p>
          </div>
        </div>
      ))}
      <div className="card p-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
          <span>Progres</span>
          <span className="font-display text-sm normal-case text-gold-600">{pct}%</span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-ink-50">
          <div className="h-full rounded-full bg-gold-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-ink-400">Selesai estimasi {endTime}</p>
      </div>
    </div>
  );
}
