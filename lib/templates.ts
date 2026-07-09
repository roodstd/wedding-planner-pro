export type TemplateItem = { name: string; dur: number; pic: string };

export const EVENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "akad", label: "Akad Nikah" },
  { value: "resepsi", label: "Resepsi" },
  { value: "akad_resepsi", label: "Akad & Resepsi" },
  { value: "intimate", label: "Intimate Wedding" },
  { value: "lamaran", label: "Lamaran" },
  { value: "tunangan", label: "Tunangan" },
  { value: "siraman", label: "Siraman" },
  { value: "sangjit", label: "Sangjit" },
  { value: "pengajian", label: "Pengajian" },
  { value: "midodareni", label: "Midodareni" },
  { value: "afterparty", label: "After Party" },
  { value: "custom", label: "Custom Event" },
];

export const TEMPLATES: Record<string, TemplateItem[]> = {
  lamaran: [
    { name: "Kedatangan tamu & registrasi", dur: 30, pic: "Penerima Tamu" },
    { name: "Penyambutan rombongan pria", dur: 10, pic: "MC & Keluarga" },
    { name: "Pembukaan MC", dur: 5, pic: "MC" },
    { name: "Pembacaan Ayat Suci", dur: 10, pic: "Qori" },
    { name: "Sambutan Keluarga Wanita", dur: 10, pic: "Perwakilan" },
    { name: "Penyampaian Maksud Lamaran", dur: 15, pic: "Perwakilan Pria" },
    { name: "Jawaban Lamaran", dur: 10, pic: "Keluarga Wanita" },
    { name: "Penyerahan Seserahan", dur: 15, pic: "Keluarga" },
    { name: "Tukar Cincin", dur: 10, pic: "Mempelai" },
    { name: "Doa & Ramah Tamah", dur: 45, pic: "Semua Tamu" },
  ],
  tunangan: [
    { name: "Kedatangan tamu & keluarga", dur: 30, pic: "Penerima Tamu" },
    { name: "Pembukaan oleh MC", dur: 5, pic: "MC" },
    { name: "Sambutan & Maksud Kedatangan", dur: 15, pic: "Perwakilan Pria" },
    { name: "Penerimaan & Jawaban", dur: 10, pic: "Keluarga Wanita" },
    { name: "Prosesi Tukar Cincin Tunangan", dur: 15, pic: "Mempelai" },
    { name: "Doa Penutup", dur: 10, pic: "Tokoh Agama" },
    { name: "Ramah Tamah & Foto Bersama", dur: 60, pic: "Semua" },
  ],
  akad: [
    { name: "Persiapan Venue", dur: 60, pic: "WO" },
    { name: "Kedatangan Rombongan Pria", dur: 15, pic: "LO" },
    { name: "Penyambutan", dur: 10, pic: "Keluarga" },
    { name: "Pembukaan MC", dur: 5, pic: "MC" },
    { name: "Pembacaan Al-Quran", dur: 10, pic: "Qori" },
    { name: "Ijab Qabul", dur: 20, pic: "Penghulu & Wali" },
    { name: "Penyerahan Mahar & Buku Nikah", dur: 15, pic: "Penghulu" },
    { name: "Sungkeman", dur: 15, pic: "Keluarga" },
    { name: "Sesi Foto", dur: 30, pic: "Dokumentasi" },
  ],
  resepsi: [
    { name: "Persiapan & Gladi", dur: 60, pic: "WO" },
    { name: "Registrasi Tamu", dur: 30, pic: "Penerima Tamu" },
    { name: "Grand Entrance", dur: 10, pic: "MC & Pengantin" },
    { name: "Sambutan Keluarga", dur: 15, pic: "Perwakilan" },
    { name: "Doa", dur: 5, pic: "Tokoh Agama" },
    { name: "Ramah Tamah & Makan", dur: 90, pic: "Semua" },
    { name: "Sesi Foto Berjalan", dur: 60, pic: "Dokumentasi" },
    { name: "Penutupan", dur: 10, pic: "MC" },
  ],
  akad_resepsi: [
    { name: "Persiapan & Makeup", dur: 90, pic: "WO & MUA" },
    { name: "Kedatangan Keluarga Pria", dur: 15, pic: "LO" },
    { name: "Pembukaan Akad", dur: 15, pic: "MC & Keluarga" },
    { name: "Ijab Qabul", dur: 20, pic: "Penghulu & Wali" },
    { name: "Sungkeman & Foto Akad", dur: 30, pic: "Dokumentasi" },
    { name: "Istirahat & Retouch Busana", dur: 60, pic: "Mempelai & MUA" },
    { name: "Registrasi Tamu Resepsi", dur: 30, pic: "Penerima Tamu" },
    { name: "Grand Entrance", dur: 10, pic: "MC & Pengantin" },
    { name: "Sambutan & Doa", dur: 15, pic: "Perwakilan & Tokoh Agama" },
    { name: "Ramah Tamah & Makan", dur: 90, pic: "Semua Tamu" },
    { name: "Sesi Foto Bersama", dur: 60, pic: "Dokumentasi" },
    { name: "Penutupan Acara", dur: 10, pic: "MC" },
  ],
  intimate: [
    { name: "Preparation", dur: 45, pic: "WO" },
    { name: "Welcome Drink", dur: 30, pic: "Catering" },
    { name: "Holy Matrimony / Akad", dur: 45, pic: "Pemuka Agama" },
    { name: "Wedding Toast", dur: 10, pic: "MC" },
    { name: "Mingle & Dinner", dur: 90, pic: "Semua Tamu" },
    { name: "Flashmob / First Dance", dur: 10, pic: "Pengantin" },
  ],
  custom: [],
};

export const CHECKLIST_TEMPLATE: Record<string, string[]> = {
  Administrasi: ["Dokumen N1–N4", "KTP & KK", "Buku Nikah / Catatan Sipil", "Cincin nikah", "Mahar"],
  Venue: ["Meja kursi akad/pemberkatan", "Dekorasi & Bunga", "AC / Kipas angin", "Area VIP", "Kotak Angpao"],
  Peralatan: ["Sound system utama", "Mic Wireless", "Genset", "Alat Tulis"],
  Dokumentasi: ["Fotografer standby", "Videografer", "Drone (ops)"],
  Konsumsi: ["Porsi VIP", "Prasmanan tamu", "Piring & Gelas", "Crew meal (WO/Vendor)"],
};

const CAT_COLORS: Record<string, string> = {
  akad: "#3E8C63",
  resepsi: "#BE8E3B",
  mc: "#4C6FCE",
  entertainment: "#8B5CF6",
  family: "#B15A76",
  foto: "#D2A755",
  default: "#8A8FA3",
};

export function getCatColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("akad") || n.includes("nikah") || n.includes("doa") || n.includes("ijab")) return CAT_COLORS.akad;
  if (n.includes("resepsi") || n.includes("makan") || n.includes("mingle")) return CAT_COLORS.resepsi;
  if (n.includes("mc") || n.includes("sambutan") || n.includes("opening")) return CAT_COLORS.mc;
  if (n.includes("dance") || n.includes("games") || n.includes("dj") || n.includes("toast")) return CAT_COLORS.entertainment;
  if (n.includes("keluarga") || n.includes("sungkem")) return CAT_COLORS.family;
  if (n.includes("foto") || n.includes("dokumentasi")) return CAT_COLORS.foto;
  return CAT_COLORS.default;
}
