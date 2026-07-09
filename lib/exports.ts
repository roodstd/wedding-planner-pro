import type { EventDetails, ProcessionItem } from "@/lib/types";
import { fmt } from "@/lib/utils";
import { EVENT_TYPE_OPTIONS } from "@/lib/templates";

function eventTypeLabel(details: EventDetails) {
  return EVENT_TYPE_OPTIONS.find((o) => o.value === details.type)?.label;
}

async function renderPdf(html: string, filename: string) {
     const mod: any = await import("html2pdf.js");
     const html2pdf = mod.default || mod;

     // Overlay ini SENGAJA ditampilkan (bukan disembunyikan) agar browser
     // benar-benar merender pixelnya sebelum di-"foto" oleh html2canvas.
     const overlay = document.createElement("div");
     overlay.style.position = "fixed";
     overlay.style.inset = "0";
     overlay.style.zIndex = "99999";
     overlay.style.background = "#f3f4f6";
     overlay.style.overflow = "auto";
     overlay.style.display = "flex";
     overlay.style.justifyContent = "center";
     overlay.style.padding = "24px";

     const wrapper = document.createElement("div");
     wrapper.style.width = "210mm";
     wrapper.style.background = "white";
     wrapper.style.boxShadow = "0 0 20px rgba(0,0,0,0.15)";
     wrapper.innerHTML = html;

     overlay.appendChild(wrapper);
     document.body.appendChild(overlay);

     // beri browser 2 frame untuk benar-benar selesai melukis elemen ini
     await new Promise((resolve) =>
       requestAnimationFrame(() => requestAnimationFrame(resolve))
     );

     const opt = {
       margin: [12, 12, 12, 12],
       filename,
       image: { type: "jpeg", quality: 0.98 },
       html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
       pagebreak: { mode: ["avoid-all", "css", "legacy"] },
     };

     try {
       await html2pdf().set(opt).from(wrapper).save();
     } finally {
       document.body.removeChild(overlay);
     }
   }

