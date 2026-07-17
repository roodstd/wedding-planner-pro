"use client";

import { useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";

export default function SaveTemplateModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { rundown } = usePlanner();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rundown.length) {
      toast("Tambahkan prosesi terlebih dahulu", "error");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const items = rundown.map((r) => ({ name: r.name, dur: r.dur, pic: r.pic, note: r.note }));
    const { error } = await supabase.from("rundown_templates").insert({ name, description: desc, items });
    setSaving(false);
    if (error) {
      toast("Gagal menyimpan preset", "error");
      return;
    }
    toast("Preset acara disimpan", "success");
    setName("");
    setDesc("");
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h3 className="mb-4 border-b border-ink-100 pb-3 font-display text-xl text-ink-900">
          Simpan Sebagai Preset
        </h3>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-400">Nama Preset</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pernikahan Adat Jawa"
              className="field-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-400">Deskripsi Ringkas</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Deskripsikan acara ini..."
              rows={3}
              className="field-input"
            />
          </div>
          <div className="flex gap-3 border-t border-ink-100 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button disabled={saving} type="submit" className="btn-primary flex-1 disabled:opacity-60">
              {saving ? "Menyimpan..." : "Simpan Preset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
