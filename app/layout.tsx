import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wedding Rundown Planner Pro",
  description: "Susun rundown, checklist, dan naskah acara pernikahan bersama AI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="bg-parchment-50 text-ink-800 antialiased">{children}</body>
    </html>
  );
}
