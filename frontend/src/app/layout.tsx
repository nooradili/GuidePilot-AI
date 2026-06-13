import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuidePilot AI — Offline Accessibility & Mobility Assistant",
  description:
    "GuidePilot AI is a fully local, offline multi-agent accessibility assistant for visually impaired and mobility-disabled individuals. " +
    "Features real-time indoor navigation, live obstacle detection, multilingual voice guidance (English, Arabic, Spanish, French, German), " +
    "RAG travel documents, persistent environment memory, digital twin simulation, and professional accessibility audit certificates.",
  keywords: [
    "accessibility", "AI", "offline", "navigation", "visually impaired",
    "wheelchair", "YOLOv8", "multi-agent", "voice guidance", "Arabic RTL"
  ],
  authors: [{ name: "GuidePilot AI Team" }],
  openGraph: {
    title: "GuidePilot AI",
    description: "Offline Accessibility & Mobility Intelligence — Hackathon Edition 2026",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // lang & dir are set dynamically in page.tsx via document.documentElement
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080B10" />
        {/* Preconnect for Google Fonts (Outfit + Cairo for Arabic) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cairo:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
