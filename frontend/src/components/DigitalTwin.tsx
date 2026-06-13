"use client";

import { useState } from "react";

interface Bottleneck {
  location: string;
  severity: string;
  desc: string;
}

interface SimResult {
  profile: string;
  score: number;
  compatibility_percentage: number;
  status: string;
  bottlenecks: Bottleneck[];
  improvements: string[];
  traversal_time_minutes?: number;
}

interface DigitalTwinProps {
  activeEnv: string;
  lang?: string;
}

const PROFILE_META: Record<string, { icon: string; color: string; label: string }> = {
  WHEELCHAIR: { icon: "♿", color: "#00F0FF",  label: "Wheelchair" },
  BLIND:      { icon: "👁️", color: "#FFB800",  label: "Visual Impairment" },
  ELDERLY:    { icon: "🧓", color: "#10B981",  label: "Elderly / Limited Mobility" }
};

export default function DigitalTwin({ activeEnv, lang = "en" }: DigitalTwinProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(["WHEELCHAIR", "BLIND", "ELDERLY"]);
  const [simResults,       setSimResults]       = useState<SimResult[] | null>(null);
  const [loading,          setLoading]          = useState<boolean>(false);
  const [activeProfile,    setActiveProfile]    = useState<string | null>(null);

  const t = {
    title:      lang === "ar" ? "محاكاة التوأم الرقمي للوصول" : "Accessibility Digital Twin Simulator",
    run:        lang === "ar" ? "تشغيل المحاكاة الرقمية" : "Run Digital Traversal Simulation",
    running:    lang === "ar" ? "جارٍ المحاكاة..." : "Simulating Walkthrough...",
    score:      lang === "ar" ? "تقييم التوافق" : "Compatibility Score",
    bottleneck: lang === "ar" ? "عوائق الوصول" : "Accessibility Bottlenecks",
    improve:    lang === "ar" ? "التحسينات المقترحة" : "Suggested Improvements",
    engine:     lang === "ar" ? "محرك الوصول" : "Walkthrough Engine"
  };

  const runSimulation = async () => {
    setLoading(true);
    setSimResults(null);
    try {
      const res = await fetch("http://localhost:8000/api/twin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ env_name: activeEnv, sim_profiles: selectedProfiles })
      });
      const data = await res.json();
      // Support both list and dict response formats
      const results: SimResult[] = Array.isArray(data)
        ? data
        : (data.simulation_results ?? Object.entries(data).map(([k, v]: any) => ({ profile: k, ...v })));
      setSimResults(results);
      if (results.length > 0) setActiveProfile(results[0].profile);
    } catch (err) {
      console.error("Twin simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProfile = (p: string) => {
    setSelectedProfiles(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "var(--color-success)" : s >= 55 ? "var(--color-warning)" : "var(--color-danger)";

  const activeResult = simResults?.find(r => r.profile === activeProfile) ?? simResults?.[0];

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", color: "var(--color-accent)" }}>{t.title}</h2>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: "6px" }}>
          {activeEnv} · {t.engine}
        </span>
      </div>

      {/* Profile toggles */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {Object.entries(PROFILE_META).map(([key, meta]) => (
          <button key={key} onClick={() => toggleProfile(key)}
            style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", border: `1px solid ${selectedProfiles.includes(key) ? meta.color : "var(--border-color)"}`, background: selectedProfiles.includes(key) ? `${meta.color}18` : "rgba(255,255,255,0.02)", color: selectedProfiles.includes(key) ? meta.color : "var(--text-muted)", cursor: "pointer", fontWeight: "600", display: "flex", gap: "6px", alignItems: "center" }}>
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
          </button>
        ))}
      </div>

      <button onClick={runSimulation} disabled={loading || selectedProfiles.length === 0}
        style={{ width: "100%", padding: "11px", borderRadius: "8px", background: "var(--color-accent)", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "13px", opacity: loading ? 0.7 : 1 }}>
        {loading ? t.running : t.run}
      </button>

      {/* Blueprint SVG with traversal overlays */}
      <div style={{ position: "relative", width: "100%", height: "160px", background: "#050810", borderRadius: "10px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
        <svg width="100%" height="100%">
          {/* Room outlines */}
          <rect x="15" y="15" width="130" height="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" rx="3"/>
          <text x="22" y="30" fill="rgba(255,255,255,0.2)" fontSize="9">Lobby</text>

          <rect x="165" y="15" width="160" height="95" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" rx="3"/>
          <text x="172" y="30" fill="rgba(255,255,255,0.2)" fontSize="9">Primary Hall</text>

          <rect x="15" y="95" width="90" height="55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" rx="3"/>
          <text x="22" y="110" fill="rgba(255,255,255,0.2)" fontSize="9">Restrooms</text>

          <rect x="345" y="50" width="80" height="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" rx="3"/>
          <text x="352" y="65" fill="rgba(255,255,255,0.2)" fontSize="9">Exit / Gate</text>

          {/* Corridors */}
          <rect x="145" y="38" width="20" height="16" fill="rgba(255,255,255,0.03)"/>
          <rect x="145" y="100" width="20" height="16" fill="rgba(255,255,255,0.03)"/>
          <rect x="325" y="70" width="20" height="16" fill="rgba(255,255,255,0.03)"/>

          {/* Accessibility highlights when sim ran */}
          {simResults && (
            <>
              {/* Elevator green dot */}
              <circle cx="155" cy="46" r="6" fill="#10B981" opacity="0.9">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
              </circle>
              <text x="163" y="50" fill="#10B981" fontSize="8">Elevator</text>

              {/* Stairs red dot (wheelchair hazard) */}
              {selectedProfiles.includes("WHEELCHAIR") && (
                <>
                  <circle cx="155" cy="108" r="6" fill="#EF4444" opacity="0.9">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                  </circle>
                  <text x="163" y="112" fill="#EF4444" fontSize="8">Stairs ⚠</text>
                </>
              )}

              {/* Traversal path line */}
              <polyline points="80,45 145,46 165,80 325,80 345,80" fill="none"
                stroke={selectedProfiles.includes("WHEELCHAIR") ? "#00F0FF" : "#10B981"}
                strokeWidth="2" strokeDasharray="6,3" opacity="0.6"/>
            </>
          )}
        </svg>
      </div>

      {/* Results: profile tab selector + detail panel */}
      {simResults && simResults.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Profile score comparison bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {simResults.map(r => {
              const meta = PROFILE_META[r.profile] ?? { icon: "👤", color: "var(--color-accent)", label: r.profile };
              const pct  = r.compatibility_percentage ?? r.score ?? 0;
              return (
                <div key={r.profile}
                  onClick={() => setActiveProfile(r.profile)}
                  style={{ cursor: "pointer", background: activeProfile === r.profile ? "rgba(255,255,255,0.05)" : "transparent", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${activeProfile === r.profile ? meta.color : "var(--border-color)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                    <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span>{meta.icon}</span>
                      <strong style={{ color: meta.color }}>{meta.label}</strong>
                    </span>
                    <strong style={{ color: scoreColor(pct) }}>{pct}%</strong>
                  </div>
                  <div className="perf-bar-track">
                    <div className="perf-bar-fill" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active profile detail */}
          {activeResult && (
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "14px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontWeight: "bold", color: "var(--color-accent)" }}>
                {PROFILE_META[activeResult.profile]?.icon} {t.bottleneck}
              </div>
              {activeResult.bottlenecks?.map((b, i) => (
                <div key={i} style={{ paddingLeft: "10px", borderLeft: `3px solid ${b.severity === "HIGH" ? "var(--color-danger)" : "var(--color-warning)"}`, color: "var(--text-muted)" }}>
                  <strong style={{ color: b.severity === "HIGH" ? "var(--color-danger)" : "var(--color-warning)" }}>
                    [{b.severity}]
                  </strong> {b.location}: {b.desc}
                </div>
              ))}
              {activeResult.improvements?.length > 0 && (
                <div>
                  <div style={{ fontWeight: "bold", color: "var(--color-success)", marginBottom: "5px" }}>✦ {t.improve}</div>
                  {activeResult.improvements.slice(0, 3).map((imp, i) => (
                    <div key={i} style={{ color: "var(--text-muted)", paddingLeft: "10px" }}>• {imp}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
