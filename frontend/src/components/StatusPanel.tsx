"use client";

import { useEffect, useState } from "react";

interface HealthData {
  status: string;
  ollama_ready: boolean;
  yolo_ready: boolean;
  database_ready: boolean;
  vector_ready: boolean;
  chromadb_loaded: boolean;
}

interface HardwareData {
  cpu_cores: number;
  total_ram_gb: number;
  gpu_available: boolean;
  recommended_model: string;
  installed_models: string[];
  recommended_fps: number;
  recommended_resolution: string;
  agent_complexity: string;
}

interface StatusPanelProps {
  lang?: string;
}

const STATUS_LABELS: Record<string, Record<string, string>> = {
  en: {
    title: "System Diagnostics & Hardware Profile",
    ollama: "Ollama LLM",
    sqlite: "SQLite DB",
    yolo: "YOLOv8",
    vector: "Vector RAG",
    ready: "READY",
    offline: "OFFLINE",
    active: "ACTIVE",
    fallback: "FALLBACK",
    initialized: "INITIALIZED",
    error: "ERROR",
    chromadb: "ChromaDB",
    lightvec: "LightVec",
    fps_label: "Target FPS",
    res_label: "Resolution",
    model_label: "Recommended Model",
    complexity: "Agent Complexity",
    cores: "CPU Cores",
    ram: "RAM"
  },
  ar: {
    title: "تشخيصات النظام وملف الأجهزة",
    ollama: "نموذج Ollama",
    sqlite: "قاعدة البيانات",
    yolo: "YOLOv8",
    vector: "RAG المتجهي",
    ready: "جاهز",
    offline: "غير متصل",
    active: "نشط",
    fallback: "احتياطي",
    initialized: "مُهيَّأ",
    error: "خطأ",
    chromadb: "ChromaDB",
    lightvec: "LightVec",
    fps_label: "معدل الإطارات",
    res_label: "الدقة",
    model_label: "النموذج الموصى به",
    complexity: "تعقيد الوكيل",
    cores: "أنوية المعالج",
    ram: "الذاكرة"
  },
  es: {
    title: "Diagnósticos del Sistema y Perfil de Hardware",
    ollama: "Ollama LLM",
    sqlite: "Base de datos SQLite",
    yolo: "YOLOv8",
    vector: "Vector RAG",
    ready: "LISTO",
    offline: "SIN CONEXIÓN",
    active: "ACTIVO",
    fallback: "RESPALDO",
    initialized: "INICIALIZADO",
    error: "ERROR",
    chromadb: "ChromaDB",
    lightvec: "LightVec",
    fps_label: "FPS Objetivo",
    res_label: "Resolución",
    model_label: "Modelo Recomendado",
    complexity: "Complejidad del Agente",
    cores: "Núcleos CPU",
    ram: "RAM"
  },
  fr: {
    title: "Diagnostics Système et Profil Matériel",
    ollama: "Ollama LLM",
    sqlite: "Base de données SQLite",
    yolo: "YOLOv8",
    vector: "RAG Vectoriel",
    ready: "PRÊT",
    offline: "HORS LIGNE",
    active: "ACTIF",
    fallback: "REPLI",
    initialized: "INITIALISÉ",
    error: "ERREUR",
    chromadb: "ChromaDB",
    lightvec: "LightVec",
    fps_label: "FPS Cible",
    res_label: "Résolution",
    model_label: "Modèle Recommandé",
    complexity: "Complexité de l'Agent",
    cores: "Cœurs CPU",
    ram: "RAM"
  },
  de: {
    title: "Systemdiagnose und Hardware-Profil",
    ollama: "Ollama LLM",
    sqlite: "SQLite DB",
    yolo: "YOLOv8",
    vector: "Vektor RAG",
    ready: "BEREIT",
    offline: "OFFLINE",
    active: "AKTIV",
    fallback: "FALLBACK",
    initialized: "INITIALISIERT",
    error: "FEHLER",
    chromadb: "ChromaDB",
    lightvec: "LightVec",
    fps_label: "Ziel-FPS",
    res_label: "Auflösung",
    model_label: "Empfohlenes Modell",
    complexity: "Agenten-Komplexität",
    cores: "CPU-Kerne",
    ram: "RAM"
  }
};

export default function StatusPanel({ lang = "en" }: StatusPanelProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [hardware, setHardware] = useState<HardwareData | null>(null);

  const t = STATUS_LABELS[lang] ?? STATUS_LABELS["en"];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const resHealth = await fetch("http://localhost:8000/api/health");
        const dataHealth = await resHealth.json();
        setHealth(dataHealth);

        const resHW = await fetch("http://localhost:8000/api/hardware/detect");
        const dataHW = await resHW.json();
        setHardware(dataHW);
      } catch (err) {
        console.error("Health check fetch error:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const dots = [
    {
      active: health?.ollama_ready,
      label: t.ollama,
      on: t.ready,
      off: t.offline
    },
    {
      active: health?.database_ready,
      label: t.sqlite,
      on: t.initialized,
      off: t.error
    },
    {
      active: health?.yolo_ready,
      label: t.yolo,
      on: `${t.active} (GPU)`,
      off: `${t.fallback} (CPU)`
    },
    {
      active: health?.vector_ready,
      label: t.vector,
      on: health?.chromadb_loaded ? t.chromadb : t.lightvec,
      off: t.error
    }
  ];

  const complexityColor =
    hardware?.agent_complexity === "FULL"
      ? "var(--color-success)"
      : hardware?.agent_complexity === "SIMPLE"
      ? "var(--color-warning)"
      : "var(--text-muted)";

  return (
    <div className="premium-card" style={{ gridColumn: "span 12" }}>
      <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "var(--color-accent)" }}>
        {t.title}
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "space-between", alignItems: "center" }}>

        {/* Diagnostics Lights */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {dots.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className={`status-dot ${d.active ? "active" : "inactive"}`} />
              <span style={{ fontSize: "13px" }}>
                {d.label}: <strong style={{ color: d.active ? "var(--color-success)" : "var(--color-danger)" }}>
                  {d.active ? d.on : d.off}
                </strong>
              </span>
            </div>
          ))}
        </div>

        {/* Hardware Specs */}
        {hardware && (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-muted)" }}>
            <div>{t.cores}: <strong style={{ color: "var(--text-primary)" }}>{hardware.cpu_cores}</strong></div>
            <div>{t.ram}: <strong style={{ color: "var(--text-primary)" }}>{hardware.total_ram_gb} GB</strong></div>
            <div>{t.fps_label}: <strong style={{ color: "var(--color-accent)" }}>{hardware.recommended_fps} FPS</strong></div>
            <div>{t.res_label}: <strong style={{ color: "var(--color-accent)" }}>{hardware.recommended_resolution}</strong></div>
            <div>{t.model_label}: <strong style={{ color: "var(--color-warning)" }}>{hardware.recommended_model}</strong></div>
            <div>{t.complexity}: <strong style={{ color: complexityColor }}>{hardware.agent_complexity}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
}
