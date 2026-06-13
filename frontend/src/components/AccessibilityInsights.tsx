"use client";

import { useState, useEffect } from "react";

interface Report {
  report_id: number;
  building_name: string;
  accessibility_score: number;
  grade: string;
  certification_status: string;
  report_url: string;
  recommendations: any[];
  score_breakdown?: Record<string, number>;
  confidence?: number;
  reasoning_path?: string;
}

interface AccessibilityInsightsProps {
  lang?: string;
}

const LABELS: Record<string, Record<string, string>> = {
  en: {
    title: "Accessibility Score & Audit Certificate",
    building: "Building Name",
    address: "Location Address",
    facilities: "Installed Accessibility Facilities",
    barriers: "Detected Obstacles / Barriers",
    generate: "Generate Accessibility Audit Certificate",
    generating: "Analyzing Environment...",
    grade: "GRADE",
    score: "Accessibility Rating",
    status: "Certification Status",
    confidence: "AI Confidence",
    reasoning: "AI Reasoning Path",
    breakdown: "Score Breakdown",
    open_pdf: "Open Printable Audit Certificate",
    past_reports: "Previous Audit History",
    no_reports: "No previous audits found."
  },
  ar: {
    title: "درجة إمكانية الوصول وشهادة التدقيق",
    building: "اسم المبنى",
    address: "العنوان",
    facilities: "المرافق الميسرة المثبتة",
    barriers: "العوائق والمخاطر المكتشفة",
    generate: "إنشاء شهادة التدقيق",
    generating: "جارٍ تحليل البيئة...",
    grade: "الدرجة",
    score: "تقييم إمكانية الوصول",
    status: "حالة الاعتماد",
    confidence: "دقة الذكاء الاصطناعي",
    reasoning: "مسار تحليل الذكاء الاصطناعي",
    breakdown: "توزيع الدرجات",
    open_pdf: "فتح الشهادة القابلة للطباعة",
    past_reports: "سجل التدقيق السابق",
    no_reports: "لا توجد عمليات تدقيق سابقة."
  },
  es: {
    title: "Puntuación de Accesibilidad y Certificado de Auditoría",
    building: "Nombre del Edificio",
    address: "Dirección",
    facilities: "Instalaciones de Accesibilidad",
    barriers: "Obstáculos / Barreras Detectadas",
    generate: "Generar Certificado de Auditoría",
    generating: "Analizando entorno...",
    grade: "GRADO",
    score: "Puntuación de Accesibilidad",
    status: "Estado de Certificación",
    confidence: "Confianza de IA",
    reasoning: "Ruta de Razonamiento IA",
    breakdown: "Desglose de Puntuación",
    open_pdf: "Abrir Certificado Imprimible",
    past_reports: "Historial de Auditorías",
    no_reports: "No se encontraron auditorías anteriores."
  },
  fr: {
    title: "Score d'Accessibilité & Certificat d'Audit",
    building: "Nom du Bâtiment",
    address: "Adresse",
    facilities: "Équipements d'Accessibilité",
    barriers: "Obstacles / Barrières Détectés",
    generate: "Générer le Certificat d'Audit",
    generating: "Analyse en cours...",
    grade: "GRADE",
    score: "Score d'Accessibilité",
    status: "Statut de Certification",
    confidence: "Confiance IA",
    reasoning: "Chemin de Raisonnement IA",
    breakdown: "Décomposition du Score",
    open_pdf: "Ouvrir le Certificat Imprimable",
    past_reports: "Historique des Audits",
    no_reports: "Aucun audit précédent trouvé."
  },
  de: {
    title: "Barrierefreiheitsbewertung & Auditzeugnis",
    building: "Gebäudename",
    address: "Adresse",
    facilities: "Barrierefreiheitseinrichtungen",
    barriers: "Erkannte Hindernisse / Barrieren",
    generate: "Auditzeugnis Generieren",
    generating: "Umgebung wird analysiert...",
    grade: "NOTE",
    score: "Barrierefreiheitsbewertung",
    status: "Zertifizierungsstatus",
    confidence: "KI-Konfidenz",
    reasoning: "KI-Begründungspfad",
    breakdown: "Bewertungsaufschlüsselung",
    open_pdf: "Druckbares Zertifikat Öffnen",
    past_reports: "Frühere Audit-Geschichte",
    no_reports: "Keine früheren Audits gefunden."
  }
};

const FACILITY_OPTIONS = [
  "Elevator A", "Tactile Pavement", "Entry Ramp", "Wide Doorways", "Accessible Toilet",
  "Braille Signage", "Audio Announcements", "Lowered Reception Desk"
];

const BARRIER_OPTIONS = [
  "Staircase entrance", "Narrow doors", "Construction hazard",
  "Missing handrails", "Unlit corridors", "Broken tactile tiles", "High threshold steps"
];

