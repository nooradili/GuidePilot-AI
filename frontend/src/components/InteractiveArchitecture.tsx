"use client";

import { useState, useEffect, useRef } from "react";

interface WorkflowStep {
  name: string;
  source: string;
  target: string;
  packet: string;
  desc: string;
  sourceColor?: string;
  targetColor?: string;
}

const WORKFLOW_PIPELINES: Record<string, WorkflowStep[]> = {
  "Vision & Safety": [
    {
      name: "Frame Capture",
      source: "Camera / Webcam",
      target: "Vision Agent",
      packet: "Base64 JPEG Frame",
      desc: "Raw video frame captured at hardware-tuned FPS (2–6 FPS depending on RAM/GPU). Sent as base64 to the /api/vision/analyze-frame endpoint.",
      sourceColor: "#00F0FF",
      targetColor: "#10B981"
    },
    {
      name: "Object Detection",
      source: "Vision Agent",
      target: "Risk Agent",
      packet: "Detections JSON (label, dist, bbox)",
      desc: "VisionAgent runs YOLOv8 or timeline mock to detect obstacles. Returns bounding boxes, distance estimates, and confidence scores to RiskAgent.",
      sourceColor: "#10B981",
      targetColor: "#FFB800"
    },
    {
      name: "Priority Alert",
      source: "Risk Agent",
      target: "Emergency Agent",
      packet: "Risk Alert (CRITICAL priority, score −30)",
      desc: "RiskAgent deducts weighted scores per hazard, assigns CRITICAL/HIGH/MEDIUM/LOW tags, and fires to EmergencyAgent if HIGH risk.",
      sourceColor: "#FFB800",
      targetColor: "#EF4444"
    },
    {
      name: "Voice Command",
      source: "Emergency Agent",
      target: "Priority Speech Engine",
      packet: "TTS Interrupt Command",
      desc: "EmergencyAgent cancels all queued speech and immediately vocalises the critical warning in the user's selected language.",
      sourceColor: "#EF4444",
      targetColor: "#8B5CF6"
    }
  ],
  "Route Query & RAG": [
    {
      name: "Route Input",
      source: "User Interface",
      target: "Navigation Agent",
      packet: "Route Request (origin, dest, profile)",
      desc: "User selects start and destination. Profile (WHEELCHAIR/BLIND/ELDERLY) is passed to filter forbidden link types.",
      sourceColor: "#00F0FF",
      targetColor: "#10B981"
    },
    {
      name: "Graph Pathfinder",
      source: "Navigation Agent",
      target: "Knowledge Graph",
      packet: "Dijkstra Query + Profile Constraints",
      desc: "Navigation Agent runs Dijkstra's algorithm on the hybrid 3-layer knowledge graph, skipping stairs for wheelchair profiles.",
      sourceColor: "#10B981",
      targetColor: "#FFB800"
    },
    {
      name: "RAG Context",
      source: "Travel Agent",
      target: "Ollama LLM",
      packet: "Top-3 Document Chunks + Query",
      desc: "Travel Agent retrieves semantically similar document chunks from ChromaDB/LightVector and feeds them as context to the local LLM.",
      sourceColor: "#FFB800",
      targetColor: "#8B5CF6"
    },
    {
      name: "Explainability",
      source: "Explainability Agent",
      target: "Dashboard UI",
      packet: "Rationale JSON + Confidence Score",
      desc: "Explainability Agent outputs full reasoning path showing why each segment was chosen or avoided, with a confidence percentage.",
      sourceColor: "#8B5CF6",
      targetColor: "#00F0FF"
    }
  ],
  "Persistent Memory": [
    {
      name: "Frame Detections",
      source: "Vision Service",
      target: "Visual Mapping Agent",
      packet: "Detections + elapsed_seconds",
      desc: "Each processed frame triggers the VisualMappingAgent with detections and a timestamp used to compute absolute coordinates.",
      sourceColor: "#00F0FF",
      targetColor: "#10B981"
    },
    {
      name: "Coordinate Mapping",
      source: "Visual Mapping Agent",
      target: "Hybrid Graph (3 Layers)",
      packet: "Node (x,y) + Semantic Labels",
      desc: "Detections are spatially deduplicated within a 35-unit Euclidean radius and placed into the Vision, Semantic, and Intelligence layers.",
      sourceColor: "#10B981",
      targetColor: "#FFB800"
    },
    {
      name: "SQLite Persistence",
      source: "Hybrid Graph",
      target: "SQLite Database",
      packet: "Merge Delta (new nodes + links)",
      desc: "Graph differences are merged into the environment_maps table. On revisit, prior map is loaded and new observations are integrated seamlessly.",
      sourceColor: "#FFB800",
      targetColor: "#EF4444"
    },
    {
      name: "Map Reload",
      source: "SQLite Database",
      target: "Visual Mapping Agent",
      packet: "Stored Node Map (JSON)",
      desc: "On session restart, the agent reloads previous spatial data so the user benefits from accumulated environment knowledge.",
      sourceColor: "#EF4444",
      targetColor: "#00F0FF"
    }
  ],
  "Audit & Reports": [
    {
      name: "Facility Detection",
      source: "Vision + Graph Agent",
      target: "Report Service",
      packet: "Facilities & Barriers List",
      desc: "Facilities (elevators, ramps) and barriers (stairs, narrow doors) are extracted from the active hybrid graph nodes.",
      sourceColor: "#00F0FF",
      targetColor: "#10B981"
    },
    {
      name: "Score Calculation",
      source: "Report Service",
      target: "Recommendation Agent",
      packet: "Weighted Score Breakdown",
      desc: "Base score of 75 adjusted by facility bonuses (+8 each) and barrier penalties (−12 each), producing explainable accessibility grade.",
      sourceColor: "#10B981",
      targetColor: "#FFB800"
    },
    {
      name: "AI Recommendations",
      source: "Recommendation Agent",
      target: "Report Compiler",
      packet: "Prioritized Action Plan (JSON)",
      desc: "Recommendation Agent generates ranked engineering suggestions with difficulty estimates and community impact projections.",
      sourceColor: "#FFB800",
      targetColor: "#EF4444"
    },
    {
      name: "PDF/HTML Export",
      source: "Report Compiler",
      target: "Browser / Print",
      packet: "SVG Report HTML (RTL-aware)",
      desc: "Final certificate rendered with SVG gauge charts, score breakdowns, digital twin data, and community impact — in the user's language.",
      sourceColor: "#EF4444",
      targetColor: "#8B5CF6"
    }
  ]
};

