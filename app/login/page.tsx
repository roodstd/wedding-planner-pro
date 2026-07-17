"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, type AuthState } from "./actions";

const initialState: AuthState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60">
      {pending ? "Memproses..." : label}
    </button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction] = useFormState(signIn, initialState);
  const [signUpState, signUpAction] = useFormState(signUp, initialState);

  const state = mode === "signin" ? signInState : signUpState;

  return (
    <div className="flex min-h-screen">
      {/* Left - signature panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink-gradient p-12 text-parchment-50 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #D2A755 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/40 font-display text-lg italic text-gold-300">
            W&amp;P
          </div>
          <span className="font-display text-lg tracking-wide">Planner Pro</span>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="font-display text-4xl italic leading-tight text-gold-200">
            “Setiap detik dalam rundown adalah janji yang dijaga.”
          </p>
          <p className="mt-6 text-sm leading-relaxed text-parchment-100/70">
            Susun rundown, checklist H-1, naskah MC, hingga pidato sambutan —
            semua dalam satu ruang kerja yang rapi, ditemani AI, dan tersimpan
            aman khusus untuk akun Anda.
          </p>
        </div>

        <div className="relative z-10 text-xs text-parchment-100/50">
          © {new Date().getFullYear()} Wedding Rundown Planner Pro
        </div>
      </div>

      {/* Right - form */}
      <div className="flex w-full flex-1 items-center justify-center bg-parchment-50 p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fadeUp">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-gradient font-display text-base italic text-gold-300">
              W&amp;P
            </div>
            <span className="font-display text-lg text-ink-900">Planner Pro</span>
          </div>

          <h1 className="font-display text-3xl text-ink-900">
            {mode === "signin" ? "Selamat datang kembali" : "Buat akun baru"}
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            {mode === "signin"
              ? "Masuk untuk melanjutkan rundown acara Anda."
              : "Data rundown Anda tersimpan privat, khusus untuk akun ini."}
          </p>

          <div className="mt-6 flex rounded-xl bg-ink-50 p-1 text-sm font-semibold">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-lg py-2 transition ${
                mode === "signin" ? "bg-white text-ink-900 shadow-soft" : "text-ink-400"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-2 transition ${
                mode === "signup" ? "bg-white text-ink-900 shadow-soft" : "text-ink-400"
              }`}
            >
              Daftar
            </button>
          </div>

          <form action={mode === "signin" ? signInAction : signUpAction} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Nama
                </label>
                <input name="name" placeholder="Nama Anda" className="field-input" />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Email
              </label>
              <input name="email" type="email" required placeholder="nama@email.com" className="field-input" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Kata Sandi
              </label>
              <input name="password" type="password" required placeholder="••••••••" className="field-input" />
            </div>

            {state?.error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5 text-sm text-rose-500">
                {state.error}
              </div>
            )}

            <SubmitButton label={mode === "signin" ? "Masuk" : "Buat Akun"} />
          </form>
        </div>
      </div>
    </div>
  );
}
