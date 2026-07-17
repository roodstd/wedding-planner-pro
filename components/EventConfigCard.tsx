"use client";

import { usePlanner } from "@/context/PlannerContext";
import { EVENT_TYPE_OPTIONS } from "@/lib/templates";

export default function EventConfigCard({
  onGenerateAI,
  generating,
  onSavePreset,
}: {
  onGenerateAI: () => void;
  generating: boolean;
  onSavePreset: () => void;
}) {
  const { details, setDetail, loadTemplateType } = usePlanner();

  const fields: { key: keyof typeof details; label: string; placeholder: string; type?: string }[] = [
    { key: "groom", label: "Mempelai Pria", placeholder: "Nama Pria" },
    { key: "bride", label: "Mempelai Wanita", placeholder: "Nama Wanita" },
    { key: "date", label: "Tanggal", placeholder: "", type: "date" },
    { key: "location", label: "Lokasi Acara", placeholder: "Gedung / Tempat" },
    { key: "mc", label: "Master of Ceremony", placeholder: "Nama MC" },
    { key: "wo", label: "Wedding Organizer", placeholder: "Nama WO" },
    { key: "startTime", label: "Jam Mulai", placeholder: "", type: "time" },
  ];

  return (
    <div className="card p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h3 className="font-display text-lg text-ink-900">Detail Konfigurasi Acara</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onGenerateAI}
            disabled={generating}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:brightness-105 disabled:opacity-60 sm:flex-none"
          >
            ✨ {generating ? "Menyusun rundown..." : "Generate dengan AI"}
          </button>
          <button
            onClick={() => loadTemplateType(details.type)}
            className="btn-secondary flex-1 sm:flex-none"
          >
            Muat Template
          </button>
          <button onClick={onSavePreset} className="btn-primary flex-1 sm:flex-none">
            Simpan Preset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
              {f.label}
            </label>
            <input
              type={f.type || "text"}
              value={details[f.key] as string}
              placeholder={f.placeholder}
              onChange={(e) => setDetail(f.key, e.target.value)}
              className={`field-input ${f.type === "time" ? "font-mono" : ""}`}
            />
          </div>
        ))}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Jenis Acara Utama
          </label>
          <select
            value={details.type}
            onChange={(e) => setDetail("type", e.target.value)}
            className="field-input"
          >
            <option value="">-- Pilih --</option>
            {EVENT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