export default function AccessibilityInsights({ lang = "en" }: AccessibilityInsightsProps) {
  const [buildingName, setBuildingName] = useState<string>("City Library");
  const [address, setAddress] = useState<string>("101 Education Way");
  const [facilities, setFacilities] = useState<string[]>(["Elevator A", "Tactile Pavement"]);
  const [barriers, setBarriers] = useState<string[]>(["Staircase entrance"]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [pastReports, setPastReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const t = LABELS[lang] ?? LABELS["en"];

  useEffect(() => { fetchPastReports(); }, []);

  const fetchPastReports = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/reports");
      if (res.ok) setPastReports(await res.json());
    } catch (err) { console.error("Failed to load reports:", err); }
  };

  const handleAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ building_name: buildingName, location_address: address, facilities, barriers, lang })
      });
      const data = await res.json();
      setActiveReport(data);
      fetchPastReports();
    } catch (err) { console.error("Error generating report:", err); }
    finally { setLoading(false); }
  };

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "var(--color-success)" : s >= 60 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontSize: "18px", color: "var(--color-accent)" }}>{t.title}</h2>

      {/* Building inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {[
          { label: t.building, val: buildingName, set: setBuildingName },
          { label: t.address, val: address, set: setAddress }
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>{label}</label>
            <input
              type="text" value={val} onChange={e => set(e.target.value)}
              style={{ width: "100%", padding: "9px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontSize: "13px" }}
            />
          </div>
        ))}
      </div>

      {/* Facilities */}
      <div>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" }}>{t.facilities}</span>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {FACILITY_OPTIONS.map(f => (
            <button key={f} onClick={() => toggleItem(facilities, setFacilities, f)}
              style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "11px", border: "1px solid var(--border-color)", background: facilities.includes(f) ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.02)", color: facilities.includes(f) ? "var(--color-success)" : "var(--text-primary)", cursor: "pointer" }}>
              + {f}
            </button>
          ))}
        </div>
      </div>

      {/* Barriers */}
      <div>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" }}>{t.barriers}</span>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {BARRIER_OPTIONS.map(b => (
            <button key={b} onClick={() => toggleItem(barriers, setBarriers, b)}
              style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "11px", border: "1px solid var(--border-color)", background: barriers.includes(b) ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.02)", color: barriers.includes(b) ? "var(--color-danger)" : "var(--text-primary)", cursor: "pointer" }}>
              − {b}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleAudit} disabled={loading}
        style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--color-warning)", color: "#000", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
        {loading ? t.generating : t.generate}
      </button>

      {/* Active Report Result */}
      {activeReport && (
        <div style={{ background: "rgba(24,30,41,0.6)", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>{activeReport.building_name}</span>
            <span style={{ fontSize: "26px", fontWeight: "bold", color: scoreColor(activeReport.accessibility_score) }}>
              {t.grade} {activeReport.grade}
            </span>
          </div>

          {/* Score gauge bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span>{t.score}</span>
              <strong style={{ color: scoreColor(activeReport.accessibility_score) }}>
                {activeReport.accessibility_score}/100
              </strong>
            </div>
            <div className="perf-bar-track">
              <div className="perf-bar-fill" style={{ width: `${activeReport.accessibility_score}%`, background: scoreColor(activeReport.accessibility_score) }} />
            </div>
          </div>

          {/* Confidence */}
          {activeReport.confidence && (
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {t.confidence}: <strong style={{ color: "var(--color-accent)" }}>{activeReport.confidence}%</strong>
            </div>
          )}

          {/* Reasoning Path */}
          {activeReport.reasoning_path && (
            <div style={{ fontSize: "11px", background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", borderLeft: "3px solid var(--color-accent)", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--color-accent)", display: "block", marginBottom: "4px" }}>{t.reasoning}</strong>
              {activeReport.reasoning_path}
            </div>
          )}

          <div style={{ fontSize: "12px" }}>
            {t.status}: <strong style={{ color: "var(--color-success)" }}>{activeReport.certification_status}</strong>
          </div>

          <a href={`http://localhost:8000${activeReport.report_url}`} target="_blank" rel="noreferrer"
            style={{ textAlign: "center", display: "block", padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid var(--border-color)", color: "var(--color-accent)", fontWeight: "600", textDecoration: "none" }}>
            📄 {t.open_pdf}
          </a>
        </div>
      )}

      {/* Past Reports */}
      {pastReports.length > 0 && (
        <div>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase" }}>{t.past_reports}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
            {pastReports.slice(0, 3).map((r) => (
              <div key={r.report_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "12px" }}>
                <span>{r.building_name}</span>
                <span style={{ fontWeight: "bold", color: scoreColor(r.accessibility_score) }}>{r.accessibility_score}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
