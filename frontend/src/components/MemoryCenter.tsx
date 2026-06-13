"use client";

import { useState, useEffect } from "react";

interface SavedRoute {
  route_id: number;
  origin_name: string;
  destination_name: string;
  safety_score: number;
  distance_meters: number;
  route_type: string;
  created_at: string;
}

interface MemoryCenterProps {
  theme: string;
  setTheme: (t: string) => void;
  textSize: number;
  setTextSize: (s: number) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (e: boolean) => void;
  profile: string;
  setProfile: (p: string) => void;
}

export default function MemoryCenter({ theme, setTheme, textSize, setTextSize, voiceEnabled, setVoiceEnabled, profile, setProfile }: MemoryCenterProps) {
  const [name, setName] = useState<string>("Default User");
  const [model, setModel] = useState<string>("llama3");
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchProfile();
    fetchRoutes();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/profile");
      if (res.ok) {
        const data = await res.json();
        setName(data.profile_name);
        setProfile(data.accessibility_profile);
        setVoiceEnabled(data.voice_guidance_enabled === 1);
        setModel(data.preferred_ollama_model);
        setTextSize(data.text_size_scale);
        
        const currentTheme = data.high_contrast_mode === 1 ? "high-contrast" : "dark";
        setTheme(currentTheme);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/navigation/routes");
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
      }
    } catch (err) {
      console.error("Failed to load routes:", err);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          accessibility_profile: profile,
          high_contrast_mode: theme === "high-contrast",
          text_size_scale: textSize,
          voice_guidance_enabled: voiceEnabled,
          preferred_ollama_model: model
        })
      });
      if (res.ok) {
        alert("Preferences saved successfully!");
      }
    } catch (err) {
      console.error("Error saving profile settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontSize: "20px", color: "var(--color-accent)" }}>User Preference & Memory Center</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Profile Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)", marginTop: "4px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Mobility Profile</label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)", marginTop: "4px" }}
          >
            <option value="WHEELCHAIR">Wheelchair User</option>
            <option value="BLIND">Visually Impaired (Blind)</option>
            <option value="ELDERLY">Elderly / Limited Mobility</option>
            <option value="TEMPORARY">Temporary Impairment</option>
          </select>
        </div>
      </div>

      {/* Font scale and Theme Toggles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Text Size Scale: {textSize}%
          </label>
          <input
            type="range"
            min="100"
            max="175"
            step="25"
            value={textSize}
            onChange={(e) => setTextSize(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "var(--color-accent)" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Interface Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)", marginTop: "4px" }}
          >
            <option value="dark">Obsidian Dark</option>
            <option value="light">Clinical Light</option>
            <option value="high-contrast">High-Contrast Yellow</option>
          </select>
        </div>
      </div>

      {/* Voice Checkbox */}
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
            style={{ width: "16px", height: "16px", accentColor: "var(--color-accent)" }}
          />
          Enable Screen Voice Guidance
        </label>
        <div>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "8px" }}>LLM Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ padding: "4px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            <option value="llama3">llama3 (8B)</option>
            <option value="gemma">gemma (2B)</option>
            <option value="mistral">mistral (7B)</option>
          </select>
        </div>
      </div>

      <button
        onClick={saveSettings}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          background: "var(--color-accent)",
          color: "#000000",
          border: "none",
          fontWeight: "bold",
          fontSize: "13px",
          cursor: "pointer"
        }}
      >
        {loading ? "Saving Preferences..." : "Commit Settings"}
      </button>

      {/* Saved Routes */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>Saved Routes Memory</span>
          <button onClick={fetchRoutes} style={{ fontSize: "11px", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer" }}>
            Refresh
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "110px", overflowY: "auto" }}>
          {routes.length === 0 ? (
            <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>No routes saved yet.</div>
          ) : (
            routes.map(r => (
              <div key={r.route_id} style={{ fontSize: "12px", padding: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                <span>{r.origin_name} → {r.destination_name}</span>
                <span style={{ color: "var(--text-muted)" }}>{r.distance_meters}m | Safety {r.safety_score}%</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
