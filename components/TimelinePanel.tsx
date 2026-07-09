"use client";

import { useEffect, useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { fmt } from "@/lib/utils";
import { getCatColor } from "@/lib/templates";

export default function TimelinePanel() {
  const { rundown } = usePlanner();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  let countdown: string | null = null;
  if (now && rundown.length) {
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const next = rundown.find((r) => r.start > nowMins && !r.done);
    countdown = next ? `${next.name} mulai dalam ${next.start - nowMins} menit` : "Semua acara hari ini telah selesai.";
  }

  return (
    <div className="flex max-h-[700px] w-full flex-col rounded-2xl border border-ink-100/70 bg-ink-gradient p-5 text-parchment-100 shadow-card xl:w-72">
      <h3 className="mb-4 font-display text-lg text-parchment-50">Alur Waktu Acara</h3>
      <div className="flex-1 space-y-0 overflow-y-auto pr-1">
        {rundown.map((r, i) => {
          const color = getCatColor(r.name);
          return (
            <div key={i} className="relative flex gap-4 pb-5">
              <div className="absolute bottom-0 left-[7px] top-1 w-px bg-white/10" />
              <div
                className="z-10 mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 bg-ink-900"
                style={{ borderColor: color, background: r.done ? color : undefined }}
              />
              <div className="w-full pb-1">
                <div className="mb-0.5 flex items-baseline justify-between">
                  <p className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-parchment-100/70">
                    {fmt(r.start)}
                  </p>
                  <span className="text-[10px] text-parchment-100/40">{r.dur}m</span>
                </div>
                <p className={`text-sm font-semibold leading-tight text-parchment-50 ${r.done ? "opacity-40 line-through" : ""}`}>
                  {r.name}
                </p>
                {r.pic && <p className="mt-1 text-[10px] text-gold-300/80">◦ {r.pic}</p>}
              </div>
            </div>
          );
        })}
        {rundown.length === 0 && (
          <p className="text-sm text-parchment-100/40">Timeline akan muncul setelah rundown diisi.</p>
        )}
      </div>
      {countdown && (
        <p className="mt-4 rounded-xl bg-white/5 px-3 py-2.5 text-center text-xs font-medium text-gold-200">
          {countdown}
        </p>
      )}
    </div>
  );
}
