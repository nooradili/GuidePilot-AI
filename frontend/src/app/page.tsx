"use client";

import { useState, useEffect } from "react";
import { speakText } from "../utils/webSpeech";

// Import Panels
import StatusPanel from "../components/StatusPanel";
import LiveVision from "../components/LiveVision";
import NavigationCenter from "../components/NavigationCenter";
import AccessibilityInsights from "../components/AccessibilityInsights";
import TravelAssistant from "../components/TravelAssistant";
import MemoryCenter from "../components/MemoryCenter";
import MobilityCoach from "../components/MobilityCoach";
import KnowledgeGraph from "../components/KnowledgeGraph";
import DigitalTwin from "../components/DigitalTwin";
import InteractiveArchitecture from "../components/InteractiveArchitecture";
import PresentationShowcase from "../components/PresentationShowcase";

const LANG_FLAGS: { code: string; flag: string; label: string }[] = [
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "ar", flag: "🇦🇪", label: "عربي" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "de", flag: "🇩🇪", label: "DE" }
];

export default function DashboardPage() {
  // Global states
  const [lang, setLang]               = useState<string>("en");
  const [theme, setTheme]             = useState<string>("dark");
  const [textSize, setTextSize]       = useState<number>(100);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [profile, setProfile]         = useState<string>("WHEELCHAIR");

  const [activeScenario, setActiveScenario] = useState<string>("Airport Corridor");
  const [activeEnv, setActiveEnv]           = useState<string>("Airport Terminal");

  // Apply contrast theme & RTL direction
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // Emergency panic button
  const triggerPanic = () => {
    const msgs: Record<string, string> = {
      en: "ALERT! Emergency assistance requested. GuidePilot is sharing your coordinates with the assistance team.",
      ar: "تنبيه! طلب مساعدة طارئة. GuidePilot يشارك إحداثياتك مع فريق الإسعاف.",
      es: "ALERTA! Asistencia de emergencia solicitada. GuidePilot comparte sus coordenadas.",
      fr: "ALERTE! Assistance d'urgence demandée. GuidePilot partage vos coordonnées.",
      de: "ALARM! Notfallhilfe angefordert. GuidePilot teilt Ihre Koordinaten."
    };
    const message = msgs[lang] ?? msgs["en"];
    speakText(message, true, lang, "CRITICAL");
    alert(message);
  };

  const textStyleMultiplier = { fontSize: `${16 * (textSize / 100)}px` };

  return (
    <main style={{ ...textStyleMultiplier, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Premium Header */}
      <header style={{
        padding: "18px 24px",
        background: "rgba(24, 30, 41, 0.4)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "1px" }}>
            <span className="text-gradient">GuidePilot AI</span>{" "}
            {lang === "ar" ? "لوحة التحكم" : lang === "es" ? "Panel de Control" : lang === "fr" ? "Tableau de Bord" : lang === "de" ? "Dashboard" : "Dashboard"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {lang === "ar"
              ? "مساعد الوصول والتنقل الذكي دون اتصال"
              : lang === "es" ? "Asistente de Accesibilidad y Movilidad sin Conexión"
              : lang === "fr" ? "Assistant d'Accessibilité et Mobilité Hors Ligne"
              : lang === "de" ? "Offline Barrierefreiheits- & Mobilitätsassistent"
              : "Offline Accessibility & Mobility Intelligence Assistant"}
          </p>
        </div>

        {/* Global Toolbar */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>

          {/* Language Switcher */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            {LANG_FLAGS.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{ padding: "5px 10px", borderRadius: "6px", border: "none", background: lang === l.code ? "var(--color-accent)" : "transparent", color: lang === l.code ? "#000" : "#FFF", fontWeight: "bold", fontSize: "11px", cursor: "pointer", display: "flex", gap: "5px", alignItems: "center" }}>
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>

          {/* Voice Toggle */}
          <button onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{ padding: "8px 14px", borderRadius: "8px", background: voiceEnabled ? "var(--color-success)" : "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: voiceEnabled ? "#000" : "var(--text-primary)", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
            🔊 {voiceEnabled ? "ON" : "MUTED"}
          </button>

          {/* High Contrast Toggle */}
          <button onClick={() => setTheme(theme === "high-contrast" ? "dark" : "high-contrast")}
            style={{ padding: "8px 14px", borderRadius: "8px", background: theme === "high-contrast" ? "var(--color-warning)" : "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: theme === "high-contrast" ? "#000" : "var(--text-primary)", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
            {lang === "ar" ? "تباين عالٍ" : "High Contrast"}
          </button>

          {/* Emergency */}
          <button onClick={triggerPanic}
            style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--color-danger)", border: "none", color: "#FFFFFF", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
            🚨 {lang === "ar" ? "طوارئ" : lang === "es" ? "EMERGENCIA" : lang === "fr" ? "URGENCE" : lang === "de" ? "NOTFALL" : "EMERGENCY"}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">

        {/* Row 1: System Status */}
        <StatusPanel lang={lang} />

        {/* Row 2: Live Vision + Navigation */}
        <LiveVision
          voiceEnabled={voiceEnabled}
          profile={profile}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
        />
        <NavigationCenter
          voiceEnabled={voiceEnabled}
          profile={profile}
          activeEnv={activeEnv}
          setActiveEnv={setActiveEnv}
        />

        {/* Row 3: Knowledge Graph + Digital Twin */}
        <KnowledgeGraph activeEnv={activeEnv} profile={profile} />
        <DigitalTwin activeEnv={activeEnv} />

        {/* Row 4: Travel RAG + Accessibility Audits */}
        <TravelAssistant />
        <AccessibilityInsights lang={lang} />

        {/* Row 5: Memory Center + Mobility Coach */}
        <MemoryCenter
          theme={theme}
          setTheme={setTheme}
          textSize={textSize}
          setTextSize={setTextSize}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
          profile={profile}
          setProfile={setProfile}
        />
        <MobilityCoach />

        {/* Row 6: Pitch Showcase + Architecture */}
        <PresentationShowcase lang={lang} />
        <InteractiveArchitecture />

      </div>

      <footer style={{ marginTop: "auto", padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)" }}>
        GuidePilot AI • {lang === "ar" ? "منصة الوصول والتنقل الذكي • نسخة الهاكاثون 2026" : "Offline Accessibility & Mobility Intelligence • Hackathon Edition 2026"}
      </footer>

    </main>
  );
}
