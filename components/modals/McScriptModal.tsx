"use client";

import { useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { useToast } from "@/context/ToastContext";
import { useGemini } from "@/lib/useGemini";
import { fmt } from "@/lib/utils";
import { EVENT_TYPE_OPTIONS } from "@/lib/templates";
import { exportMcScriptPDF } from "@/lib/exports";

export default function McScriptModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { details, rundown } = usePlanner();
  const { toast } = useToast();
  const { loading, callGemini } = useGemini();
  const [content, setContent] = useState("");
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const eventType = EVENT_TYPE_OPTIONS.find((o) => o.value === details.type)?.label || "Pernikahan";

  const generate = async () => {
    if (!rundown.length) {
      toast("Buat rundown terlebih dahulu", "error");
      return;
    }
    const rundownText = rundown.map((r, i) => `${i + 1}. [${fmt(r.start)} - ${fmt(r.end)}] ${r.name}`).join("\n");
    try {
      const text = await callGemini("mc-script", {
        eventType,
        groom: details.groom,
        bride: details.bride,
        location: details.location,
        date: details.date,
        rundownText,
        groomFather: details.groomFather,
        groomMother: details.groomMother,
        brideFather: details.brideFather,
        brideMother: details.brideMother,
      });
      setContent(text);
      toast("✨ Naskah MC berhasil dibuat AI!", "success");
    } catch {
      toast("Gagal membuat naskah AI.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-ink-900">Naskah MC Profesional (AI)</h3>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-600">
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <button
            onClick={generate}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
          >
            ✨ {loading ? "Menyusun naskah..." : "Buat Naskah Sekarang"}
          </button>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Klik 'Buat Naskah Sekarang' untuk meminta AI meracik naskah opening, transisi, dan closing khusus untuk MC Anda. Bisa diedit manual sebelum diekspor!"
            className="field-input flex-1 resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-ink-100 pt-4 sm:flex-row">
          <button onClick={onClose} className="btn-secondary flex-1">
            Tutup
          </button>
          <button
            disabled={exporting || !content}
            onClick={async () => {
              setExporting(true);
              try {
                await exportMcScriptPDF(details, content);
              } finally {
                setExporting(false);
              }
            }}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 font-semibold text-white shadow-soft transition hover:bg-red-600 disabled:opacity-60"
          >
            {exporting ? "Menyiapkan PDF..." : "Cetak PDF Naskah"}
          </button>
          <button
            onClick={() => {
              if (!content) return;
              navigator.clipboard.writeText(content);
              toast("Naskah disalin ke clipboard!", "success");
            }}
            className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 font-semibold text-white shadow-soft transition hover:bg-purple-700"
          >
            Salin Naskah
          </button>
        </div>
      </div>
    </div>
  );
}
