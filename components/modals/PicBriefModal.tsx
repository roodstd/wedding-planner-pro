"use client";

import { useMemo, useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { useToast } from "@/context/ToastContext";
import { useGemini } from "@/lib/useGemini";
import { fmt } from "@/lib/utils";
import { EVENT_TYPE_OPTIONS } from "@/lib/templates";

export default function PicBriefModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { details, rundown } = usePlanner();
  const { toast } = useToast();
  const { loading, callGemini } = useGemini();
  const [pic, setPic] = useState("");
  const [content, setContent] = useState("");

  const pics = useMemo(() => [...new Set(rundown.map((r) => r.pic).filter(Boolean))], [rundown]);
  const eventType = EVENT_TYPE_OPTIONS.find((o) => o.value === details.type)?.label || "Acara Pernikahan";

  if (!open) return null;

  const generate = async () => {
    if (!pic) {
      toast("Silakan pilih PIC dari dropdown!", "error");
      return;
    }
    const relevantRundown = rundown
      .filter((r) => r.pic === pic || (r.pic && r.pic.toLowerCase().includes(pic.toLowerCase())))
      .map((r) => `[${fmt(r.start)} - ${fmt(r.end)}] ${r.name} - Catatan: ${r.note || "-"}`)
      .join("\n");
    const fullRundown = rundown
      .map((r, i) => `${i + 1}. [${fmt(r.start)} - ${fmt(r.end)}] ${r.name} (PIC: ${r.pic || "-"})`)
      .join("\n");

    try {
      const text = await callGemini("pic-brief", {
        pic,
        eventType,
        groom: details.groom,
        bride: details.bride,
        relevantRundown,
        fullRundown,
      });
      setContent(text);
      toast("✨ Panduan PIC berhasil dibuat AI!", "success");
    } catch {
      toast("Gagal membuat panduan AI.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-ink-900">Panduan Tugas PIC (AI)</h3>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-600">
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 bg-parchment-50/60 p-3 sm:flex-row">
            <span className="text-sm font-semibold text-ink-600">Pilih PIC / Vendor:</span>
            <select
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              className="flex-1 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Pilih PIC yang ada di rundown...</option>
              {pics.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
            >
              ✨ {loading ? "Menyusun..." : "Buat Instruksi"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pilih PIC di atas lalu klik 'Buat Instruksi'. AI akan membaca seluruh jadwal dan meracik brief serta instruksi kerja spesifik untuk PIC tersebut..."
            className="field-input flex-1 resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-ink-100 pt-4 sm:flex-row">
          <button onClick={onClose} className="btn-secondary flex-1">
            Tutup
          </button>
          <button
            onClick={() => {
              if (!content) return;
              navigator.clipboard.writeText(content);
              toast("Panduan PIC disalin!", "success");
            }}
            className="flex-1 rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white shadow-soft transition hover:bg-cyan-700"
          >
            Salin Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
