"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { recalcRundown } from "@/lib/utils";
import { CHECKLIST_TEMPLATE, TEMPLATES } from "@/lib/templates";
import type {
  ChecklistCustom,
  ChecklistCustomCategories,
  ChecklistState,
  EventDetails,
  ProcessionItem,
  WorkspaceState,
} from "@/lib/types";
import { useToast } from "./ToastContext";

type Ctx = {
  details: EventDetails;
  rundown: ProcessionItem[];
  checklist: ChecklistState;
  checklistCustom: ChecklistCustom;
  checklistCustomCategories: ChecklistCustomCategories;
  saving: boolean;

  setDetail: (field: keyof EventDetails, value: string) => void;
  loadTemplateType: (type: string) => void;
  loadItems: (type: string, items: { name: string; dur: number; pic: string; note?: string }[]) => void;
  setRundownFromAI: (items: { name: string; dur: number; pic: string; note?: string }[]) => void;

  addRow: (row: { name: string; dur: number; pic: string; note?: string }) => void;
  updateRow: (idx: number, field: keyof ProcessionItem, value: any) => void;
  deleteRow: (idx: number) => void;
  duplicateRow: (idx: number) => void;
  reorderRow: (from: number, to: number) => void;

  undo: () => void;
  redo: () => void;

  toggleChecklistItem: (cat: string, item: string, checked: boolean) => void;
  addChecklistItem: (cat: string, text: string) => void;
  editChecklistItem: (cat: string, oldItem: string, newItem: string, isCustom: boolean) => void;
  deleteChecklistItem: (cat: string, item: string, isCustom: boolean) => void;
  addChecklistCategory: (name: string) => void;
  deleteChecklistCategory: (name: string) => void;
};

const PlannerCtx = createContext<Ctx | null>(null);

function initChecklistForType(checklist: ChecklistState, type: string): ChecklistState {
  if (checklist[type]) return checklist;
  const next = { ...checklist, [type]: {} as ChecklistState[string] };
  Object.keys(CHECKLIST_TEMPLATE).forEach((cat) => {
    next[type][cat] = {};
    CHECKLIST_TEMPLATE[cat].forEach((item) => {
      next[type][cat][item] = false;
    });
  });
  return next;
}

