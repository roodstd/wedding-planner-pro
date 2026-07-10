import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MODEL = "gemini-2.5-flash";

type Mode = "rundown" | "mc-script" | "pic-brief" | "speech";

function parentsLine(p: any) {
  const parts: string[] = [];
  if (p.groomFather || p.groomMother) {
    parts.push(
      `Orang tua mempelai pria: ${[p.groomFather, p.groomMother].filter(Boolean).join(" & ") || "-"}`
    );
  }
  if (p.brideFather || p.brideMother) {
    parts.push(
      `Orang tua mempelai wanita: ${[p.brideFather, p.brideMother].filter(Boolean).join(" & ") || "-"}`
    );
  }
  return parts.length ? parts.join("\n") : "";
}

function buildRundownPrompt(p: any) {
  return {
    system:
      "Kamu adalah Wedding Planner profesional. Balas HANYA dengan JSON Array, tanpa teks lain.",
    prompt: `Tolong buatkan rundown acara ${p.type || "Pernikahan Umum"} yang sangat profesional, realistis, dan detail.
Acara pernikahan antara: ${p.groom || "Mempelai Pria"} dan ${p.bride || "Mempelai Wanita"}.
Lokasi: ${p.location || "Gedung Pernikahan"}.
Dimulai tepat pukul: ${p.startTime || "08:00"}.

Hasilkan sekitar 10-15 urutan prosesi (seperti persiapan, kedatangan, pembukaan, acara inti, ramah tamah, dokumentasi, penutupan).
Tentukan durasi logis untuk masing-masing (dalam menit, misalnya 10, 15, 30, 60).
Tentukan PIC (contoh: WO, Keluarga, MC, Penghulu, Tim Dokumentasi).
Berikan catatan tambahan yang ringkas dan relevan.`,
    schema: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dur: { type: "INTEGER" },
          pic: { type: "STRING" },
          note: { type: "STRING" },
        },
        required: ["name", "dur", "pic", "note"],
      },
    },
  };
}

function buildMcScriptPrompt(p: any) {
  const parents = parentsLine(p);
  return {
    system:
      "Kamu adalah MC Profesional. Berikan output naskah langsung tanpa format markdown tebal berlebihan agar mudah disalin.",
    prompt: `Anda adalah seorang Master of Ceremony (MC) pernikahan profesional tingkat atas.
Tolong buatkan teks naskah MC (meliputi prakata, opening, transisi pengenalan acara inti, dan closing penutupan) untuk acara ${p.eventType || "Pernikahan"} antara ${p.groom || "Mempelai Pria"} & ${p.bride || "Mempelai Wanita"}.
Lokasi: ${p.location || "Lokasi Acara"}
Tanggal: ${p.date || "Hari Ini"}
${parents ? `\n${parents}\n` : ""}
Berikut adalah susunan acaranya:
${p.rundownText || "-"}

Tuliskan naskah MC yang terstruktur dengan gaya bahasa elegan, hangat, romantis, interaktif dan profesional.
${parents ? "Sebutkan nama kedua orang tua mempelai secara wajar di bagian yang relevan (misalnya saat memperkenalkan mempelai, sesi sungkeman, atau ucapan terima kasih keluarga)." : ""}
Beri panduan gaya bicara atau petunjuk panggung (seperti: [Dengan nada semangat], [Jeda sejenak], dll) untuk memudahkan MC membacanya.`,
  };
}

function buildPicBriefPrompt(p: any) {
  return {
    system:
      "Kamu adalah koordinator tim / WO profesional. Balas dengan instruksi tertulis yang rapi dan terstruktur agar mudah disalin, gunakan poin-poin/bullet.",
    prompt: `Anda adalah seorang Manajer Wedding Organizer profesional.
Buatkan lembar instruksi tugas (Briefing & Checklist) yang detail, tegas, namun profesional untuk vendor/tim: "${p.pic}".
Acara: ${p.eventType || "Acara Pernikahan"} (${p.groom || "Mempelai Pria"} & ${p.bride || "Mempelai Wanita"}).

Berikut adalah sesi yang menjadi tanggung jawab utama "${p.pic}":
${p.relevantRundown || "-"}

Ini referensi keseluruhan jadwal untuk melihat konteks acara:
${p.fullRundown || "-"}

Berikan instruksi langkah demi langkah, kapan mereka harus bersiap (standby), peralatan atau persiapan apa yang harus dipastikan, serta sikap kerja yang diharapkan di lapangan.`,
  };
}

function buildSpeechPrompt(p: any) {
  const parents = parentsLine(p);
  return {
    system:
      "Kamu adalah penulis teks pidato (speechwriter) profesional untuk acara pernikahan. Berikan draf pidato langsung tanpa basa-basi pengantar markdown tebal.",
    prompt: `Tolong tuliskan draf pidato / sambutan jenis "${p.speechType}" untuk acara ${p.eventType || "Acara Pernikahan"} antara ${p.groom || "Mempelai Pria"} dan ${p.bride || "Mempelai Wanita"} yang diadakan di ${p.location || "Lokasi Acara"}.
${parents ? `\n${parents}\n` : ""}
Gaya bahasa: Menyentuh, elegan, hangat, romantis (jika untuk mempelai), dan sopan serta berterima kasih (jika untuk keluarga/orang tua).
Sertakan sapaan kepada hadirin tamu undangan, rasa syukur, serta pesan-pesan utama yang biasa diutarakan pada momen tersebut.
${parents ? "Kalau jenis pidato ini mewakili pihak keluarga (misalnya sambutan keluarga pria/wanita atau ucapan syukur orang tua), sebutkan nama orang tua yang relevan sesuai data di atas secara alami dalam kalimat." : ""}
Buat dengan durasi pembacaan sekitar 2-3 menit.`,
  };
}

export async function POST(req: NextRequest) {
  // 1) Gate: only signed-in users of this app may trigger a Gemini call.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY belum diset di environment server." },
      { status: 500 }
    );
  }

  let body: { mode: Mode; payload: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const { mode, payload } = body;
  let built: { system: string; prompt: string; schema?: any };

  switch (mode) {
    case "rundown":
      built = buildRundownPrompt(payload);
      break;
    case "mc-script":
      built = buildMcScriptPrompt(payload);
      break;
    case "pic-brief":
      built = buildPicBriefPrompt(payload);
      break;
    case "speech":
      built = buildSpeechPrompt(payload);
      break;
    default:
      return NextResponse.json({ error: "Mode tidak dikenal" }, { status: 400 });
  }

  const generationConfig: any = {};
  if (built.schema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = built.schema;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const geminiPayload = {
    contents: [{ parts: [{ text: built.prompt }] }],
    systemInstruction: { parts: [{ text: built.system }] },
    ...(built.schema ? { generationConfig } : {}),
  };

  try {
    const delays = [1000, 2000, 4000];
    let lastErr: unknown = null;

    for (let i = 0; i <= delays.length; i++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload),
        });
        if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Respons AI kosong / format tidak sesuai");
        return NextResponse.json({ text });
      } catch (err) {
        lastErr = err;
        if (i < delays.length) await new Promise((r) => setTimeout(r, delays[i]));
      }
    }
    throw lastErr;
  } catch (err) {
    console.error("Gemini proxy error:", err);
    return NextResponse.json(
      { error: "Gagal menghubungi layanan AI. Coba lagi sebentar lagi." },
      { status: 502 }
    );
  }
}