export default function InteractiveArchitecture() {
  const [pipeline, setPipeline] = useState<string>("Vision & Safety");
  const [stepIdx,  setStepIdx]  = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const autoRef = useRef<any>(null);

  const steps      = WORKFLOW_PIPELINES[pipeline] ?? [];
  const activeStep = steps[stepIdx];

  useEffect(() => {
    if (autoPlay) {
      autoRef.current = setInterval(() => {
        setStepIdx(i => (i + 1) % steps.length);
      }, 2200);
    } else {
      clearInterval(autoRef.current);
    }
    return () => clearInterval(autoRef.current);
  }, [autoPlay, steps.length]);

  const handlePipeline = (p: string) => {
    setPipeline(p);
    setStepIdx(0);
    setAutoPlay(false);
  };

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", color: "var(--color-accent)" }}>Multi-Agent Data-Flow Architecture</h2>
        <button onClick={() => setAutoPlay(!autoPlay)}
          style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "10px", border: "1px solid var(--border-color)", background: autoPlay ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", color: autoPlay ? "var(--color-success)" : "var(--text-muted)", cursor: "pointer", fontWeight: "bold" }}>
          {autoPlay ? "⏸ Pause Auto" : "▶ Auto-Play"}
        </button>
      </div>

      {/* Pipeline Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {Object.keys(WORKFLOW_PIPELINES).map(p => (
          <button key={p} onClick={() => handlePipeline(p)}
            style={{ padding: "7px 10px", borderRadius: "8px", fontSize: "11px", border: "1px solid var(--border-color)", background: pipeline === p ? "var(--color-accent)" : "rgba(255,255,255,0.03)", color: pipeline === p ? "#000" : "var(--text-primary)", fontWeight: "600", cursor: "pointer", textAlign: "left" }}>
            {p}
          </button>
        ))}
      </div>

      {/* Step progress dots */}
      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => setStepIdx(i)}
            style={{ width: stepIdx === i ? "24px" : "8px", height: "8px", borderRadius: "99px", border: "none", background: stepIdx === i ? "var(--color-accent)" : "rgba(255,255,255,0.15)", cursor: "pointer", transition: "width 0.3s ease" }} />
        ))}
      </div>

      {/* SVG Data-Flow Canvas */}
      <div style={{ background: "#050810", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "20px 16px", position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="120" viewBox="0 0 560 120">
          {/* Background grid */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line key={i} x1={i * 100} y1="0" x2={i * 100} y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}

          {/* Source node */}
          <rect x="8" y="35" width="130" height="50" rx="8"
            fill={activeStep ? `${activeStep.sourceColor}18` : "#181E29"}
            stroke={activeStep?.sourceColor ?? "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
          <text x="73" y="57" textAnchor="middle" fill={activeStep?.sourceColor ?? "#FFF"} fontSize="11" fontWeight="bold">
            {activeStep?.source ?? "Source"}
          </text>
          <text x="73" y="74" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
            {`Step ${stepIdx + 1} / ${steps.length}`}
          </text>

          {/* Animated packet line */}
          <line x1="138" y1="60" x2="422" y2="60" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

          {/* Packet label */}
          <rect x="160" y="28" width="240" height="22" rx="4" fill="rgba(255,184,0,0.12)" stroke="rgba(255,184,0,0.3)" strokeWidth="1" />
          <text x="280" y="43" textAnchor="middle" fill="#FFB800" fontSize="9" fontWeight="600">
            {activeStep ? (activeStep.packet.length > 38 ? activeStep.packet.slice(0, 38) + "…" : activeStep.packet) : ""}
          </text>

          {/* Moving dot on the line */}
          <circle r="5" fill={activeStep?.sourceColor ?? "var(--color-accent)"} opacity="0.9">
            <animateMotion dur="1.8s" repeatCount="indefinite"
              path="M138,60 L422,60" />
          </circle>

          {/* Target node */}
          <rect x="422" y="35" width="130" height="50" rx="8"
            fill={activeStep ? `${activeStep.targetColor}18` : "#181E29"}
            stroke={activeStep?.targetColor ?? "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
          <text x="487" y="57" textAnchor="middle" fill={activeStep?.targetColor ?? "#FFF"} fontSize="11" fontWeight="bold">
            {activeStep?.target ?? "Target"}
          </text>
          <text x="487" y="74" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
            {pipeline.split(" ")[0]} Pipeline
          </text>
        </svg>
      </div>

      {/* Step Description */}
      {activeStep && (
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontWeight: "bold", color: "var(--color-accent)", marginBottom: "6px", fontSize: "13px" }}>
            Step {stepIdx + 1}: {activeStep.name}
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: "1.6" }}>{activeStep.desc}</p>
        </div>
      )}

      {/* Prev / Next Controls */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setStepIdx((stepIdx - 1 + steps.length) % steps.length)}
          style={{ flex: 1, padding: "9px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>
          ← Prev Step
        </button>
        <button onClick={() => setStepIdx((stepIdx + 1) % steps.length)}
          style={{ flex: 2, padding: "9px", borderRadius: "8px", background: "var(--color-accent)", color: "#000", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
          Next Step →
        </button>
      </div>
    </div>
  );
}
