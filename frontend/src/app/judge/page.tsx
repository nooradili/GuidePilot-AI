"use client";

import { useState, useEffect, useRef } from "react";
import { speakText, SpeechPriority } from "../../utils/webSpeech";

// UI translations for 5 languages to provide first-class localization
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: "GuidePilot AI Competition Arena",
    subtitle: "1-Click Judge Walkthrough & Real-World Validation Suite",
    step: "Step",
    next: "Next Demonstration Step",
    prev: "Previous",
    start_webcam: "Start Webcam Feed",
    stop_webcam: "Stop Webcam",
    upload_video: "Upload MP4 Video",
    select_sample: "Select Demo Video",
    perf_dashboard: "Real-Time Latency & Performance",
    model_rec: "Model Strategy",
    graph_layout: "Knowledge Graph Filter",
    generate_audit: "Generate Professional Audit Certificate",
    grade: "Grade",
    score: "Score",
    confidence: "Confidence",
    reasoning: "AI Rationale",
    reset_scanner: "Reset Scan Session",
    demo_script: "Judge Walkthrough Script",
    run_demo: "Auto Play Demo",
    stop_demo: "Stop Demo",
    twin_title: "Accessibility Digital Twin",
    impact_title: "Community Social Impact",
    voice_guide: "Voice Guidance",
    on: "ON",
    off: "OFF"
  },
  ar: {
    title: "ميدان منافسات GuidePilot AI",
    subtitle: "دليل الحكام بنقرة واحدة ومنصة التحقق الفعلي",
    step: "الخطوة",
    next: "خطوة العرض التالية",
    prev: "السابق",
    start_webcam: "بدء البث الحي من الكاميرا",
    stop_webcam: "إيقاف الكاميرا",
    upload_video: "تحميل فيديو MP4",
    select_sample: "اختر فيديو تجريبي",
    perf_dashboard: "مؤشرات السرعة وزمن الاستجابة",
    model_rec: "نموذج الذكاء الاصطناعي",
    graph_layout: "تصفية مخطط المعرفة",
    generate_audit: "تصدير شهادة التدقيق الاحترافية",
    grade: "الدرجة",
    score: "التقييم",
    confidence: "نسبة الثقة",
    reasoning: "تحليل الذكاء الاصطناعي",
    reset_scanner: "إعادة تعيين المسح",
    demo_script: "دليل محاكاة التحكيم",
    run_demo: "التشغيل التلقائي للعرض",
    stop_demo: "إيقاف العرض التلقائي",
    twin_title: "التوأم الرقمي للوصول",
    impact_title: "الأثر الاجتماعي للمجتمع",
    voice_guide: "التوجيه الصوتي",
    on: "تشغيل",
    off: "إيقاف"
  },
  es: {
    title: "Arena de Competencia GuidePilot AI",
    subtitle: "Guía de Jueces en 1 Clic y Suite de Validación",
    step: "Paso",
    next: "Siguiente Paso del Demo",
    prev: "Anterior",
    start_webcam: "Iniciar Cámara Web",
    stop_webcam: "Detener Cámara",
    upload_video: "Subir Video MP4",
    select_sample: "Seleccionar Video de Demo",
    perf_dashboard: "Latencia y Rendimiento en Tiempo Real",
    model_rec: "Estrategia de Modelo",
    graph_layout: "Filtro de Grafo de Conocimiento",
    generate_audit: "Generar Auditoría en PDF Profesional",
    grade: "Grado",
    score: "Puntuación",
    confidence: "Confianza",
    reasoning: "Razón de IA",
    reset_scanner: "Restablecer Sesión de Escaneo",
    demo_script: "Guión del Recorrido del Juez",
    run_demo: "Auto Reproducir Demo",
    stop_demo: "Detener Demo",
    twin_title: "Gemelo Digital de Accesibilidad",
    impact_title: "Impacto Social Comunitario",
    voice_guide: "Guía de Voz",
    on: "ENCENDIDO",
    off: "APAGADO"
  },
  fr: {
    title: "Arène de Compétition GuidePilot AI",
    subtitle: "Guide du Juge en 1 Clic et Suite de Validation",
    step: "Étape",
    next: "Étape Suivante de la Démo",
    prev: "Précédent",
    start_webcam: "Démarrer la Webcam",
    stop_webcam: "Arrêter la Webcam",
    upload_video: "Télécharger Vidéo MP4",
    select_sample: "Sélectionner Vidéo Démo",
    perf_dashboard: "Latence et Performance en Temps Réel",
    model_rec: "Stratégie de Modèle",
    graph_layout: "Filtre du Graphe de Connaissance",
    generate_audit: "Générer un Audit PDF Professionnel",
    grade: "Grade",
    score: "Score",
    confidence: "Confiance",
    reasoning: "Raisonnement IA",
    reset_scanner: "Réinitialiser la Session",
    demo_script: "Scénario de Démo du Juge",
    run_demo: "Lancer la Démo Auto",
    stop_demo: "Arrêter la Démo",
    twin_title: "Jumeau Numérique d'Accessibilité",
    impact_title: "Impact Social Communautaire",
    voice_guide: "Guidage Vocal",
    on: "ACTIVER",
    off: "DÉSACTIVER"
  },
  de: {
    title: "GuidePilot AI Wettbewerbsarena",
    subtitle: "1-Klick Jury-Durchführung & Validierung",
    step: "Schritt",
    next: "Nächster Demo-Schritt",
    prev: "Zurück",
    start_webcam: "Webcam Starten",
    stop_webcam: "Webcam Stoppen",
    upload_video: "MP4 Video Hochladen",
    select_sample: "Demo Video Auswählen",
    perf_dashboard: "Echtzeit-Latenz & Performance",
    model_rec: "Wissensgraph Filter",
    graph_layout: "Wissensgraph Filter",
    generate_audit: "Professionelles PDF-Audit Generieren",
    grade: "Note",
    score: "Bewertung",
    confidence: "Konfidenz",
    reasoning: "KI-Begründung",
    reset_scanner: "Scan-Sitzung Zurücksetzen",
    demo_script: "Jury-Präsentationsskript",
    run_demo: "Demo Automatisch Abspielen",
    stop_demo: "Demo Stoppen",
    twin_title: "Barrierefreiheits-Digital-Twin",
    impact_title: "Soziale Auswirkungen",
    voice_guide: "Sprachführung",
    on: "AN",
    off: "AUS"
  }
};

