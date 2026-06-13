"use client";

import { useEffect, useState, useRef } from "react";
import { speakText, SpeechPriority } from "../utils/webSpeech";

interface Detection {
  label: string;
  confidence: number;
  distance_meters: number;
  bounding_box: number[];
}

interface RiskData {
  risk_level: string;
  alerts: any[];
  summary: string;
  accessibility_score: number;
  score_breakdown: Record<string, number>;
  confidence: number;
  reasoning_path: string;
}

interface EmergencyData {
  emergency_active: boolean;
  instructions: string;
  reroute_action?: string;
}

interface PerformanceMetrics {
  vision_latency_ms: number;
  voice_latency_ms: number;
  navigation_latency_ms: number;
  total_latency_ms: number;
}

interface LiveVisionProps {
  voiceEnabled: boolean;
  profile: string;
  activeScenario: string;
  setActiveScenario: (name: string) => void;
  lang?: string;
}

const SCENARIOS = [
  { name: "Airport Corridor",  icon: "✈️" },
  { name: "Stairwell Hazard",  icon: "🪜" },
  { name: "Busy Crossing",     icon: "🚦" },
  { name: "Hospital Lobby",    icon: "🏥" }
];

export default function LiveVision({
  voiceEnabled, profile, activeScenario, setActiveScenario, lang = "en"
}: LiveVisionProps) {
  const [detections,   setDetections]   = useState<Detection[]>([]);
  const [description,  setDescription]  = useState<string>("Initializing stream...");
  const [simplified,   setSimplified]   = useState<string>("");
  const [accNotes,     setAccNotes]     = useState<string>("");
  const [risk,         setRisk]         = useState<RiskData | null>(null);
  const [emergency,    setEmergency]    = useState<EmergencyData | null>(null);
  const [perfMetrics,  setPerfMetrics]  = useState<PerformanceMetrics | null>(null);
  const [isPaused,     setIsPaused]     = useState<boolean>(false);
  const [elapsed,      setElapsed]      = useState<number>(0);

  const lastSpokenRef = useRef<string>("");
  const elapsedRef    = useRef<number>(0);

  // Tick elapsed seconds
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => {
      elapsedRef.current += 0.5;
      setElapsed(e => e + 0.5);
    }, 500);
    return () => clearInterval(t);
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) return;

    const fetchFrame = async () => {
      try {
        // Use the richer analyze-frame endpoint
        const res = await fetch("http://localhost:8000/api/vision/analyze-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frame_data: null,                    // no webcam in this panel
            env_name: activeScenario,
            elapsed_seconds: elapsedRef.current,
            profile,
            lang,
            model: null
          })
        });
        if (!res.ok) return;
        const data = await res.json();

        setDetections(data.detections          || []);
        setDescription(data.vision_description?.detailed      || "Path clear.");
        setSimplified( data.vision_description?.simplified    || "");
        setAccNotes(   data.vision_description?.accessibility_notes || "");
        setRisk(       data.risk_analysis      || null);
        setEmergency(  data.emergency_status   || null);
        setPerfMetrics(data.performance_metrics || null);

        // Priority-based voice cues
        if (data.emergency_status?.emergency_active) {
          const msg = data.emergency_status.instructions;
          if (msg !== lastSpokenRef.current) {
            speakText(msg, voiceEnabled, lang, "CRITICAL");
            lastSpokenRef.current = msg;
          }
        } else if (data.risk_analysis?.alerts?.length > 0) {
          const alert = data.risk_analysis.alerts[0];
          const msg   = alert.message;
          if (msg && msg !== lastSpokenRef.current) {
            speakText(msg, voiceEnabled, lang, alert.priority as SpeechPriority);
            lastSpokenRef.current = msg;
          }
        } else if (data.vision_description?.simplified) {
          // Periodic low-priority environment update every ~10 seconds
          if (Math.round(elapsedRef.current) % 10 === 0) {
            speakText(data.vision_description.simplified, voiceEnabled, lang, "LOW");
          }
          lastSpokenRef.current = "";
        }

      } catch (err) {
        // Fallback to legacy endpoint
        try {
          const res = await fetch(`http://localhost:8000/api/vision/scenario/${encodeURIComponent(activeScenario)}`);
          if (!res.ok) return;
          const data = await res.json();
          setDetections(data.detections || []);
          setDescription(data.descriptions?.detailed || "Path clear.");
          setRisk(data.risk || null);
          setEmergency(data.emergency || null);
        } catch (_) {}
      }
    };

    fetchFrame();
    const interval = setInterval(fetchFrame, 1500);
    return () => clearInterval(interval);
  }, [activeScenario, isPaused, voiceEnabled, profile, lang]);

  // Style helpers
  const borderStyle = emergency?.emergency_active
    ? "3px solid var(--color-danger)"
    : (risk && risk.risk_level !== "NONE" ? "2px solid var(--color-warning)" : "1px solid var(--border-color)");

  const bgFlash = emergency?.emergency_active
    ? "rgba(239, 68, 68, 0.12)"
    : (risk && risk.risk_level !== "NONE" ? "rgba(255, 184, 0, 0.06)" : "transparent");

  const scoreColor = (s: number) =>
    s >= 80 ? "var(--color-success)" : s >= 60 ? "var(--color-warning)" : "var(--color-danger)";

  const latencyColor = (ms: number) =>
    ms < 100 ? "var(--color-success)" : ms < 300 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <div className="premium-card" style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "14px", border: borderStyle, backgroundColor: bgFlash, transition: "background-color 0.5s ease, border 0.3s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", color: "var(--color-accent)" }}>
          {lang === "ar" ? "البث المرئي الحي" : lang === "es" ? "Visión Espacial en Vivo" : lang === "fr" ? "Vision Spatiale en Direct" : lang === "de" ? "Echtzeit Raumvision" : "Live Spatial Vision Feed"}
        </h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {perfMetrics && (
            <span style={{ fontSize: "10px", background: "rgba(0,0,0,0.4)", padding: "3px 8px", borderRadius: "6px", color: latencyColor(perfMetrics.total_latency_ms) }}>
              ⚡ {perfMetrics.total_latency_ms}ms
            </span>
          )}
          <span style={{ fontSize: "11px", background: isPaused ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)", color: isPaused ? "var(--color-danger)" : "var(--color-success)", padding: "3px 8px", borderRadius: "6px", fontWeight: "bold" }}>
            {isPaused ? "PAUSED" : "● LIVE"}
          </span>
        </div>
      </div>

      {/* Scenario Selector */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {SCENARIOS.map(s => (
          <button key={s.name} onClick={() => { setActiveScenario(s.name); lastSpokenRef.current = ""; elapsedRef.current = 0; }}
            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: activeScenario === s.name ? "var(--color-accent)" : "rgba(255,255,255,0.04)", color: activeScenario === s.name ? "#000" : "var(--text-primary)", fontWeight: "600", cursor: "pointer", fontSize: "11px", display: "flex", gap: "5px", alignItems: "center" }}>
            <span>{s.icon}</span><span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Camera Viewport */}
      <div style={{ position: "relative", width: "100%", height: "240px", background: "#05070A", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-color)" }}>

        {/* Perspective corridor SVG */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          {/* Ceiling & floor vanishing-point lines */}
          {[0.15, 0.3, 0.5, 0.7, 0.85].map((x, i) => (
            <line key={i} x1={`${x * 100}%`} y1="0" x2="50%" y2="50%" stroke="rgba(0,240,255,0.06)" strokeWidth="1" />
          ))}
          {[0.15, 0.3, 0.5, 0.7, 0.85].map((x, i) => (
            <line key={`b${i}`} x1={`${x * 100}%`} y1="100%" x2="50%" y2="50%" stroke="rgba(0,240,255,0.06)" strokeWidth="1" />
          ))}
          {/* Floor fill */}
          <polygon points="0,240 640,240 380,120 260,120" fill="url(#floorGrad)" />
        </svg>

        {/* Scenario label watermark */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.08)", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase" }}>
            SIMULATED · {activeScenario.toUpperCase()}
          </span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.05)", marginTop: "4px" }}>
            t = {elapsed.toFixed(1)}s
          </span>
        </div>

        {/* Bounding boxes */}
        {detections.map((det, i) => {
          const box = det.bounding_box;
          const left   = `${(box[0] / 640) * 100}%`;
          const top    = `${(box[1] / 480) * 100}%`;
          const width  = `${((box[2] - box[0]) / 640) * 100}%`;
          const height = `${((box[3] - box[1]) / 480) * 100}%`;
          const isAlert = /stair|vehicle|cone/i.test(det.label);
          const boxColor = isAlert ? "var(--color-danger)" : "var(--color-accent)";
          return (
            <div key={i} style={{ position: "absolute", left, top, width, height, border: `2px solid ${boxColor}`, boxShadow: `0 0 10px ${boxColor}55`, borderRadius: "4px", transition: "all 0.4s ease" }}>
              <span style={{ position: "absolute", top: "-20px", left: 0, background: boxColor, color: "#000", fontSize: "9px", fontWeight: "bold", padding: "2px 5px", borderRadius: "3px", whiteSpace: "nowrap" }}>
                {det.label} · {det.distance_meters}m · {Math.round(det.confidence * 100)}%
              </span>
            </div>
          );
        })}

        {/* Scan line sweep */}
        <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "rgba(0,240,255,0.3)", top: `${(elapsed * 40) % 240}px`, boxShadow: "0 0 8px rgba(0,240,255,0.5)", transition: "top 0.5s linear", pointerEvents: "none" }} />

        {/* Emergency pulsing border */}
        {emergency?.emergency_active && (
          <div style={{ position: "absolute", inset: 0, border: "6px solid var(--color-danger)", animation: "pulse-red 1s infinite", pointerEvents: "none", borderRadius: "10px" }} />
        )}
      </div>

      {/* Voice description */}
      <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px", borderLeft: "3px solid var(--color-accent)" }}>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold", marginBottom: "4px" }}>
          {lang === "ar" ? "الوصف الصوتي" : "AI Spatial Description"}
        </div>
        <p style={{ fontSize: "13px", margin: 0 }}>{description}</p>
        {accNotes && <p style={{ fontSize: "11px", color: "var(--color-accent)", margin: "6px 0 0 0" }}>{accNotes}</p>}
      </div>

      {/* Risk Score + Explainability */}
      {risk && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {lang === "ar" ? "درجة إمكانية الوصول" : "Accessibility Score"}
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {lang === "ar" ? "دقة" : "Confidence"}: <strong style={{ color: "var(--color-accent)" }}>{risk.confidence}%</strong>
              </span>
              <strong style={{ fontSize: "16px", color: scoreColor(risk.accessibility_score) }}>
                {risk.accessibility_score}/100
              </strong>
            </div>
          </div>
          <div className="perf-bar-track">
            <div className="perf-bar-fill" style={{ width: `${risk.accessibility_score}%`, background: scoreColor(risk.accessibility_score) }} />
          </div>
          {risk.reasoning_path && (
            <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
              {risk.reasoning_path}
            </p>
          )}
        </div>
      )}

      {/* Performance Metrics mini-bar */}
      {perfMetrics && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          {[
            { label: lang === "ar" ? "رؤية" : "Vision",     ms: perfMetrics.vision_latency_ms },
            { label: lang === "ar" ? "صوت" : "Voice",       ms: perfMetrics.voice_latency_ms },
            { label: lang === "ar" ? "توجيه" : "Navigate",  ms: perfMetrics.navigation_latency_ms }
          ].map(m => (
            <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", marginBottom: "2px" }}>{m.label}</div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: latencyColor(m.ms) }}>{m.ms}ms</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => setIsPaused(!isPaused)}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
          {isPaused
            ? (lang === "ar" ? "▶ استئناف" : "▶ Resume Stream")
            : (lang === "ar" ? "⏸ إيقاف مؤقت" : "⏸ Pause Stream")}
        </button>

        {risk && risk.risk_level !== "NONE" && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: risk.risk_level === "HIGH" ? "var(--color-danger)" : "var(--color-warning)", color: "#000", fontWeight: "bold", display: "flex", alignItems: "center", fontSize: "12px", gap: "5px" }}>
            ⚠ {risk.risk_level}
          </div>
        )}
      </div>
    </div>
  );
}
