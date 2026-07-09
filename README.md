# Wedding Rundown Planner Pro

Aplikasi rundown pernikahan berbasis **Next.js 15 (App Router)** + **Supabase**
(Auth + Database) + **Gemini API** (server-side, kunci tidak pernah terekspos
ke browser). Setiap user punya login sendiri dan datanya privat (dilindungi
Row Level Security di Supabase).

---

## 0. Arsitektur singkat

```
Browser (Next.js client) 
   │  fetch('/api/gemini', ...)          -> tidak pernah membawa API key
   ▼
Vercel Serverless Function (app/api/gemini/route.ts)
   │  - cek session Supabase user (harus login)
   │  - baca GEMINI_API_KEY dari env server (rahasia)
   ▼
Google Gemini API

Browser (Next.js client)
   │  supabase-js (anon key - aman, dibatasi RLS)
   ▼
Supabase Postgres (tabel workspace_state & rundown_templates, RLS aktif)
```

Karena `GEMINI_API_KEY` **hanya dibaca di server** (route handler), kunci itu
tidak pernah dikirim ke browser dan tidak bisa dilihat lewat DevTools /
"View Source". Ini beda dengan versi HTML lama yang menaruh kunci langsung
di JavaScript sisi klien.

---

## 1. Siapkan Supabase (Database + Auth)

1. Buka https://supabase.com → **New project**. Catat *Project URL* dan
   *anon public key* (Settings → API).
2. Buka **SQL Editor** → **New query**, salin seluruh isi file
   `supabase/schema.sql` dari project ini, lalu **Run**. Ini akan membuat:
   - tabel `workspace_state` (rundown aktif tiap user, autosave)
   - tabel `rundown_templates` (preset "Acara Tersimpan")
   - Row Level Security supaya setiap user cuma bisa baca/tulis datanya sendiri
3. Buka **Authentication → Providers**, pastikan **Email** aktif.
4. (Opsional tapi disarankan untuk tim internal) di **Authentication →
   Sign In / Providers → Email**, matikan **"Confirm email"** supaya tim WO
   bisa langsung login tanpa menunggu email verifikasi — atau biarkan aktif
   jika ingin lebih aman.
5. Di **Authentication → URL Configuration**, isi **Site URL** dengan domain
   Vercel Anda nanti (bisa diisi belakangan setelah deploy, lihat langkah 4).

## 2. Dapatkan Gemini API Key (gratis)

1. Buka https://aistudio.google.com/apikey
2. Buat API key baru (gratis, ada kuota harian).
3. **Jangan** taruh key ini di kode atau di variabel `NEXT_PUBLIC_*` —
   simpan hanya sebagai `GEMINI_API_KEY` di environment server (lihat
   langkah 4). File `.env.example` sudah menandai ini dengan jelas.

## 3. Push ke GitHub

```bash
cd wedding-planner-pro
git init
git add .
git commit -m "Initial commit - Wedding Rundown Planner Pro"
git branch -M main
git remote add origin https://github.com/USERNAME/wedding-planner-pro.git
git push -u origin main
```

> `.env.local` sudah masuk `.gitignore` — jangan pernah commit file yang
> berisi API key asli.

## 4. Deploy ke Vercel

1. Buka https://vercel.com → **Add New → Project** → import repo GitHub
   di atas.
2. Framework Preset otomatis terdeteksi **Next.js**, biarkan default.
3. Di bagian **Environment Variables**, tambahkan 3 variabel ini
   (Production **dan** Preview):

   | Name | Value | Catatan |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari Supabase | aman untuk publik, dilindungi RLS |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key dari Supabase | aman untuk publik, dilindungi RLS |
   | `GEMINI_API_KEY` | API key dari langkah 2 | **JANGAN** beri prefix `NEXT_PUBLIC_` |

4. Klik **Deploy**. Setelah selesai, Anda dapat URL seperti
   `https://wedding-planner-pro.vercel.app`.
5. Kembali ke Supabase → **Authentication → URL Configuration**, isi
   **Site URL** dengan URL Vercel tersebut supaya link reset password dsb
   mengarah ke tempat yang benar.

Selesai — setiap kali Anda `git push` ke `main`, Vercel akan build & deploy
ulang otomatis.

## 5. Coba pakai

1. Buka URL Vercel → **Daftar** akun baru (email + password).
2. Login → langsung masuk ke dashboard rundown pribadi Anda.
3. Isi detail acara, klik **"Generate dengan AI"** untuk membuat rundown
   otomatis, atau **"Muat Template"** untuk pakai template siap pakai.
4. Semua perubahan tersimpan otomatis ke Supabase (lihat indikator
   "Menyimpan perubahan…" / "Tersimpan otomatis" di header).
5. Setiap akun punya rundown & preset masing-masing — cocok dipakai
   bersama tim tanpa data bercampur.

---

## Pengembangan lokal

```bash
npm install
cp .env.example .env.local   # isi dengan kredensial Supabase + Gemini Anda
npm run dev                  # buka http://localhost:3000
```

## Struktur folder penting

```
app/
  login/              halaman masuk & daftar (Supabase Auth)
  dashboard/           halaman utama, memuat workspace user dari Supabase
  api/gemini/route.ts  proxy AI - satu-satunya tempat GEMINI_API_KEY dipakai
components/            seluruh UI (tabel rundown, timeline, checklist, modal AI)
context/
  PlannerContext.tsx    state rundown + undo/redo + autosave ke Supabase
  ToastContext.tsx      notifikasi
lib/
  templates.ts          template rundown & checklist bawaan
  exports.ts            ekspor PDF / Excel / teks WhatsApp
  types.ts               tipe data bersama
supabase/schema.sql      skema database + RLS, jalankan sekali di SQL Editor
```

## Catatan keamanan

- `GEMINI_API_KEY` hanya pernah dibaca di `app/api/gemini/route.ts`
  (kode server, dieksekusi di Vercel Functions) — tidak pernah ikut ter-bundle
  ke JavaScript yang dikirim ke browser.
- Route `/api/gemini` menolak permintaan (`401 Unauthorized`) dari siapa pun
  yang belum login ke aplikasi, jadi kuota Gemini gratis Anda tidak bisa
  dipakai sembarang orang dari luar.
- Row Level Security di Supabase memastikan user A tidak bisa membaca atau
  mengubah rundown / preset milik user B, walau menggunakan `anon key` yang
  sama (kunci publik Supabase memang didesain untuk dipakai di browser,
  keamanannya ada di RLS, bukan di kerahasiaan kuncinya).

## Yang disederhanakan dari versi HTML lama

- Mode gelap (dark mode) dihapus sementara demi satu sistem desain yang
  konsisten (tema "atelier" gading & emas). Bisa ditambahkan kembali kalau
  dibutuhkan.
- `localStorage` diganti sepenuhnya oleh Supabase (`workspace_state` untuk
  rundown aktif, `rundown_templates` untuk preset tersimpan) supaya data
  ada di cloud dan bisa diakses dari perangkat mana pun setelah login.
