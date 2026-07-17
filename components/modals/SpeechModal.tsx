"use client";

import { useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { useToast } from "@/context/ToastContext";
import { useGemini } from "@/lib/useGemini";
import { EVENT_TYPE_OPTIONS } from "@/lib/templates";

const SPEECH_TYPES = [
  "Sambutan Perwakilan Keluarga Pria",
  "Sambutan Perwakilan Keluarga Wanita",
  "Wedding Vows (Janji Suci) Pria",
  "Wedding Vows (Janji Suci) Wanita",
  "Wedding Toast (Ucapan Bersulang)",
  "Ucapan Syukur & Terima Kasih Orang Tua",
];

export default function SpeechModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { details } = usePlanner();
  const { toast } = useToast();
  const { loading, callGemini } = useGemini();
  const [speechType, setSpeechType] = useState(SPEECH_TYPES[0]);
  const [content, setContent] = useState("");

  if (!open) return null;

  const eventType = EVENT_TYPE_OPTIONS.find((o) => o.value === details.type)?.label || "Acara Pernikahan";

  const generate = async () => {
    try {
      const text = await callGemini("speech", {
        speechType,
        eventType,
        groom: details.groom,
        bride: details.bride,
        location: details.location,
      });
      setContent(text);
      toast("✨ Draf pidato berhasil ditulis AI!", "success");
    } catch {
      toast("Gagal membuat pidato AI.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-ink-900">Penulis Pidato &amp; Sambutan (AI)</h3>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-600">
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 bg-parchment-50/60 p-3 sm:flex-row">
            <span className="text-sm font-semibold text-ink-600">Jenis Pidato:</span>
            <select
              value={speechType}
              onChange={(e) => setSpeechType(e.target.value)}
              className="flex-1 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none"
            >
              {SPEECH_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
            >
              ✨ {loading ? "Menulis..." : "Buat Draf Pidato"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pilih jenis pidato dan klik 'Buat Draf Pidato'. AI akan menuliskan naskah pidato/sambutan yang indah, menyentuh, dan terstruktur sesuai data pasangan & acara Anda..."
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
              toast("Pidato disalin ke clipboard!", "success");
            }}
            className="flex-1 rounded-xl bg-pink-500 px-4 py-2.5 font-semibold text-white shadow-soft transition hover:bg-pink-600"
          >
            Salin Pidato
          </button>
        </div>
      </div>
    </div>
  );
}