export function PlannerProvider({
  userId,
  initialWorkspace,
  children,
}: {
  userId: string;
  initialWorkspace: WorkspaceState;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();

  const [details, setDetails] = useState<EventDetails>(initialWorkspace.details);
  const [rundown, setRundownState] = useState<ProcessionItem[]>(initialWorkspace.rundown);
  const [checklist, setChecklist] = useState<ChecklistState>(initialWorkspace.checklist);
  const [checklistCustom, setChecklistCustom] = useState<ChecklistCustom>(initialWorkspace.checklistCustom);
  const [checklistCustomCategories, setChecklistCustomCategories] = useState<ChecklistCustomCategories>(
    initialWorkspace.checklistCustomCategories
  );
  const [saving, setSaving] = useState(false);

  const history = useRef<WorkspaceState[]>([]);
  const historyIdx = useRef(-1);
  const skipNextSave = useRef(false);

  const snapshot = useCallback(
    (): WorkspaceState => ({
      details,
      rundown,
      checklist,
      checklistCustom,
      checklistCustomCategories,
    }),
    [details, rundown, checklist, checklistCustom, checklistCustomCategories]
  );

  const pushHistory = useCallback(() => {
    const snap = snapshot();
    history.current = history.current.slice(0, historyIdx.current + 1);
    history.current.push(JSON.parse(JSON.stringify(snap)));
    if (history.current.length > 30) history.current.shift();
    historyIdx.current = history.current.length - 1;
  }, [snapshot]);

  const applySnapshot = (snap: WorkspaceState) => {
    setDetails(snap.details);
    setRundownState(snap.rundown);
    setChecklist(snap.checklist);
    setChecklistCustom(snap.checklistCustom);
    setChecklistCustomCategories(snap.checklistCustomCategories);
  };

  const undo = () => {
    if (historyIdx.current < 0) return;
    const snap = history.current[historyIdx.current];
    historyIdx.current -= 1;
    applySnapshot(snap);
  };
  const redo = () => {
    if (historyIdx.current >= history.current.length - 1) return;
    historyIdx.current += 1;
    applySnapshot(history.current[historyIdx.current]);
  };

  const setRundownRecalculated = (items: ProcessionItem[], startTime = details.startTime) => {
    setRundownState(recalcRundown(items, startTime));
  };

  // --- Details ---
  const setDetail = (field: keyof EventDetails, value: string) => {
    pushHistory();
    const next = { ...details, [field]: value };
    setDetails(next);
    if (field === "startTime") {
      setRundownRecalculated(rundown, value);
    }
    if (field === "type" && value) {
      setChecklist((c) => initChecklistForType(c, value));
    }
  };

  // --- Templates / AI ---
  const loadTemplateType = (type: string) => {
    if (!type) {
      toast("Pilih jenis acara di bagian konfigurasi.", "error");
      return;
    }
    if (!details.startTime) {
      toast("Silakan set jam mulai terlebih dahulu.", "error");
      return;
    }
    pushHistory();
    const tpl = TEMPLATES[type] || [];
    const items: ProcessionItem[] = tpl.map((t) => ({ ...t, note: "", done: false, start: 0, end: 0 }));
    setRundownRecalculated(items);
    setChecklist((c) => initChecklistForType(c, type));
    toast("Template dimuat dengan sukses", "success");
  };

  const loadItems = (
    type: string,
    items: { name: string; dur: number; pic: string; note?: string }[]
  ) => {
    if (!details.startTime) {
      toast("Silakan set jam mulai terlebih dahulu.", "error");
      return;
    }
    pushHistory();
    const rows: ProcessionItem[] = items.map((t) => ({ ...t, note: t.note || "", done: false, start: 0, end: 0 }));
    setRundownRecalculated(rows);
    setDetails((d) => ({ ...d, type: type || d.type }));
    setChecklist((c) => initChecklistForType(c, type || "custom"));
  };

  const setRundownFromAI = (items: { name: string; dur: number; pic: string; note?: string }[]) => {
    pushHistory();
    const rows: ProcessionItem[] = items.map((t) => ({ ...t, done: false, start: 0, end: 0 }));
    setRundownRecalculated(rows);
    const type = details.type || "custom";
    setDetails((d) => ({ ...d, type }));
    setChecklist((c) => initChecklistForType(c, type));
  };

  // --- Rows ---
  const addRow = (row: { name: string; dur: number; pic: string; note?: string }) => {
    pushHistory();
    const item: ProcessionItem = { ...row, done: false, start: 0, end: 0 };
    setRundownRecalculated([...rundown, item]);
  };

  const updateRow = (idx: number, field: keyof ProcessionItem, value: any) => {
    if (field === "dur" && (!value || value < 1)) {
      toast("Durasi harus diisi minimal 1", "error");
      return;
    }
    pushHistory();
    const next = rundown.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    if (field === "dur") setRundownRecalculated(next);
    else setRundownState(next);
  };

  const deleteRow = (idx: number) => {
    pushHistory();
    setRundownRecalculated(rundown.filter((_, i) => i !== idx));
  };

  const duplicateRow = (idx: number) => {
    pushHistory();
    const copy = { ...rundown[idx], done: false };
    const next = [...rundown];
    next.splice(idx + 1, 0, copy);
    setRundownRecalculated(next);
  };

  const reorderRow = (from: number, to: number) => {
    if (from === to) return;
    pushHistory();
    const next = [...rundown];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setRundownRecalculated(next);
  };

  // --- Checklist ---
  const activeType = details.type || "custom";

  const toggleChecklistItem = (cat: string, item: string, checked: boolean) => {
    setChecklist((c) => ({
      ...c,
      [activeType]: {
        ...(c[activeType] || {}),
        [cat]: { ...(c[activeType]?.[cat] || {}), [item]: checked },
      },
    }));
  };

  const addChecklistItem = (cat: string, text: string) => {
    if (!text.trim()) return;
    if (checklist[activeType]?.[cat]?.[text] !== undefined) {
      toast("Item sudah ada", "error");
      return;
    }
    setChecklistCustom((cc) => {
      const forType = { ...(cc[activeType] || {}) };
      forType[cat] = [...(forType[cat] || []), text];
      return { ...cc, [activeType]: forType };
    });
    setChecklist((c) => ({
      ...c,
      [activeType]: {
        ...(c[activeType] || {}),
        [cat]: { ...(c[activeType]?.[cat] || {}), [text]: false },
      },
    }));
  };

  const editChecklistItem = (cat: string, oldItem: string, newItem: string, isCustom: boolean) => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (trimmed !== oldItem && checklist[activeType]?.[cat]?.[trimmed] !== undefined) {
      toast("Item sudah ada", "error");
      return;
    }
    const wasChecked = checklist[activeType]?.[cat]?.[oldItem] || false;

    setChecklist((c) => {
      const catState = { ...(c[activeType]?.[cat] || {}) };
      delete catState[oldItem];
      catState[trimmed] = wasChecked;
      return { ...c, [activeType]: { ...(c[activeType] || {}), [cat]: catState } };
    });

    setChecklistCustom((cc) => {
      const forType = { ...(cc[activeType] || {}) };
      const list = [...(forType[cat] || [])];
      if (isCustom) {
        const i = list.indexOf(oldItem);
        if (i > -1) list[i] = trimmed;
      } else {
        if (!list.includes(`__deleted__${oldItem}`)) list.push(`__deleted__${oldItem}`);
        list.push(trimmed);
      }
      forType[cat] = list;
      return { ...cc, [activeType]: forType };
    });
    toast("Item berhasil diubah", "success");
  };

  const deleteChecklistItem = (cat: string, item: string, isCustom: boolean) => {
    setChecklist((c) => {
      const catState = { ...(c[activeType]?.[cat] || {}) };
      delete catState[item];
      return { ...c, [activeType]: { ...(c[activeType] || {}), [cat]: catState } };
    });
    setChecklistCustom((cc) => {
      const forType = { ...(cc[activeType] || {}) };
      const list = [...(forType[cat] || [])];
      if (isCustom) {
        const i = list.indexOf(item);
        if (i > -1) list.splice(i, 1);
      } else if (!list.includes(`__deleted__${item}`)) {
        list.push(`__deleted__${item}`);
      }
      forType[cat] = list;
      return { ...cc, [activeType]: forType };
    });
    toast("Item dihapus", "success");
  };

  const addChecklistCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (checklist[activeType]?.[trimmed]) {
      toast("Kategori sudah ada", "error");
      return;
    }
    setChecklistCustomCategories((ccc) => ({
      ...ccc,
      [activeType]: [...(ccc[activeType] || []), trimmed],
    }));
    setChecklist((c) => ({ ...c, [activeType]: { ...(c[activeType] || {}), [trimmed]: {} } }));
    setChecklistCustom((cc) => ({ ...cc, [activeType]: { ...(cc[activeType] || {}), [trimmed]: [] } }));
    toast("Kategori ditambahkan", "success");
  };

  const deleteChecklistCategory = (name: string) => {
    setChecklistCustomCategories((ccc) => {
      const list = [...(ccc[activeType] || [])];
      const i = list.indexOf(name);
      if (i > -1) list.splice(i, 1);
      return { ...ccc, [activeType]: list };
    });
    setChecklist((c) => {
      const forType = { ...(c[activeType] || {}) };
      delete forType[name];
      return { ...c, [activeType]: forType };
    });
    setChecklistCustom((cc) => {
      const forType = { ...(cc[activeType] || {}) };
      delete forType[name];
      return { ...cc, [activeType]: forType };
    });
    toast("Kategori dihapus", "success");
  };

  // --- Autosave (debounced) ---
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const { error } = await supabase.from("workspace_state").upsert({
        user_id: userId,
        details,
        rundown,
        checklist,
        checklist_custom: checklistCustom,
        checklist_custom_categories: checklistCustomCategories,
      });
      setSaving(false);
      if (error) console.error("Autosave error:", error);
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, rundown, checklist, checklistCustom, checklistCustomCategories]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: Ctx = {
    details,
    rundown,
    checklist,
    checklistCustom,
    checklistCustomCategories,
    saving,
    setDetail,
    loadTemplateType,
    loadItems,
    setRundownFromAI,
    addRow,
    updateRow,
    deleteRow,
    duplicateRow,
    reorderRow,
    undo,
    redo,
    toggleChecklistItem,
    addChecklistItem,
    editChecklistItem,
    deleteChecklistItem,
    addChecklistCategory,
    deleteChecklistCategory,
  };

  return <PlannerCtx.Provider value={value}>{children}</PlannerCtx.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerCtx);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}
