export type EventDetails = {
  groom: string;
  bride: string;
  date: string;
  location: string;
  mc: string;
  wo: string;
  startTime: string;
  type: string;
};

export type ProcessionItem = {
  name: string;
  dur: number;
  pic: string;
  note?: string;
  done: boolean;
  start: number;
  end: number;
};

export type ChecklistState = {
  [type: string]: {
    [category: string]: {
      [item: string]: boolean;
    };
  };
};

export type ChecklistCustom = {
  [type: string]: {
    [category: string]: string[];
  };
};

export type ChecklistCustomCategories = {
  [type: string]: string[];
};

export type WorkspaceState = {
  details: EventDetails;
  rundown: ProcessionItem[];
  checklist: ChecklistState;
  checklistCustom: ChecklistCustom;
  checklistCustomCategories: ChecklistCustomCategories;
};

export type RundownTemplate = {
  id: string;
  name: string;
  description: string | null;
  items: { name: string; dur: number; pic: string; note?: string }[];
  created_at: string;
};

export const DEFAULT_DETAILS: EventDetails = {
  groom: "",
  bride: "",
  date: "",
  location: "",
  mc: "",
  wo: "",
  startTime: "08:00",
  type: "",
};

export const DEFAULT_WORKSPACE: WorkspaceState = {
  details: DEFAULT_DETAILS,
  rundown: [],
  checklist: {},
  checklistCustom: {},
  checklistCustomCategories: {},
};

export type ToastType = "success" | "error";
export type SpeechType =
  | "Sambutan Keluarga Pria"
  | "Sambutan Keluarga Wanita"
  | "Wedding Vows Mempelai Pria"
  | "Wedding Vows Mempelai Wanita"
  | "Wedding Toast"
  | "Ucapan Syukur Orang Tua";
