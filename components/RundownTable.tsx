"use client";

import { useMemo, useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { fmt } from "@/lib/utils";
import { getCatColor } from "@/lib/templates";

export default function RundownTable({
  search,
  onOpenAdd,
  onOpenSpeech,
  onOpenMc,
  onOpenPicBrief,
  onExportPDF,
  onExportExcel,
  onCopyWA,
}: {
  search: string;
  onOpenAdd: () => void;
  onOpenSpeech: () => void;
  onOpenMc: () => void;
  onOpenPicBrief: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onCopyWA: () => void;
}) {
  const { rundown, updateRow, deleteRow, duplicateRow, reorderRow } = usePlanner();
  const [filterPic, setFilterPic] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const pics = useMemo(() => [...new Set(rundown.map((r) => r.pic).filter(Boolean))], [rundown]);

  const visibleIdx = useMemo(() => {
    return rundown
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => {
        if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPic && r.pic !== filterPic) return false;
        return true;
      })
      .map(({ i }) => i);
  }, [rundown, search, filterPic]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100/70 bg-parchment-50/60 p-4">
        <h3 className="font-display text-lg text-ink-900">Rundown Interaktif</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenPicBrief}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:brightness-105"
          >
            ✨ Panduan PIC
          </button>
          <select
            value={filterPic}
            onChange={(e) => setFilterPic(e.target.value)}
            className="rounded-lg border border-ink-100 bg-white px-3 py-1.5 text-sm outline-none"
          >
            <option value="">Semua PIC</option>
            {pics.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-ink-700"
          >
            + Tambah Baris
          </button>
        </div>
      </div>

      <div className="max-h-[600px] flex-1 overflow-x-auto border-b border-ink-100/70">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-parchment-100/90 text-xs font-semibold uppercase tracking-wide text-ink-400 backdrop-blur">
            <tr>
              <th className="w-10 px-3 py-3 text-center"></th>
              <th className="w-12 px-3 py-3 text-center">No</th>
              <th className="min-w-[200px] px-4 py-3">Prosesi / Aktivitas</th>
              <th className="w-20 px-3 py-3 text-center">Mulai</th>
              <th className="w-20 px-3 py-3 text-center">Selesai</th>
              <th className="w-24 px-3 py-3 text-center">Durasi(m)</th>
              <th className="w-40 px-4 py-3">PIC</th>
              <th className="min-w-[150px] px-4 py-3">Catatan</th>
              <th className="w-16 px-3 py-3 text-center">Done</th>
              <th className="w-20 px-3 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100/70">
            {visibleIdx.map((idx) => {
              const r = rundown[idx];
              const color = getCatColor(r.name);
              return (
                <tr
                  key={idx}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverIdx(idx);
                  }}
                  onDragLeave={() => setOverIdx(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOverIdx(null);
                    if (dragIdx !== null) reorderRow(dragIdx, idx);
                    setDragIdx(null);
                  }}
                  className={`group bg-white transition hover:bg-parchment-50 ${overIdx === idx ? "drag-over" : ""}`}
                >
                  <td className="cursor-grab px-2 py-2 text-center text-ink-300 hover:text-gold-500">⠿</td>
                  <td className="px-3 py-2 text-center text-sm font-semibold text-ink-300">{idx + 1}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full shadow-sm" style={{ background: color }} />
                      <input
                        defaultValue={r.name}
                        onBlur={(e) => e.target.value !== r.name && updateRow(idx, "name", e.target.value)}
                        className="table-input font-medium text-ink-800"
                      />
                    </div>
                  </td>
                  <td className="bg-sky-50/40 px-3 py-2 text-center font-mono text-xs font-semibold text-sky-600">
                    {fmt(r.start)}
                  </td>
                  <td className="bg-emerald-50/40 px-3 py-2 text-center font-mono text-xs font-semibold text-emerald-600">
                    {fmt(r.end)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min={1}
                      defaultValue={r.dur}
                      onBlur={(e) => +e.target.value !== r.dur && updateRow(idx, "dur", +e.target.value)}
                      className="table-input w-16 text-center"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      defaultValue={r.pic || ""}
                      placeholder="PIC..."
                      onBlur={(e) => e.target.value !== r.pic && updateRow(idx, "pic", e.target.value)}
                      className="table-input text-xs font-medium text-violet-700"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      defaultValue={r.note || ""}
                      placeholder="Catatan..."
                      onBlur={(e) => e.target.value !== r.note && updateRow(idx, "note", e.target.value)}
                      className="table-input text-xs text-ink-400"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={r.done}
                      onChange={(e) => updateRow(idx, "done", e.target.checked)}
                      className="h-5 w-5 cursor-pointer rounded accent-gold-500 transition-transform hover:scale-110"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => duplicateRow(idx)} title="Duplikat" className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50">
                        ⧉
                      </button>
                      <button onClick={() => deleteRow(idx)} title="Hapus" className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rundown.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-400">
            Belum ada acara. Muat template, buat manual, atau Generate dengan AI.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-parchment-50/60 p-4">
        <div className="text-sm font-medium text-ink-600">
          Selesai Estimasi:{" "}
          <span className="ml-1 font-mono text-base text-gold-600">
            {rundown.length ? fmt(rundown[rundown.length - 1].end) : "--:--"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenSpeech}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            ✨ Pidato/Sambutan
          </button>
          <button
            onClick={onOpenMc}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Naskah MC
          </button>
          <button
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Cetak PDF
          </button>
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Ekspor Excel
          </button>
          <button
            onClick={onCopyWA}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            Salin WA
          </button>
        </div>
      </div>
    </div>
  );
}
