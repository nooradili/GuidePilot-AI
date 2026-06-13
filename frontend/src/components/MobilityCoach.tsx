"use client";

import { useEffect, useState } from "react";

interface CoachingData {
  total_distance_meters: number;
  total_risk_alerts_avoided: number;
  latest_independence_score: number;
  personalized_tips: string[];
  weekly_distances?: number[];
}

interface MobilityCoachProps {
  lang?: string;
}

const TIPS_FALLBACK = [
  "Avoid central stairs in the main atrium — take the side ramp corridor instead.",
  "Pre-check the Digital Twin simulator before visiting unfamiliar buildings.",
  "Practice navigating to Elevator B independently during low-traffic hours."
];

// Simulated weekly progress data
const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MobilityCoach({ lang = "en" }: MobilityCoachProps) {
  const [data, setData] = useState<CoachingData>({
    total_distance_meters: 180.4,
    total_risk_alerts_avoided: 4,
    latest_independence_score: 82.5,
    personalized_tips: TIPS_FALLBACK,
    weekly_distances: [120, 95, 210, 180, 145, 320, 180]
  });
  const [recording, setRecording] = useState(false);
  const [distInput,  setDistInput]  = useState("50");

  const t = {
    title:        lang === "ar" ? "مدرب التنقل الذكي" : "AI Mobility Coach & Habits",
    distance:     lang === "ar" ? "المسافة المقطوعة" : "Distance Walked",
    risks:        lang === "ar" ? "المخاطر المتجنبة" : "Risks Avoided",
    independence: lang === "ar" ? "الاستقلالية" : "Independence",
    target:       lang === "ar" ? "الهدف" : "Target",
    tips_label:   lang === "ar" ? "نصائح التدريب الشخصية" : "Personalized Coaching Advice",
    weekly:       lang === "ar" ? "التقدم الأسبوعي" : "Weekly Progress",
    record:       lang === "ar" ? "تسجيل نشاط" : "Record Activity",
    recording_ph: lang === "ar" ? "المسافة (متر)" : "Distance (metres)",
    save:         lang === "ar" ? "حفظ" : "Save"
  };

  useEffect(() => {
    const fetchCoaching = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/coaching/metrics");
        if (res.ok) {
          const fetched = await res.json();
          setData(prev => ({
            total_distance_meters:    fetched.total_distance_meters    || prev.total_distance_meters,
            total_risk_alerts_avoided: fetched.total_risk_alerts_avoided || prev.total_risk_alerts_avoided,
            latest_independence_score: fetched.latest_independence_score || prev.latest_independence_score,
            personalized_tips: fetched.personalized_tips?.length > 0 ? fetched.personalized_tips : prev.personalized_tips,
            weekly_distances: prev.weekly_distances
          }));
        }
      } catch (err) {
        console.error("Failed to load coaching data:", err);
      }
    };
    fetchCoaching();
  }, []);

  const recordActivity = async () => {
    const dist = parseFloat(distInput) || 50;
    try {
      await fetch("http://localhost:8000/api/coaching/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distance_delta: dist, risks_delta: 0, independence_score: data.latest_independence_score })
      });
      setData(prev => ({
        ...prev,
        total_distance_meters: prev.total_distance_meters + dist,
        weekly_distances: prev.weekly_distances
          ? [...prev.weekly_distances.slice(1), Math.round(dist)]
          : [Math.round(dist)]
      }));
      setRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "var(--color-success)" : s >= 60 ? "var(--color-warning)" : "var(--color-danger)";

  const maxDist = Math.max(...(data.weekly_distances ?? [1]), 1);

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", color: "var(--color-accent)" }}>{t.title}</h2>
        <button onClick={() => setRecording(!recording)}
          style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "11px", background: recording ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", color: recording ? "var(--color-success)" : "var(--text-muted)", cursor: "pointer", fontWeight: "bold" }}>
          + {t.record}
        </button>
      </div>

      {/* Record activity form */}
      {recording && (
        <div style={{ display: "flex", gap: "8px", background: "rgba(16,185,129,0.06)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>
          <input type="number" value={distInput} onChange={e => setDistInput(e.target.value)} placeholder={t.recording_ph}
            style={{ flex: 1, padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontSize: "13px" }} />
          <button onClick={recordActivity}
            style={{ padding: "8px 16px", borderRadius: "6px", background: "var(--color-success)", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
            {t.save}
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        {[
          { label: t.distance,     value: `${data.total_distance_meters.toFixed(1)}m`,  color: "var(--color-accent)" },
          { label: t.risks,        value: `${data.total_risk_alerts_avoided}`,           color: "var(--color-success)" },
          { label: t.independence, value: `${data.latest_independence_score}%`,          color: scoreColor(data.latest_independence_score) }
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", textAlign: "center", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
            <strong style={{ fontSize: "20px", color }}>{value}</strong>
          </div>
        ))}
      </div>

      {/* Independence gauge */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
          <span>{t.independence}</span>
          <span style={{ color: "var(--text-muted)" }}>{t.target}: 95%</span>
        </div>
        <div className="perf-bar-track" style={{ height: "10px" }}>
          <div className="perf-bar-fill" style={{ width: `${data.latest_independence_score}%`, background: "linear-gradient(90deg, var(--color-accent), var(--color-warning))" }} />
        </div>
      </div>

      {/* Weekly bar chart */}
      {data.weekly_distances && (
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold", marginBottom: "8px" }}>
            📊 {t.weekly}
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "70px" }}>
            {data.weekly_distances.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <div style={{ width: "100%", height: `${(d / maxDist) * 55}px`, background: i === 6 ? "var(--color-accent)" : "rgba(0,240,255,0.3)", borderRadius: "3px 3px 0 0", transition: "height 0.5s ease", minHeight: "4px" }} />
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{WEEKLY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaching Tips */}
      <div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold", marginBottom: "8px" }}>
          💡 {t.tips_label}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data.personalized_tips.map((tip, i) => (
            <div key={i} style={{ fontSize: "12px", padding: "10px 12px", borderRadius: "8px", background: "rgba(0,240,255,0.03)", borderLeft: "3px solid var(--color-accent)", color: "var(--text-muted)", lineHeight: "1.5" }}>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