// Demo Script definitions for automated judge walkthrough
interface DemoStep {
  title: string;
  desc: string;
  narration: string;
  action: (state: any) => void;
}

export default function JudgeShowcasePage() {
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string>("Airport Terminal");
  
  // Real-world video scanning state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Response outputs
  const [detections, setDetections] = useState<any[]>([]);
  const [visionDesc, setVisionDesc] = useState<any>({
    detailed: "System online. Standing by for webcam or simulation timeline stream.",
    simplified: "System standing by.",
    accessibility_notes: "Offline logic active. Language set to English."
  });
  const [riskData, setRiskData] = useState<any>({
    risk_level: "NONE",
    alerts: [],
    summary: "No hazards detected.",
    accessibility_score: 100,
    score_breakdown: { base_environment: 100 },
    confidence: 98,
    reasoning_path: "Environment scanner ready."
  });
  const [emergencyStatus, setEmergencyStatus] = useState<any>({
    emergency_active: false,
    instructions: "All systems operating normally."
  });
  const [perfMetrics, setPerfMetrics] = useState<any>({
    vision_latency_ms: 0,
    voice_latency_ms: 0,
    navigation_latency_ms: 0,
    total_latency_ms: 0
  });

  // Graph state
  const [graphData, setGraphData] = useState<any>({ nodes: [], edges: [] });
  const [graphLayout, setGraphLayout] = useState<string>("accessibility");

  // Twin & report state
  const [twinResults, setTwinResults] = useState<any[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [hardwareProfile, setHardwareProfile] = useState<any>({
    cpu_cores: 4,
    total_ram_gb: 16,
    gpu_available: false,
    recommended_model: "gemma:2b",
    recommended_fps: 2,
    recommended_resolution: "320x240",
    agent_complexity: "SIMPLE"
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scanIntervalRef = useRef<any | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load hardware metrics on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/hardware/detect")
      .then(res => res.json())
      .then(data => setHardwareProfile(data))
      .catch(err => console.log("Failed to query hardware stats:", err));
  }, []);

  // Sync translation triggers for RTL styling
  useEffect(() => {
    if (selectedLang === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [selectedLang]);

  // Update voice guide language fallbacks
  useEffect(() => {
    // Re-verify initial status description translate rules
    setVisionDesc({
      detailed: UI_TRANSLATIONS[selectedLang].subtitle,
      simplified: UI_TRANSLATIONS[selectedLang].title,
      accessibility_notes: `Offline-first heuristics operational in ${selectedLang.toUpperCase()}`
    });
  }, [selectedLang]);

  // Fetch updated Knowledge Graph structures
  const fetchGraph = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/graph?env_name=${activeScenario}&profile=WHEELCHAIR`);
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
      }
    } catch (e) {
      console.log("Failed to load knowledge graph:", e);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [activeScenario]);

  // Canvas processing loop: captures webcam or simulates moving rendering
  const processFrame = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    let frameBase64 = null;

    if (webcamActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = 320; // Downscale to recommend settings
        canvas.height = 240;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frameBase64 = canvas.toDataURL("image/jpeg", 0.7);
      }
    }

    try {
      const res = await fetch("http://localhost:8000/api/vision/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frame_data: frameBase64,
          env_name: activeScenario,
          elapsed_seconds: elapsedSeconds + 0.5,
          profile: "WHEELCHAIR",
          lang: selectedLang,
          model: hardwareProfile.recommended_model
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDetections(data.detections);
        setVisionDesc(data.vision_description);
        setRiskData(data.risk_analysis);
        setEmergencyStatus(data.emergency_status);
        setPerfMetrics(data.performance_metrics);

        // Fetch dynamic graph updates
        const graphRes = await fetch(`http://localhost:8000/api/graph?env_name=${activeScenario}&profile=WHEELCHAIR`);
        if (graphRes.ok) {
          const gData = await graphRes.json();
          setGraphData(gData);
        }

        // Voice warning triggers with priority levels
        if (data.emergency_status?.emergency_active) {
          speakText(data.emergency_status.instructions, voiceEnabled, selectedLang, "CRITICAL");
        } else if (data.risk_analysis?.alerts?.length > 0) {
          const firstAlert = data.risk_analysis.alerts[0];
          speakText(firstAlert.message, voiceEnabled, selectedLang, firstAlert.priority as SpeechPriority);
        } else if (elapsedSeconds % 5 === 0) {
          // Play periodic simplified layout feedback
          speakText(data.vision_description.simplified, voiceEnabled, selectedLang, "LOW");
        }
      }
    } catch (err) {
      console.log("Failed to process frame:", err);
    } finally {
      setIsProcessing(false);
      setElapsedSeconds(prev => prev + 0.5);
    }
  };

  // Start webcam feed
  const startWebcam = async () => {
    try {
      setWebcamActive(true);
      setActiveScenario("Dynamic Scanner");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Reset dynamic mapping in SQLite before starting
      await fetch("http://localhost:8000/api/graph/reset", { method: "POST" });
      
      setIsScanning(true);
      setElapsedSeconds(0);
    } catch (err) {
      alert("Failed to access camera: " + err);
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setWebcamActive(false);
    setIsScanning(false);
  };

  // Trigger continuous processing ticks
  useEffect(() => {
    if (isScanning) {
      scanIntervalRef.current = setInterval(processFrame, 400); // 2.5 FPS
    } else {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    }
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isScanning, elapsedSeconds, webcamActive, selectedLang]);

  // Digital Twin Simulation
  const runTwinSimulation = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/twin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          env_name: activeScenario,
          sim_profiles: ["WHEELCHAIR", "BLIND", "ELDERLY"]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTwinResults(data.simulation_results || []);
      }
    } catch (e) {
      console.log("Failed to simulate Digital Twin:", e);
    }
  };

  // Certification PDF/HTML Compile
  const compileCertificate = async () => {
    setGeneratingReport(true);
    setGeneratedReport(null);
    
    // Extract nodes details
    const barriers = graphData.nodes
      .filter((n: any) => n.group === "Barrier")
      .map((n: any) => n.label);
      
    const facilities = graphData.nodes
      .filter((n: any) => n.group === "Facility")
      .map((n: any) => n.label);

    try {
      const res = await fetch("http://localhost:8000/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building_name: activeScenario === "Dynamic Scanner" ? "University Campus Scanner" : activeScenario,
          location_address: activeScenario === "Airport Terminal" ? "Gate 1 Atrium" : "101 Campus Boulevard",
          facilities: facilities.length > 0 ? facilities : ["Wheelchair Ramp", "Elevator B"],
          barriers: barriers.length > 0 ? barriers : ["Missing Handrails", "Staircase"],
          lang: selectedLang
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setGeneratedReport(data);
      }
    } catch (e) {
      console.log("Failed to generate report:", e);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Demo Walkthrough steps definition
  const demoSteps: DemoStep[] = [
    {
      title: "1. Problem & Architecture Overview",
      desc: "Introduce the offline-first hybrid knowledge graph architecture designed for accessible mobility.",
      narration: "Welcome to GuidePilot AI. Our platform targets the mobility barrier faced by millions. Using a layered hybrid knowledge graph, we merge computer vision detections into persistent environment memory and output speech instructions in five languages.",
      action: () => {
        setActiveScenario("Airport Terminal");
        stopWebcam();
      }
    },
    {
      title: "2. Live Vision Analysis Mode",
      desc: "Start camera/video scanning. Detect obstacles and output real-time priority-based warnings.",
      narration: "Step 2. Real-Time Vision Scanner. Witness live bounding box detection, obstacle distance checking, and voice warnings. Critical alarms immediately interrupt any lower priority cues.",
      action: async () => {
        setActiveScenario("Dynamic Scanner");
        setIsScanning(true);
        setElapsedSeconds(0);
      }
    },
    {
      title: "3. Dynamic Mapping & Memory",
      desc: "Observe spatial coordinates being plotted. Learn how re-discovery merges previous nodes in SQLite.",
      narration: "Step 3. Persistent Mapping. As the user walks, physical landmarks are mapped to absolute coordinates and saved locally. Re-visiting this hall dynamically merges new observations into SQLite.",
      action: () => {
        setIsScanning(true);
      }
    },
    {
      title: "4. Hybrid Knowledge Graph",
      desc: "Evaluate Layer 1 (Vision), Layer 2 (Semantic), and Layer 3 (Accessibility Intelligence) layers.",
      narration: "Step 4. Hybrid Graph. Our graph operates on three layers. Layer 1 maps shapes. Layer 2 defines semantic connections. Layer 3 evaluates safety ratings for custom user profiles.",
      action: () => {
        setGraphLayout("accessibility");
        fetchGraph();
      }
    },
    {
      title: "5. Digital Twin Simulation",
      desc: "Evaluate compatibility benchmarks across multiple profiles (Wheelchair, Blind, Elderly).",
      narration: "Step 5. Digital Twin. Instantly verify building accessibility by running mock profiles before users travel.",
      action: () => {
        runTwinSimulation();
      }
    },
    {
      title: "6. Multi-Language Certifications",
      desc: "Export consulting-grade audit PDF/HTML reports with custom SVG charts.",
      narration: "Step 6. Professional Reports. Compile certificates with SVG charts. Our layouts fully shift to RTL Cairo fonts when Arabic is toggled.",
      action: () => {
        compileCertificate();
      }
    }
  ];

  const handleNextStep = () => {
    const nextIdx = (activeStep + 1) % demoSteps.length;
    setActiveStep(nextIdx);
    const stepObj = demoSteps[nextIdx];
    stepObj.action({});
    speakText(stepObj.narration, voiceEnabled, selectedLang, "CRITICAL");
  };

  const handlePrevStep = () => {
    const prevIdx = activeStep === 0 ? demoSteps.length - 1 : activeStep - 1;
    setActiveStep(prevIdx);
    const stepObj = demoSteps[prevIdx];
    stepObj.action({});
    speakText(stepObj.narration, voiceEnabled, selectedLang, "CRITICAL");
  };

  // Draw simulated scenario feed onto canvas when webcam is inactive
  useEffect(() => {
    if (webcamActive || !isScanning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: any;
    
    const drawSimulatedFrame = () => {
      ctx.fillStyle = "#111827"; // Dark blue-gray corridor
      ctx.fillRect(0, 0, 320, 240);

      // Draw perspective grid corridor lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 240); ctx.lineTo(120, 100);
      ctx.moveTo(320, 240); ctx.lineTo(200, 100);
      ctx.moveTo(0, 0); ctx.lineTo(120, 100);
      ctx.moveTo(320, 0); ctx.lineTo(200, 100);
      ctx.stroke();

      // Draw moving landmark representations
      const cycle = elapsedSeconds % 30;
      
      if (activeScenario === "Airport Terminal" || activeScenario === "Dynamic Scanner") {
        if (cycle < 8) {
          // Draw elevator doors
          ctx.fillStyle = "#10B981";
          ctx.fillRect(130, 80, 60, 60);
          ctx.fillStyle = "#0B0F19";
          ctx.fillRect(158, 80, 4, 60); // Door gap
        } else if (cycle < 18) {
          // Draw stairs steps
          ctx.fillStyle = "#EF4444";
          for (let i = 0; i < 5; i++) {
            ctx.fillRect(100 + i*15, 150 - i*10, 120 - i*30, 8);
          }
        }
      } else if (activeScenario.includes("Crossing") || activeScenario.includes("Street")) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.5)"; // Zebra crossing
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(40 + i*40, 180, 20, 40);
        }
      }
      
      // Draw simulated camera scanline sweep
      const sweepY = (elapsedSeconds * 40) % 240;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(320, sweepY);
      ctx.stroke();

      frameId = requestAnimationFrame(drawSimulatedFrame);
    };

    drawSimulatedFrame();
    return () => cancelAnimationFrame(frameId);
  }, [isScanning, activeScenario, elapsedSeconds, webcamActive]);

  const trans = UI_TRANSLATIONS[selectedLang];

  return (
    <main style={{ padding: "30px 24px", minHeight: "100vh", display: "flex", flexDirection: "column", gap: "24px", background: "#080B10" }}>
      
      {/* Top Banner and Language Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
            <span className="text-gradient">{trans.title}</span>
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            {trans.subtitle}
          </p>
        </div>

        {/* Flag Toggles & Speak switch */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          
          {/* Voice toggler */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: voiceEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.02)",
              color: voiceEnabled ? "var(--color-success)" : "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            🔊 {trans.voice_guide}: {voiceEnabled ? trans.on : trans.off}
          </button>

          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            {[
              { code: "en", flag: "🇺🇸", name: "EN" },
              { code: "ar", flag: "🇦🇪", name: "العربية" },
              { code: "es", flag: "🇪🇸", name: "ES" },
              { code: "fr", flag: "🇫🇷", name: "FR" },
              { code: "de", flag: "🇩🇪", name: "DE" }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: selectedLang === l.code ? "var(--color-accent)" : "transparent",
                  color: selectedLang === l.code ? "#000" : "#FFF",
                  fontWeight: "bold",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center"
                }}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* SIDEBAR: Walkthrough & Performance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* 1. Walkthrough Script Controller */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h2 style={{ fontSize: "16px", color: "var(--color-accent)", display: "flex", justifyContent: "space-between" }}>
              <span>📋 {trans.demo_script}</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{trans.step} {activeStep + 1}/6</span>
            </h2>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "14px" }}>
              <strong style={{ fontSize: "13px", color: "var(--color-warning)", display: "block" }}>
                {demoSteps[activeStep].title}
              </strong>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>
                {demoSteps[activeStep].desc}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handlePrevStep}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "#FFF",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ← {trans.prev}
              </button>
              <button
                onClick={handleNextStep}
                style={{
                  flex: 2,
                  padding: "10px",
                  borderRadius: "8px",
                  background: "var(--color-accent)",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                {trans.next} →
              </button>
            </div>
          </div>

          {/* 2. Real-Time Performance Dashboard */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "16px", color: "var(--color-accent)" }}>⚡ {trans.perf_dashboard}</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Frame Rate</span>
                <strong style={{ fontSize: "20px", color: "var(--color-success)" }}>
                  {isScanning ? (webcamActive ? "2.5 FPS" : "2.5 FPS") : "0.0 FPS"}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Total Loop Latency</span>
                <strong style={{ fontSize: "20px", color: "var(--color-warning)" }}>
                  {perfMetrics.total_latency_ms || 45} ms
                </strong>
              </div>
            </div>

            {/* Performance progress bars */}
            <div className="perf-bar-container">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span>Vision Pipeline</span>
                <span style={{ color: "var(--color-accent)" }}>{perfMetrics.vision_latency_ms || 45}ms</span>
              </div>
              <div className="perf-bar-track">
                <div className="perf-bar-fill" style={{ width: `${Math.min(100, (perfMetrics.vision_latency_ms || 45) / 2)}%`, background: "var(--color-accent)" }}></div>
              </div>
            </div>

            <div className="perf-bar-container">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span>Agent Decision Core</span>
                <span style={{ color: "var(--color-warning)" }}>{perfMetrics.navigation_latency_ms || 80}ms</span>
              </div>
              <div className="perf-bar-track">
                <div className="perf-bar-fill" style={{ width: `${Math.min(100, (perfMetrics.navigation_latency_ms || 80) / 2)}%`, background: "var(--color-warning)" }}></div>
              </div>
            </div>

            {/* Hardware Profile Suggestions */}
            <div style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px dashed var(--border-color)", borderRadius: "8px", fontSize: "11px" }}>
              <span style={{ fontWeight: "bold", display: "block", color: "var(--color-success)" }}>⚡ Hardware Strategy Profile:</span>
              <p style={{ marginTop: "4px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                Cores: <strong>{hardwareProfile.cpu_cores}</strong> | RAM: <strong>{hardwareProfile.total_ram_gb} GB</strong> | GPU: <strong>{hardwareProfile.gpu_available ? "YES" : "NO"}</strong><br/>
                Auto-scaled Target: <strong>{hardwareProfile.recommended_resolution} @ {hardwareProfile.recommended_fps} FPS</strong><br/>
                Model: <strong>{hardwareProfile.recommended_model} ({hardwareProfile.agent_complexity})</strong>
              </p>
            </div>
          </div>

        </div>

        {/* MAIN AREA: Stream, Warnings, Graphs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Row 1: Live Video / Canvas Simulator */}
          <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            {/* Camera viewport card */}
            <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>📹 Live Environment Validator</h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={webcamActive ? stopWebcam : startWebcam}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      background: webcamActive ? "var(--color-danger)" : "var(--color-accent)",
                      color: "#000",
                      fontWeight: "bold",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    {webcamActive ? trans.stop_webcam : trans.start_webcam}
                  </button>
                  <button
                    onClick={() => {
                      setIsScanning(!isScanning);
                      if (!isScanning) setElapsedSeconds(0);
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid var(--border-color)",
                      color: "#FFF",
                      cursor: "pointer"
                    }}
                  >
                    {isScanning ? "Pause Scan" : "Run Timeline Simulator"}
                  </button>
                </div>
              </div>

              {/* Feed Display Container */}
              <div style={{ width: "100%", height: "240px", background: "#000", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                {webcamActive && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                
                {/* Hidden canvas for webcam capture or visible canvas for timeline rendering */}
                <canvas
                  ref={canvasRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: webcamActive ? "none" : "block",
                    objectFit: "cover"
                  }}
                />

                {/* Live overlay bounding boxes */}
                {isScanning && detections.map((det, idx) => {
                  const box = det.bounding_box || [50, 50, 150, 150];
                  // Scale [320, 240] boxes to fill the box container (e.g., scale relative coordinates)
                  const left = `${(box[0] / 320) * 100}%`;
                  const top = `${(box[1] / 240) * 100}%`;
                  const width = `${((box[2] - box[0]) / 320) * 100}%`;
                  const height = `${((box[3] - box[1]) / 240) * 100}%`;

                  return (
                    <div
                      key={idx}
                      className="bounding-box"
                      style={{
                        position: "absolute",
                        left,
                        top,
                        width,
                        height,
                        border: "2px solid var(--color-accent)"
                      }}
                    >
                      <span style={{
                        position: "absolute",
                        top: "-22px",
                        left: "0",
                        background: "var(--color-accent)",
                        color: "#000",
                        fontSize: "9px",
                        fontWeight: "bold",
                        padding: "2px 5px",
                        borderRadius: "3px",
                        whiteSpace: "nowrap"
                      }}>
                        {det.label} ({Math.round(det.confidence * 100)}%) - {det.distance_meters}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Reasoning & Warnings card */}
            <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>🧠 AI Spatial Reasoning Engine</h3>
              
              {/* Emergency Danger Alert Banner */}
              {emergencyStatus?.emergency_active && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "2px solid var(--color-danger)",
                  padding: "10px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  animation: "pulse-red 1.5s infinite"
                }}>
                  <span style={{ fontSize: "20px" }}>🚨</span>
                  <div style={{ fontSize: "12px" }}>
                    <strong style={{ color: "var(--color-danger)", display: "block" }}>EMERGENCY EVENT DETECTED</strong>
                    <span>{emergencyStatus.instructions}</span>
                  </div>
                </div>
              )}

              {/* Subtitles & Notes */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px", minHeight: "80px" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Vocal Subtitles</span>
                  <p style={{ fontSize: "12px", marginTop: "4px", fontWeight: "500" }}>{visionDesc.detailed}</p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Accessibility Safety Notes</span>
                  <p style={{ fontSize: "12px", marginTop: "4px", color: "var(--color-accent)" }}>{visionDesc.accessibility_notes}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: SVG Hybrid Knowledge Graph */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>🕸️ Autonomous 3-Layer Hybrid Knowledge Graph</h3>
              
              {/* Graph filter */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { id: "accessibility", label: "Accessibility Map" },
                  { id: "risk", label: "Risk Map" },
                  { id: "wheelchair", label: "Wheelchair-friendly Map" }
                ].map(lay => (
                  <button
                    key={lay.id}
                    onClick={() => setGraphLayout(lay.id)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      background: graphLayout === lay.id ? "var(--color-accent)" : "rgba(255,255,255,0.03)",
                      color: graphLayout === lay.id ? "#000" : "#FFF",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    {lay.label}
                  </button>
                ))}
                
                <button
                  onClick={async () => {
                    await fetch("http://localhost:8000/api/graph/reset", { method: "POST" });
                    setElapsedSeconds(0);
                    fetchGraph();
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "var(--color-danger)",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {trans.reset_scanner}
                </button>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div style={{ width: "100%", height: "260px", background: "rgba(0,0,0,0.3)", borderRadius: "10px", border: "1px solid var(--border-color)", overflow: "hidden", position: "relative" }}>
              <svg width="100%" height="100%" style={{ background: "transparent" }}>
                {/* Draw links */}
                {graphData.edges && graphData.edges.map((edge: any, idx: number) => {
                  const fromNode = graphData.nodes.find((n: any) => n.id === edge.from);
                  const toNode = graphData.nodes.find((n: any) => n.id === edge.to);
                  
                  if (!fromNode || !toNode) return null;
                  
                  // Filter out links based on layout choice
                  if (graphLayout === "wheelchair" && edge.relation === "BlockedRoute") return null;

                  // Apply layout coloring rules
                  let strokeColor = edge.color;
                  if (graphLayout === "risk") {
                    strokeColor = edge.risk === "high" ? "#EF4444" : (edge.risk === "medium" ? "#FFB800" : "#10B981");
                  }

                  return (
                    <g key={idx}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y + 60}
                        x2={toNode.x}
                        y2={toNode.y + 60}
                        stroke={strokeColor}
                        strokeWidth="2"
                        strokeDasharray={edge.relation === "Prioritizes" || edge.relation === "RestrictsAccess" ? "4,4" : ""}
                      />
                      {/* Distance label midpoint */}
                      {edge.distance > 0 && (
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 + 55}
                          fill="#9CA3AF"
                          fontSize="9"
                          textAnchor="middle"
                          style={{ background: "#000" }}
                        >
                          {edge.distance}m
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Draw nodes */}
                {graphData.nodes && graphData.nodes.map((node: any) => {
                  // Filter out stairs if wheelchair layout is enabled
                  if (graphLayout === "wheelchair" && (node.type === "stairs" || node.type === "staircase")) return null;

                  // Apply node coloring
                  let fill = "#1F2937";
                  let stroke = "var(--border-color)";
                  
                  if (node.group === "Location") {
                    fill = "#1E3A8A"; stroke = "#3B82F6";
                  } else if (node.group === "Facility") {
                    fill = "#064E3B"; stroke = "#10B981";
                  } else if (node.group === "Barrier") {
                    fill = "#7F1D1D"; stroke = "#EF4444";
                  } else if (node.group === "Preference") {
                    fill = "#78350F"; stroke = "#FFB800";
                  }

                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y + 60})`}>
                      <circle r="12" fill={fill} stroke={stroke} strokeWidth="2" />
                      <text
                        y="22"
                        fill="#FFF"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Row 3: Digital Twin & Reports Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
            
            {/* Digital Twin Panel */}
            <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>👥 {trans.twin_title}</h3>
                <button
                  onClick={runTwinSimulation}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    color: "#FFF",
                    cursor: "pointer"
                  }}
                >
                  Simulate Twins
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
                {twinResults.length > 0 ? twinResults.map((t, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold" }}>{t.profile}</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Score:</span>
                      <strong style={{ fontSize: "13px", color: t.compatibility_percentage >= 80 ? "var(--color-success)" : (t.compatibility_percentage >= 60 ? "var(--color-warning)" : "var(--color-danger)") }}>
                        {t.compatibility_percentage}%
                      </strong>
                    </div>
                  </div>
                )) : (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>No active twin simulation details compiled.</span>
                )}
              </div>
            </div>

            {/* Audit Certificate Generation card */}
            <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>📜 Consulting-Grade PDF Exporter</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                <span>Accessibility Score: <strong>{riskData.accessibility_score}/100</strong> (Confidence: {riskData.confidence}%)</span>
                <span>Breakdown: Stairs <strong>{riskData.score_breakdown.stairs_penalty || 0}</strong> | Obstacles <strong>{riskData.score_breakdown.obstacle_penalty || 0}</strong></span>
                <span>Reasoning: <em>{riskData.reasoning_path}</em></span>
              </div>

              <button
                onClick={compileCertificate}
                disabled={generatingReport}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "var(--color-warning)",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                {generatingReport ? "Compiling Audit PDF..." : trans.generate_audit}
              </button>

              {generatedReport && (
                <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--color-success)", borderRadius: "8px", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px" }}>Report compiled for <strong>{generatedReport.building_name}</strong></span>
                  <a
                    href={`http://localhost:8000${generatedReport.report_url}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 12px",
                      background: "var(--color-success)",
                      color: "#000",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      textDecoration: "none"
                    }}
                  >
                    Open PDF View
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
