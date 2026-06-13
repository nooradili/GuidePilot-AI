"use client";

import { useState, useEffect } from "react";
import { speakText } from "../utils/webSpeech";

interface PathStep {
  step_number: number;
  instruction: string;
  accessibility_marker: string;
  risk_level: string;
}

interface RouteData {
  origin: string;
  destination: string;
  distance_meters: number;
  safety_score: number;
  estimated_minutes: number;
  path_steps: PathStep[];
  explainability?: {
    rationale: string;
  };
}

interface NavigationCenterProps {
  voiceEnabled: boolean;
  profile: string;
  activeEnv: string;
  setActiveEnv: (env: string) => void;
}

// Available nodes mapping to prevent typos
const ENV_NODES: Record<string, { id: string; name: string }[]> = {
  "Airport Terminal": [
    { id: "Entrance", name: "Main Entrance Lobby" },
    { id: "Ticketing", name: "Ticketing Counter" },
    { id: "Security", name: "Security Checkpoint" },
    { id: "Stairs_A", name: "Stairwell (Gate access)" },
    { id: "Elevator_A", name: "Elevator A (Gate access)" },
    { id: "Gate_1", name: "Gate 1 (Wheelchair)" },
    { id: "Gate_2", name: "Gate 2" },
    { id: "Restroom_Accessible", name: "Accessible Toilet" }
  ],
  "Shopping Mall": [
    { id: "Entrance", name: "South Entrance" },
    { id: "Atrium", name: "Central Atrium" },
    { id: "Stairs_Central", name: "Central Stairs" },
    { id: "Elevator_Central", name: "Glass Elevator" },
    { id: "FoodCourt_2F", name: "Food Court (2F)" },
    { id: "Cinema_2F", name: "Cinema (2F)" },
    { id: "Restroom_Atrium", name: "Family Toilet" }
  ],
  "University Campus": [
    { id: "Gate", name: "Campus Main Gate" },
    { id: "Library", name: "Science Library" },
    { id: "Science_Hall", name: "Science Hall" },
    { id: "Ramp_Science", name: "Science Hall Side Ramp" },
    { id: "Auditorium", name: "Main Auditorium" }
  ],
  "Hospital": [
    { id: "ER_Entrance", name: "Emergency Entrance" },
    { id: "Triage", name: "Triage & Reception" },
    { id: "Ward_A", name: "Pediatric Ward A" },
    { id: "Elevator_B", name: "Elevator B (Bed)" },
    { id: "ICU_2F", name: "Intensive Care Unit" }
  ],
  "Hotel": [
    { id: "Lobby", name: "Reception Lobby" },
    { id: "Bar", name: "Lobby Bar" },
    { id: "Ramp_Bar", name: "Bar Side Ramp" },
    { id: "Elevator_Lobby", name: "Main Guest Elevator" },
    { id: "Room_305", name: "Room 305 (Accessible Suite)" }
  ]
};

export default function NavigationCenter({ voiceEnabled, profile, activeEnv, setActiveEnv }: NavigationCenterProps) {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Update defaults when active environment changes
  useEffect(() => {
    const nodes = ENV_NODES[activeEnv] || [];
    if (nodes.length >= 2) {
      setOrigin(nodes[0].id);
      setDestination(nodes[nodes.length - 1].id);
    }
    setRoute(null);
  }, [activeEnv]);

  const calculateRoute = async () => {
    if (origin === destination) {
      alert("Origin and Destination cannot be the same.");
      return;
    }
    setLoading(true);
    setSaveStatus("");
    try {
      const res = await fetch("http://localhost:8000/api/navigation/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          env_name: activeEnv,
          origin,
          destination,
          profile
        })
      });
      const data = await res.json();
      setRoute(data);
      
      // Vocalize summary route description
      if (data.path_steps && data.path_steps.length > 0) {
        speakText(`Route planned. Total distance ${data.distance_meters} meters. Safety score ${data.safety_score} percent. First step: ${data.path_steps[0].instruction}`, voiceEnabled);
      }
    } catch (err) {
      console.error("Route calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentRoute = async () => {
    if (!route) return;
    try {
      const res = await fetch("http://localhost:8000/api/navigation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_name: route.origin,
          destination_name: route.destination,
          path_coordinates: [],
          safety_score: route.safety_score,
          distance_meters: route.distance_meters,
          route_type: profile
        })
      });
      if (res.ok) {
        setSaveStatus("Route saved successfully!");
        // Update coaching metrics in backend silently
        fetch("http://localhost:8000/api/coaching/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            distance_delta: route.distance_meters,
            risks_delta: 0,
            independence_score: 85.0
          })
        });
      }
    } catch (err) {
      console.error("Error saving route:", err);
    }
  };

  const nodes = ENV_NODES[activeEnv] || [];

  return (
    <div className="premium-card" style={{ gridColumn: "span 7", display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontSize: "20px", color: "var(--color-accent)" }}>Navigation Routing Hub</h2>
      
      {/* Selection Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Environment</label>
          <select
            value={activeEnv}
            onChange={(e) => setActiveEnv(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            {Object.keys(ENV_NODES).map((env) => (
              <option key={env} value={env} style={{ background: "#181E29" }}>{env}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Start Point</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id} style={{ background: "#181E29" }}>{n.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id} style={{ background: "#181E29" }}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={calculateRoute}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          background: "var(--color-accent)",
          color: "#000000",
          border: "none",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
          transition: "var(--transition-smooth)"
        }}
      >
        {loading ? "Calculating..." : "Find Accessible Pathway"}
      </button>

      {/* Render Steps */}
      {route && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          
          {/* Route Stats */}
          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px" }}>
            <div>Distance: <strong>{route.distance_meters}m</strong></div>
            <div>Est. Time: <strong>{route.estimated_minutes} min</strong></div>
            <div style={{ color: route.safety_score >= 80 ? "var(--color-success)" : "var(--color-warning)" }}>
              Safety Rating: <strong>{route.safety_score}%</strong>
            </div>
          </div>

          {/* Navigation Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {route.path_steps.map((step) => (
              <div
                key={step.step_number}
                onClick={() => speakText(step.instruction, voiceEnabled)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ color: "var(--color-accent)", marginRight: "8px", fontWeight: "bold" }}>{step.step_number}.</span>
                  <span>{step.instruction}</span>
                </div>
                <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.1)", padding: "3px 6px", borderRadius: "4px", marginLeft: "12px" }}>
                  {step.accessibility_marker}
                </span>
              </div>
            ))}
          </div>

          {/* AI Reasoning Block */}
          {route.explainability && (
            <div style={{ padding: "12px", background: "rgba(255,184,0,0.05)", borderLeft: "4px solid var(--color-warning)", borderRadius: "4px", fontSize: "13px" }}>
              <span style={{ fontWeight: "bold", display: "block", color: "var(--color-warning)" }}>AI Reasoning Explainability:</span>
              <p style={{ marginTop: "4px" }}>{route.explainability.rationale}</p>
            </div>
          )}

          {/* Save Button */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={saveCurrentRoute}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Save Route to Memory
            </button>
            {saveStatus && <span style={{ color: "var(--color-success)", fontSize: "13px" }}>{saveStatus}</span>}
          </div>

        </div>
      )}
    </div>
  );
}
