"use client";

import { useState } from "react";

interface Highlights {
  accessible_entrances: string[];
  elevator_locations: string[];
  assistance_contact: string;
}

export default function TravelAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const [filename, setFilename] = useState<string>("");

  const [query, setQuery] = useState<string>("Is there a wheelchair accessible route to Gate 12?");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<string[]>([]);
  const [loadingQA, setLoadingQA] = useState<boolean>(false);

  // Community Simulator parameters
  const [buildingType, setBuildingType] = useState<string>("Hospital");
  const [visitors, setVisitors] = useState<number>(500);
  const [barrierCount, setBarrierCount] = useState<number>(3);
  const [simResults, setSimResults] = useState<any | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/travel/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setFilename(data.filename);
      setHighlights(data.extracted_highlights);
    } catch (err) {
      console.error("Document upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoadingQA(true);
    try {
      const res = await fetch("http://localhost:8000/api/travel/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      console.error("RAG query error:", err);
    } finally {
      setLoadingQA(false);
    }
  };

  const runCommunitySimulation = () => {
    // Simulator logic formulas
    const annualHoursSaved = Math.round(visitors * 365 * 0.15 * (barrierCount * 0.5));
    const incidentsPrevented = Math.round(visitors * 365 * 0.005 * barrierCount);
    const indepImprovement = Math.round(35 - (barrierCount * 3));
    const coverageScore = Math.max(40, 100 - (barrierCount * 12));

    setSimResults({
      hours_saved: annualHoursSaved,
      incidents_prevented: incidentsPrevented,
      independence_gain: indepImprovement,
      coverage: coverageScore
    });
  };

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Travel Assistant RAG */}
      <div>
        <h2 style={{ fontSize: "20px", color: "var(--color-accent)", marginBottom: "12px" }}>Smart Travel Assistant (Offline RAG)</h2>
        
        {/* File Upload Form */}
        <form onSubmit={handleUpload} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ fontSize: "12px" }}
          />
          <button
            type="submit"
            disabled={uploading || !file}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            {uploading ? "Parsing..." : "Upload Guide"}
          </button>
        </form>

        {/* Upload summary highlights */}
        {highlights && (
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px", marginBottom: "16px" }}>
            <div style={{ color: "var(--color-success)", fontWeight: "bold", marginBottom: "6px" }}>Indexed: {filename}</div>
            <div>Accessible Entrances: <strong>{highlights.accessible_entrances.join(", ")}</strong></div>
            <div>Elevator Locations: <strong>{highlights.elevator_locations.join(", ")}</strong></div>
            <div>Assistance Contact: <strong>{highlights.assistance_contact}</strong></div>
          </div>
        )}

        {/* QA Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the layout guide..."
              style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            />
            <button
              onClick={handleQuery}
              disabled={loadingQA}
              style={{ padding: "10px 16px", borderRadius: "8px", background: "var(--color-accent)", color: "#000000", border: "none", fontWeight: "bold", cursor: "pointer" }}
            >
              {loadingQA ? "Searching..." : "Ask"}
            </button>
          </div>

          {answer && (
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid var(--color-accent)", fontSize: "14px" }}>
              <p style={{ fontWeight: "500" }}>{answer}</p>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                Source Document: <strong>{sources.join(", ") || "Ollama General Memory"}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Community Impact Simulator */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
        <h2 style={{ fontSize: "20px", color: "var(--color-accent)", marginBottom: "12px" }}>Community Social Impact Simulator</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Building Type</label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            >
              {["Hospital", "Shopping Mall", "University Campus", "Airport Terminal", "Hotel"].map(opt => (
                <option key={opt} value={opt} style={{ background: "#181E29" }}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Daily Visitors</label>
            <input
              type="number"
              value={visitors}
              onChange={(e) => setVisitors(parseInt(e.target.value) || 100)}
              style={{ width: "100%", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Active Barriers</label>
            <input
              type="number"
              value={barrierCount}
              onChange={(e) => setBarrierCount(parseInt(e.target.value) || 0)}
              style={{ width: "100%", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <button
          onClick={runCommunitySimulation}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
            marginBottom: "12px"
          }}
        >
          Project Annual Community Impact
        </button>

        {/* Render Projections */}
        {simResults && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ background: "rgba(255,184,0,0.05)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid var(--color-warning)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hours Saved Annually</div>
              <strong style={{ fontSize: "20px", color: "var(--color-warning)" }}>{simResults.hours_saved.toLocaleString()} hrs</strong>
            </div>
            <div style={{ background: "rgba(16,185,129,0.05)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid var(--color-success)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Accidents Avoided</div>
              <strong style={{ fontSize: "20px", color: "var(--color-success)" }}>{simResults.incidents_prevented.toLocaleString()}</strong>
            </div>
            <div style={{ background: "rgba(0,240,255,0.05)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid var(--color-accent)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Independence Boost</div>
              <strong style={{ fontSize: "20px", color: "var(--color-accent)" }}>+{simResults.independence_gain}%</strong>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Coverage Score</div>
              <strong style={{ fontSize: "20px" }}>{simResults.coverage}/100</strong>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
