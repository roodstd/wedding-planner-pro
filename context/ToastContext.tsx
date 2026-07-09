"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ToastType } from "@/lib/types";

type Toast = { id: number; msg: string; type: ToastType };
type ToastCtx = { toast: (msg: string, type?: ToastType) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slideIn flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-card ${
              t.type === "error" ? "bg-rose-500" : "bg-emerald-500"
            }`}
          >
            <span className="text-base">{t.type === "error" ? "⚠" : "✓"}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
