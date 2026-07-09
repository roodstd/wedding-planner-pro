"use client";

import { useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { CHECKLIST_TEMPLATE } from "@/lib/templates";
import PromptDialog from "./modals/PromptDialog";

export default function ChecklistCard() {
  const {
    details,
    checklist,
    checklistCustom,
    checklistCustomCategories,
    toggleChecklistItem,
    addChecklistItem,
    editChecklistItem,
    deleteChecklistItem,
    addChecklistCategory,
    deleteChecklistCategory,
  } = usePlanner();

  const type = details.type || "custom";
  const typeChecklist = checklist[type];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState<{ cat: string; item: string; isCustom: boolean } | null>(null);

  if (!type || !typeChecklist) {
    return (
      <div className="card p-8 text-center text-sm text-ink-400">
        Pilih jenis acara / muat template untuk menampilkan checklist.
      </div>
    );
  }

  const categories = [...Object.keys(CHECKLIST_TEMPLATE), ...(checklistCustomCategories[type] || [])];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100/70 bg-parchment-50/60 p-5">
        <h3 className="font-display text-lg text-ink-900">Checklist Persiapan H-1</h3>
      </div>

      <div className="divide-y divide-ink-100/70 p-2">
        {categories.map((cat) => {
          const templateItems = CHECKLIST_TEMPLATE[cat] || [];
          const deleted = new Set(
            (checklistCustom[type]?.[cat] || [])
              .filter((i) => i.startsWith("__deleted__"))
              .map((i) => i.substring(11))
          );
          const visibleTemplateItems = templateItems.filter((i) => !deleted.has(i));
          const customItems = (checklistCustom[type]?.[cat] || []).filter((i) => !i.startsWith("__deleted__"));
          const allItems = [...visibleTemplateItems, ...customItems];
          const itemsState = typeChecklist[cat] || {};
          const checkedCount = allItems.filter((i) => itemsState[i]).length;
          const isOpen = expanded[cat] ?? true;
          const isCustomCategory = !CHECKLIST_TEMPLATE[cat];
          const allChecked = allItems.length > 0 && checkedCount === allItems.length;

          return (
            <div key={cat}>
              <button
                onClick={() => setExpanded((e) => ({ ...e, [cat]: !isOpen }))}
                className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-parchment-50/70"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${allChecked ? "text-emerald-500" : "text-ink-200"}`}>
                    {allChecked ? "●" : "○"}
                  </span>
                  <span className="font-semibold text-ink-800">{cat}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      allChecked ? "bg-emerald-50 text-emerald-600" : "bg-ink-50 text-ink-400"
                    }`}
                  >
                    {checkedCount}/{allItems.length}
                  </span>
                  {isCustomCategory && (
                    <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-sky-600">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isCustomCategory && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChecklistCategory(cat);
                      }}
                      className="rounded p-1 text-rose-400 hover:text-rose-600"
                    >
                      ✕
                    </span>
                  )}
                  <span className={`text-ink-300 transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                </div>
              </button>

              {isOpen && (
                <div className="space-y-2 bg-parchment-50/40 px-5 py-3">
                  {allItems.map((item, idx) => {
                    const checked = itemsState[item] || false;
                    const isCustomItem = idx >= visibleTemplateItems.length;
                    return (
                      <div
                        key={item}
                        className="group flex items-center gap-3 rounded-xl border border-transparent p-2 shadow-sm transition hover:border-ink-100 hover:bg-white"
                      >
                        <label className="flex flex-1 cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleChecklistItem(cat, item, e.target.checked)}
                            className="h-5 w-5 cursor-pointer rounded accent-emerald-500"
                          />
                          <span className={`text-sm font-medium ${checked ? "text-ink-300 line-through" : "text-ink-700"}`}>
                            {item}
                          </span>
                        </label>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => setEditing({ cat, item, isCustom: isCustomItem })}
                            className="rounded-lg p-1.5 text-sky-500 hover:bg-sky-50"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteChecklistItem(cat, item, isCustomItem)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-2 flex gap-2 border-t border-ink-100/70 pt-2">
                    <input
                      value={newItemText[cat] || ""}
                      onChange={(e) => setNewItemText((s) => ({ ...s, [cat]: e.target.value }))}
                      placeholder="Tambah persiapan baru..."
                      className="field-input flex-1"
                    />
                    <button
                      onClick={() => {
                        addChecklistItem(cat, newItemText[cat] || "");
                        setNewItemText((s) => ({ ...s, [cat]: "" }));
                      }}
                      className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-5 mb-5 rounded-xl border border-sky-100 bg-sky-50/50 p-5">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-sky-800">Tambah Kategori Baru</h4>
        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nama kategori (misal: Seragam)"
            className="field-input flex-1"
          />
          <button
            onClick={() => {
              addChecklistCategory(newCategory);
              setNewCategory("");
            }}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            +
          </button>
        </div>
      </div>

      <PromptDialog
        open={!!editing}
        title="Ubah Item Checklist"
        defaultValue={editing?.item || ""}
        onCancel={() => setEditing(null)}
        onSubmit={(val) => {
          if (editing) editChecklistItem(editing.cat, editing.item, val, editing.isCustom);
          setEditing(null);
        }}
      />
    </div>
  );
}
