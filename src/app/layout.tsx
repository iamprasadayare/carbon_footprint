import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { AppStateProvider } from "@/app/providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoQuest | Gamified Carbon Footprint Awareness",
  description: "Understand, track, and reduce your carbon footprint through gamified weekly missions and interactive, visual personal ecosystems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
