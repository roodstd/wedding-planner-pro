"use client";

export default function LoadingOverlay({ show, label }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950/85 p-4 backdrop-blur-sm">
      <div className="mb-6 h-14 w-14 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
      <p className="mb-2 text-xl font-bold text-white">AI Sedang Memproses...</p>
      <p className="max-w-md text-center text-sm text-parchment-100/70">
        {label || "Harap tunggu sebentar, kami sedang menyiapkan hasil yang profesional dan presisi untuk Anda."}
      </p>
    </div>
  );
}
