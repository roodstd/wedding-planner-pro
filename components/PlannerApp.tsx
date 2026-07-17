"use client";

import { useState } from "react";
import { usePlanner } from "@/context/PlannerContext";
import { useToast } from "@/context/ToastContext";
import { useGemini } from "@/lib/useGemini";
import { exportRundownPDF, exportExcelFile, buildWaText } from "@/lib/exports";

import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCards from "./StatsCards";
import EventConfigCard from "./EventConfigCard";
import RundownTable from "./RundownTable";
import TimelinePanel from "./TimelinePanel";
import ChecklistCard from "./ChecklistCard";
import LoadingOverlay from "./LoadingOverlay";

import AddRowModal from "./modals/AddRowModal";
import SaveTemplateModal from "./modals/SaveTemplateModal";
import TemplatesLibraryModal from "./modals/TemplatesLibraryModal";
import PicBriefModal from "./modals/PicBriefModal";
import SpeechModal from "./modals/SpeechModal";
import McScriptModal from "./modals/McScriptModal";
import { signOut } from "@/app/login/actions";

export default function PlannerApp() {
  const { details, rundown, setRundownFromAI } = usePlanner();
  const { toast } = useToast();
  const { loading: generatingAI, callGemini } = useGemini();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [saveTplOpen, setSaveTplOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [picOpen, setPicOpen] = useState(false);
  const [speechOpen, setSpeechOpen] = useState(false);
  const [mcOpen, setMcOpen] = useState(false);

  const handleGenerateAI = async () => {
    try {
      const text = await callGemini("rundown", {
        type: details.type || "Pernikahan Umum",
        startTime: details.startTime,
        groom: details.groom,
        bride: details.bride,
        location: details.location,
      });
      const items = JSON.parse(text);
      setRundownFromAI(items);
      toast("✨ Rundown luar biasa berhasil digenerate AI!", "success");
    } catch (e) {
      toast("Gagal mengontak AI. Coba lagi atau periksa koneksi.", "error");
    }
  };

  const handleExportPDF = async () => {
    if (!rundown.length) {
      toast("Belum ada prosesi untuk diexport", "error");
      return;
    }
    toast("Mempersiapkan PDF...", "success");
    await exportRundownPDF(details, rundown);
  };

  const handleExportExcel = async () => {
    if (!rundown.length) {
      toast("Belum ada prosesi", "error");
      return;
    }
    await exportExcelFile(details, rundown);
    toast("Excel didownload", "success");
  };

  const handleCopyWA = () => {
    if (!rundown.length) return;
    navigator.clipboard.writeText(buildWaText(details, rundown));
    toast("Teks disalin ke clipboard!", "success");
  };

  return (
    <div className="flex min-h-screen bg-parchment-50">
      <Sidebar
        groom={details.groom}
        bride={details.bride}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onOpenTemplates={() => setLibraryOpen(true)}
        onSignOut={() => signOut()}
      />

      <div className="relative flex h-screen flex-1 flex-col overflow-hidden">
        <Header onMenu={() => setMobileOpen(true)} search={search} onSearch={setSearch} />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
          <StatsCards />

          <EventConfigCard
            onGenerateAI={handleGenerateAI}
            generating={generatingAI}
            onSavePreset={() => setSaveTplOpen(true)}
          />

          <div className="flex flex-col gap-6 xl:flex-row">
            <RundownTable
              search={search}
              onOpenAdd={() => setAddOpen(true)}
              onOpenSpeech={() => setSpeechOpen(true)}
              onOpenMc={() => setMcOpen(true)}
              onOpenPicBrief={() => setPicOpen(true)}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              onCopyWA={handleCopyWA}
            />
            <TimelinePanel />
          </div>

          <ChecklistCard />

          <footer className="pb-4 pt-4 text-center text-sm font-medium text-ink-300">
            Dibuat dengan <span className="text-rose-400">♥</span> oleh Rudyahya
          </footer>
        </main>
      </div>

      <LoadingOverlay show={generatingAI} />

      <AddRowModal open={addOpen} onClose={() => setAddOpen(false)} />
      <SaveTemplateModal open={saveTplOpen} onClose={() => setSaveTplOpen(false)} onSaved={() => {}} />
      <TemplatesLibraryModal open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      <PicBriefModal open={picOpen} onClose={() => setPicOpen(false)} />
      <SpeechModal open={speechOpen} onClose={() => setSpeechOpen(false)} />
      <McScriptModal open={mcOpen} onClose={() => setMcOpen(false)} />
    </div>
  );
}
