"use client";

import { useState } from "react";
import { speakText } from "../utils/webSpeech";

interface PresentationSlide {
  title: string;
  icon: string;
  points: string[];
  impact: string;
  tag: string;
}

const PITCH_SLIDES: PresentationSlide[] = [
  {
    title: "1. The Accessibility Crisis",
    icon: "🌍",
    points: [
      "1.3 billion people globally live with a significant disability — yet most public spaces remain inaccessible.",
      "GPS fails indoors. Accessibility maps are static, incomplete, and rarely updated in real-time.",
      "No existing tool provides live hazard warnings, voice-guided routing, AND printed compliance audits."
    ],
    impact: "GuidePilot directly addresses this gap for airports, hospitals, campuses & more.",
    tag: "PROBLEM"
  },
  {
    title: "2. GuidePilot AI Solution",
    icon: "🤖",
    points: [
      "Offline Spatial Intelligence: Runs 100% locally — no internet, no cloud, no data exposure.",
      "Multi-Agent Cooperation: Vision, Navigation, Risk, Emergency, RAG & Memory agents communicate instantly.",
      "Persistent Environment Memory: Revisit a space and merge new observations into the evolving SQLite map."
    ],
    impact: "Restores full traveler autonomy, safety, and independence at zero API cost.",
    tag: "SOLUTION"
  },
  {
    title: "3. 3-Layer Hybrid Knowledge Graph",
    icon: "🕸️",
    points: [
      "Layer 1 — Vision Graph: Real-time object detections mapped to absolute spatial coordinates.",
      "Layer 2 — Semantic Graph: Contextual connections (e.g. Elevator → Near Gate 4 → Step-free).",
      "Layer 3 — Accessibility Intelligence: Profile-specific route scores, risk weights & priority alerts."
    ],
    impact: "Enables explainable AI routing decisions with full score breakdown & confidence ratings.",
    tag: "INNOVATION"
  },
  {
    title: "4. Real-World Validation & Vision",
    icon: "📹",
    points: [
      "Live Webcam Mode: Feed live camera to YOLOv8 — detects stairs, vehicles, obstacles in real-time.",
      "Simulation Timeline: Demo airports, hospitals, crossings with animated frame-by-frame scanning.",
      "Hardware Auto-Tuner: Detects CPU/RAM/GPU and scales FPS, resolution, and model complexity automatically."
    ],
    impact: "Works on any hardware — from budget laptops to GPU workstations.",
    tag: "REAL WORLD"
  },
  {
    title: "5. Multilingual & Accessibility-First",
    icon: "🌐",
    points: [
      "Priority Speech Engine: CRITICAL alerts instantly interrupt lower-priority voice cues.",
      "5 Languages: English, Arabic (RTL/Cairo font), Spanish, French, German — full localization.",
      "Consulting-Grade PDF Reports: SVG charts, score breakdowns, AI reasoning paths in the user's language."
    ],
    impact: "First-class accessibility for diverse global populations from day one.",
    tag: "INCLUSION"
  },
  {
    title: "6. Competition Criteria Coverage",
    icon: "🏆",
    points: [
      "✓ Multi-Agent AI System with auto-registration dependency injection framework.",
      "✓ Offline RAG (ChromaDB / LightVector) + Persistent SQLite environment memory.",
      "✓ Digital Twin Simulation across Wheelchair, Blind, and Elderly profiles.",
      "✓ 1-Click Judge Showcase Arena with auto-narrated walkthrough and live scanning."
    ],
    impact: "All judging criteria addressed — ready for live demonstration.",
    tag: "READY"
  }
];

interface PresentationShowcaseProps {
  lang?: string;
}

const TAG_COLORS: Record<string, string> = {
  "PROBLEM":   "#EF4444",
  "SOLUTION":  "#10B981",
  "INNOVATION":"#00F0FF",
  "REAL WORLD":"#FFB800",
  "INCLUSION": "#8B5CF6",
  "READY":     "#10B981"
};

export default function PresentationShowcase({ lang = "en" }: PresentationShowcaseProps) {
  const [slideIdx, setSlideIdx] = useState<number>(0);
  const activeSlide = PITCH_SLIDES[slideIdx];
  const tagColor = TAG_COLORS[activeSlide.tag] ?? "var(--color-accent)";

  const handleSlide = (idx: number) => {
    setSlideIdx(idx);
    speakText(
      `${PITCH_SLIDES[idx].title}. ${PITCH_SLIDES[idx].points[0]}`,
      true,
      lang,
      "LOW"
    );
  };

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", color: "var(--color-accent)" }}>
          Competition Pitch Showcase
        </h2>
        <span style={{ fontSize: "11px", background: `${tagColor}22`, color: tagColor, border: `1px solid ${tagColor}`, padding: "3px 10px", borderRadius: "99px", fontWeight: "bold" }}>
          {activeSlide.tag}
        </span>
      </div>

      {/* Slide Content */}
      <div style={{ background: "#080B11", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "12px", minHeight: "200px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px" }}>{activeSlide.icon}</span>
          <strong style={{ fontSize: "15px", color: "var(--color-accent)" }}>{activeSlide.title}</strong>
        </div>
        <ul style={{ margin: "0 0 0 20px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.8" }}>
          {activeSlide.points.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
        <div style={{ fontSize: "12px", color: tagColor, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", fontWeight: "600" }}>
          💡 {activeSlide.impact}
        </div>
      </div>

      {/* Navigation dots */}
      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
        {PITCH_SLIDES.map((_, idx) => (
          <button key={idx} onClick={() => handleSlide(idx)}
            style={{ width: slideIdx === idx ? "28px" : "8px", height: "8px", borderRadius: "99px", border: "none", background: slideIdx === idx ? "var(--color-accent)" : "rgba(255,255,255,0.2)", cursor: "pointer", transition: "width 0.3s ease" }}
          />
        ))}
      </div>

      {/* Prev / Next controls */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => handleSlide((slideIdx - 1 + PITCH_SLIDES.length) % PITCH_SLIDES.length)}
          style={{ flex: 1, padding: "9px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>
          ← Prev
        </button>
        <button onClick={() => handleSlide((slideIdx + 1) % PITCH_SLIDES.length)}
          style={{ flex: 2, padding: "9px", borderRadius: "8px", background: "var(--color-accent)", color: "#000", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
          Next Slide →
        </button>
      </div>

      {/* Judge link shortcut */}
      <a href="/judge" style={{ textAlign: "center", display: "block", padding: "10px", background: "rgba(255,184,0,0.08)", borderRadius: "8px", border: "1px solid var(--color-warning)", color: "var(--color-warning)", fontWeight: "600", textDecoration: "none", fontSize: "13px" }}>
        🏆 Open Full Judge Evaluation Arena →
      </a>
    </div>
  );
}
