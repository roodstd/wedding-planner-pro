"use client";

import { useEffect, useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import type { RundownTemplate } from "@/lib/types";

export default function TemplatesLibraryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { loadItems } = usePlanner();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<RundownTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rundown_templates")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error && data) setTemplates(data as RundownTemplate[]);
  };

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  if (!open) return null;

  const remove = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("rundown_templates").delete().eq("id", id);
    if (!error) {
      setTemplates((t) => t.filter((x) => x.id !== id));
      toast("Preset dihapus", "success");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-card">
        <button onClick={onClose} className="absolute right-4 top-4 text-ink-300 hover:text-ink-600">
          ✕
        </button>
        <h3 className="mb-6 font-display text-xl text-ink-900">Preset Acara Tersimpan</h3>

        {loading && <p className="text-sm text-ink-400">Memuat preset...</p>}

        {!loading && templates.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-ink-100 p-8 text-center text-sm text-ink-400">
            Belum ada preset. Buat susunan acara lalu klik &ldquo;Simpan Preset&rdquo; pada konfigurasi.
          </div>
        )}

        <div className="mb-4 grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-ink-100 bg-parchment-50/50 p-5 shadow-sm transition hover:border-gold-300">
              <h4 className="mb-1 font-display text-lg text-ink-900">{t.name}</h4>
              <p className="mb-3 text-xs text-ink-400">{t.description || "Tanpa deskripsi"}</p>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-ink-300">
                <span className="rounded bg-ink-50 px-2 py-1 text-ink-600">{t.items.length} sesi</span>
                <span>{new Date(t.created_at).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    loadItems("custom", t.items);
                    onClose();
                    toast(`Preset "${t.name}" berhasil dimuat`, "success");
                  }}
                  className="flex-1 rounded-lg bg-gold-gradient px-3 py-2 text-sm font-semibold text-white shadow-gold transition hover:brightness-105"
                >
                  Gunakan Preset
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