export async function exportRundownPDF(details: EventDetails, rundown: ProcessionItem[]) {
  const total = rundown.reduce((s, r) => s + r.dur, 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const mainTitle = eventTypeLabel(details)
    ? `RUNDOWN ACARA ${eventTypeLabel(details)!.toUpperCase()}`
    : "RUNDOWN ACARA PERNIKAHAN";

  const rows = rundown
    .map(
      (r, i) => `<tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 5px;text-align:center;color:#444;">${i + 1}</td>
        <td style="padding:12px 5px;text-align:center;color:#222;font-family:monospace;font-weight:bold;">${fmt(r.start)} - ${fmt(r.end)}</td>
        <td style="padding:12px 5px;text-align:left;color:#111;font-weight:600;">${r.name}</td>
        <td style="padding:12px 5px;text-align:center;color:#666;">${r.dur}m</td>
        <td style="padding:12px 5px;text-align:left;color:#555;font-weight:bold;">${r.pic || "-"}</td>
        <td style="padding:12px 5px;text-align:left;color:#666;font-size:10px;">${r.note || "-"}</td>
        <td style="padding:12px 5px;text-align:center;"><div style="width:16px;height:16px;border:2px solid #ccc;border-radius:3px;margin:0 auto;"></div></td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="padding:10mm;font-family:'Plus Jakarta Sans',sans-serif;color:#111;box-sizing:border-box;width:210mm;">
    <div style="text-align:center;border-bottom:2px solid #BE8E3B;padding-bottom:15px;margin-bottom:20px;">
      <h1 style="margin:0;color:#8A6220;font-size:24px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">${mainTitle}</h1>
      <p style="margin:5px 0 0 0;color:#555;font-size:14px;font-weight:700;letter-spacing:1px;">${details.groom || "Mempelai Pria"} &amp; ${details.bride || "Mempelai Wanita"}</p>
    </div>
    <div style="margin-bottom:20px;background:#FBF4E6;padding:15px;border-radius:8px;border:1px solid #EBD3A0;">
      <table style="width:100%;font-size:12px;line-height:1.6;">
        <tr>
          <td style="font-weight:700;width:15%;">Mempelai</td><td style="width:35%;">: ${details.groom || "-"} &amp; ${details.bride || "-"}</td>
          <td style="font-weight:700;width:15%;">Jam Mulai</td><td style="width:35%;">: ${details.startTime || "--:--"} WIB</td>
        </tr>
        <tr>
          <td style="font-weight:700;">Tanggal</td><td>: ${details.date || "-"}</td>
          <td style="font-weight:700;">Selesai</td><td>: ${rundown.length ? fmt(rundown[rundown.length - 1].end) : "--:--"} WIB</td>
        </tr>
        <tr>
          <td style="font-weight:700;">Lokasi</td><td>: ${details.location || "-"}</td>
          <td style="font-weight:700;">Total Durasi</td><td>: ${h ? `${h} Jam ${m} Menit` : `${m} Menit`}</td>
        </tr>
        <tr><td style="font-weight:700;">Tim Inti</td><td colspan="3">: MC: ${details.mc || "-"} | WO: ${details.wo || "-"}</td></tr>
      </table>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:20px;">
      <thead>
        <tr style="background:#FBF4E6;border-bottom:2px solid #BE8E3B;">
          <th style="padding:10px 5px;color:#785522;width:5%;">No</th>
          <th style="padding:10px 5px;color:#785522;width:14%;">Waktu</th>
          <th style="padding:10px 5px;color:#785522;text-align:left;width:25%;">Aktivitas / Prosesi</th>
          <th style="padding:10px 5px;color:#785522;width:8%;">Dur.</th>
          <th style="padding:10px 5px;color:#785522;text-align:left;width:15%;">PIC</th>
          <th style="padding:10px 5px;color:#785522;text-align:left;width:25%;">Catatan</th>
          <th style="padding:10px 5px;color:#785522;width:8%;">Cek</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="border-top:1px solid #e0e0e0;padding-top:10px;font-size:9px;color:#888;display:flex;justify-content:space-between;">
      <div style="width:70%;">Catatan: Waktu bersifat estimasi. PIC harap standby 15 menit sebelum waktu dimulai.</div>
      <div style="text-align:right;width:30%;">Dicetak: ${new Date().toLocaleString("id-ID")}</div>
    </div>
  </div>`;

  await renderPdf(html, `Rundown_${details.groom || "Pria"}_${details.bride || "Wanita"}.pdf`);
}

export async function exportMcScriptPDF(details: EventDetails, content: string) {
  const mainTitle = eventTypeLabel(details) ? `NASKAH MC ${eventTypeLabel(details)!.toUpperCase()}` : "NASKAH MASTER OF CEREMONY";
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  const html = `
  <div style="padding:15mm;font-family:'Plus Jakarta Sans',sans-serif;color:#111;box-sizing:border-box;width:210mm;">
    <div style="text-align:center;border-bottom:2px solid #9333ea;padding-bottom:15px;margin-bottom:20px;">
      <h1 style="margin:0;color:#7e22ce;font-size:24px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">${mainTitle}</h1>
      <p style="margin:5px 0 0 0;color:#555;font-size:14px;font-weight:700;">${details.groom || "-"} &amp; ${details.bride || "-"}</p>
    </div>
    <div style="margin-bottom:20px;font-size:12px;color:#555;display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:10px;">
      <div><strong>Tanggal:</strong> ${details.date || "-"}</div>
      <div><strong>Lokasi:</strong> ${details.location || "-"}</div>
    </div>
    <div style="font-size:13px;line-height:1.8;color:#222;text-align:justify;">${formatted}</div>
    <div style="border-top:1px solid #e0e0e0;padding-top:10px;margin-top:30px;font-size:9px;color:#888;text-align:right;">
      Dicetak: ${new Date().toLocaleString("id-ID")}
    </div>
  </div>`;

  await renderPdf(html, `Naskah_MC_${details.groom || "Pria"}_${details.bride || "Wanita"}.pdf`);
}

export async function exportExcelFile(details: EventDetails, rundown: ProcessionItem[]) {
  const XLSX = await import("xlsx");
  const mainTitle = eventTypeLabel(details) ? `RUNDOWN ACARA ${eventTypeLabel(details)!.toUpperCase()}` : "RUNDOWN ACARA PERNIKAHAN";

  const data: (string | number)[][] = [
    [mainTitle],
    [`${details.groom || "Pria"} & ${details.bride || "Wanita"}`],
    [],
    ["Tanggal", details.date || "-"],
    ["Lokasi", details.location || "-"],
    ["Jam Mulai", details.startTime || "--:--"],
    [],
    ["No", "Waktu Mulai", "Waktu Selesai", "Durasi(m)", "Prosesi", "PIC", "Catatan", "Status"],
  ];

  rundown.forEach((r, i) => {
    data.push([i + 1, fmt(r.start), fmt(r.end), r.dur, r.name, r.pic || "-", r.note || "-", r.done ? "Selesai" : "Belum"]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws, "Rundown");
  XLSX.writeFile(wb, `Rundown_${details.groom || "Pria"}_${details.bride || "Wanita"}.xlsx`);
}

export function buildWaText(details: EventDetails, rundown: ProcessionItem[]) {
  const head = `*RUNDOWN ACARA ${details.groom || "-"} & ${details.bride || "-"}*\nLokasi: ${details.location || "-"}\n\n`;
  const body = rundown.map((r) => `*[${fmt(r.start)}-${fmt(r.end)}]* ${r.name} (${r.pic || "-"})`).join("\n");
  return head + body;
}
