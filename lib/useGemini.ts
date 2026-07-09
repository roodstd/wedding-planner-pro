"use client";

import { useState } from "react";

export function useGemini() {
  const [loading, setLoading] = useState(false);

  const callGemini = async (mode: string, payload: any): Promise<string> => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghubungi AI");
      return data.text as string;
    } finally {
      setLoading(false);
    }
  };

  return { loading, callGemini };
}
