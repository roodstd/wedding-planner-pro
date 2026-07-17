"use client";

import { useState } from "react";
import { usePlanner } from "@/context/PlannerContext";

export default function AddRowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addRow } = usePlanner();
  const [name, setName] = useState("");
  const [dur, setDur] = useState(15);
  const [pic, setPic] = useState("");
  const [note, setNote] = useState("");

  if (!open) return null;

  const reset = () => {
    setName("");
    setDur(15);
    setPic("");
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h3 className="mb-5 border-b border-ink-100 pb-3 font-display text-xl text-ink-900">
          Tambah Prosesi Manual
        </h3>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addRow({ name, dur, pic, note });
            reset();
            onClose();
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-400">Nama Prosesi</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-400">Durasi (menit)</label>
            <input
              type="number"
              min={1}
              required
              value={dur}
              onChange={(e) => setDur(+e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-400">Penanggung Jawab (PIC)</label>
            <input value={pic} onChange={(e) => setPic(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-400">Catatan Tambahan</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="field-input" />
          </div>
          <div className="flex gap-3 border-t border-ink-100 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1">
              Simpan Prosesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
