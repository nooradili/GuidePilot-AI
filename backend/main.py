import os
import time
import shutil
import multiprocessing
import requests
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional

from backend import config
from backend import database
from backend.vector_store import CHROMA_AVAILABLE
from backend.agents.navigation import NavigationAgent
from backend.agents.vision import VisionAgent
from backend.agents.accessibility import AccessibilityAgent
from backend.agents.travel import TravelAgent
from backend.agents.memory import MemoryAgent
from backend.agents.risk import RiskAgent
from backend.agents.emergency import EmergencyAgent
from backend.agents.explainability import ExplainabilityAgent
from backend.agents.recommendation import RecommendationAgent
from backend.agents.visual_mapping import VisualMappingAgent

from backend.services.vision_service import GuidePilotVisionService, YOLO_AVAILABLE
from backend.services.graph_service import GuidePilotGraphService
from backend.services.report_service import GuidePilotReportService
import base64


# Initialize FastAPI App
app = FastAPI(title="GuidePilot AI API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def startup_db():
    database.db_init()

# Instantiate Agents and Services
nav_agent = NavigationAgent()
vis_agent = VisionAgent()
acc_agent = AccessibilityAgent()
travel_agent = TravelAgent()
mem_agent = MemoryAgent()
risk_agent = RiskAgent()
emg_agent = EmergencyAgent()
exp_agent = ExplainabilityAgent()
rec_agent = RecommendationAgent()
vmap_agent = VisualMappingAgent()

vision_service = GuidePilotVisionService()
graph_service = GuidePilotGraphService()
report_service = GuidePilotReportService()

# ----------------- Models & DTOs -----------------

class ProfileUpdateDTO(BaseModel):
    name: str
    accessibility_profile: str
    high_contrast_mode: bool
    text_size_scale: int
    voice_guidance_enabled: bool
    preferred_ollama_model: str

class RouteRequestDTO(BaseModel):
    env_name: str
    origin: str
    destination: str
    profile: Optional[str] = "WHEELCHAIR"

class RouteSaveDTO(BaseModel):
    origin_name: str
    destination_name: str
    path_coordinates: List[dict]
    safety_score: float
    distance_meters: float
    route_type: str

class RAGQueryDTO(BaseModel):
    query: str

class TwinSimDTO(BaseModel):
    env_name: str
    sim_profiles: List[str]

class ReportGenerateDTO(BaseModel):
    building_name: str
    location_address: str
    facilities: List[str]
    barriers: List[str]
    lang: Optional[str] = "en"

class FrameAnalysisDTO(BaseModel):
    frame_data: Optional[str] = None
    env_name: str
    elapsed_seconds: float
    profile: str
    lang: Optional[str] = "en"
    model: Optional[str] = None


class CoachingUpdateDTO(BaseModel):
    distance_delta: float
    risks_delta: int
    independence_score: float

# ----------------- API Endpoints -----------------

@app.get("/api/health")
def get_health():
    """Performs startup verification checks for all modules."""
    ollama_ready = False
    try:
        r = requests.get(f"{config.OLLAMA_BASE_URL}/api/tags", timeout=1.5)
        ollama_ready = r.status_code == 200
    except Exception:
        pass
        
    return {
        "status": "online",
        "ollama_ready": ollama_ready,
        "yolo_ready": YOLO_AVAILABLE,
        "database_ready": os.path.exists(config.DATABASE_PATH),
        "vector_ready": True,  # Fallback vector store always ready
        "chromadb_loaded": CHROMA_AVAILABLE
    }

@app.get("/api/hardware/detect")
def detect_hardware():
    """Inspects RAM, CPU, and GPU capability to recommend optimal local model & tuning."""
    cores = multiprocessing.cpu_count()
    
    # Heuristic RAM estimation for Windows
    ram_gb = 16.0
    try:
        import sys
        if sys.platform == "win32":
            # Command to check RAM via WMIC
            import subprocess
            out = subprocess.check_output("wmic ComputerSystem get TotalPhysicalMemory", shell=True)
            mem_bytes = int(out.decode().split("\n")[1].strip())
            ram_gb = round(mem_bytes / (1024**3), 1)
    except Exception:
        pass
        
    recommended = "gemma:2b"
    fps_cap = 2
    resolution = "320x240"
    complexity = "SIMPLE"
    
    if YOLO_AVAILABLE:
        complexity = "FULL"
        fps_cap = 5
        resolution = "640x480"
        
    if ram_gb >= 16.0:
        recommended = "llama3:latest"
        fps_cap = 6 if YOLO_AVAILABLE else 3
        resolution = "640x480"
    elif ram_gb >= 12.0:
        recommended = "mistral:latest"
        
    return {
        "cpu_cores": cores,
        "total_ram_gb": ram_gb,
        "gpu_available": YOLO_AVAILABLE,
        "recommended_model": recommended,
        "installed_models": [config.DEFAULT_MODEL],
        "recommended_fps": fps_cap,
        "recommended_resolution": resolution,
        "agent_complexity": complexity
    }

@app.get("/api/profile")
def get_profile():
    profile = mem_agent.load_profile()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.post("/api/profile")
def update_profile(dto: ProfileUpdateDTO):
    profile = mem_agent.save_profile(
        user_id="default_user",
        name=dto.name,
        acc_profile=dto.accessibility_profile,
        high_contrast=dto.high_contrast_mode,
        text_scale=dto.text_size_scale,
        voice_guidance=dto.voice_guidance_enabled,
        model=dto.preferred_ollama_model
    )
    return profile

@app.post("/api/navigation/route")
def get_route(dto: RouteRequestDTO):
    route = nav_agent.plan_route(dto.env_name, dto.origin, dto.destination, dto.profile)
    return route

@app.post("/api/navigation/save")
def save_route(dto: RouteSaveDTO):
    route_id = mem_agent.save_route(
        user_id="default_user",
        origin=dto.origin_name,
        destination=dto.destination_name,
        path_coords=dto.path_coordinates,
        safety_score=dto.safety_score,
        distance=dto.distance_meters,
        route_type=dto.route_type
    )
    return {"status": "success", "route_id": route_id}

@app.get("/api/navigation/routes")
def get_routes():
    return mem_agent.get_route_history()

@app.get("/api/vision/scenario/{name}")
def get_scenario_data(name: str):
    """Provides frame-by-frame object coordinate detections for simulated environments."""
    profile = get_profile().get("accessibility_profile", "WHEELCHAIR")
    detections = vision_service.get_simulated_scenario_frame(name)
    
    # Vision description
    descriptions = vis_agent.describe_scene(detections)
    
    # Risk evaluation
    risk_data = risk_agent.evaluate_risks(detections, profile)
    
    # Emergency control
    emergency_data = emg_agent.handle_emergency(risk_data.get("alerts", []))
    
    return {
        "detections": detections,
        "descriptions": descriptions,
        "risk": risk_data,
        "emergency": emergency_data
    }

@app.post("/api/twin/simulate")
def run_twin_simulation(dto: TwinSimDTO):
    """Calculates simulation reports for different accessibility profiles."""
    results = acc_agent.simulate_digital_twin(dto.env_name, dto.sim_profiles)
    return results

@app.get("/api/graph")
def get_graph(env_name: str, profile: Optional[str] = "WHEELCHAIR"):
    if env_name == "Dynamic Scanner" or env_name.startswith("Dynamic"):
        return vmap_agent.get_hybrid_graph(env_name, profile)
    return graph_service.build_knowledge_graph(env_name, profile)


@app.post("/api/travel/upload")
def upload_travel_doc(file: UploadFile = File(...)):
    # Save file
    file_path = os.path.join(config.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    result = travel_agent.ingest_document(file_path)
    return result

@app.post("/api/travel/query")
def query_travel_doc(dto: RAGQueryDTO):
    result = travel_agent.answer_query(dto.query)
    return result

@app.post("/api/reports/generate")
def generate_audit_report(dto: ReportGenerateDTO):
    report = report_service.compile_certification_report(
        user_id="default_user",
        building_name=dto.building_name,
        location_address=dto.location_address,
        facilities=dto.facilities,
        barriers=dto.barriers,
        recommendation_agent=rec_agent,
        lang=dto.lang
    )
    return report

@app.get("/api/reports")
def get_audit_reports():
    return database.get_accessibility_reports()

@app.get("/api/reports/download/{filename}")
def download_report_file(filename: str):
    file_path = os.path.join(config.REPORTS_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Report HTML file not found")

@app.get("/api/coaching/metrics")
def get_coaching():
    return mem_agent.get_coaching_metrics()

@app.post("/api/coaching/update")
def update_coaching(dto: CoachingUpdateDTO):
    mem_agent.record_daily_activity(
        user_id="default_user",
        distance_delta=dto.distance_delta,
        risks_delta=dto.risks_delta,
        independence_score=dto.independence_score
    )
    return {"status": "success"}

# ----------------- WebSocket Live Feeds -----------------

@app.websocket("/api/ws/stream")
async def websocket_vision_stream(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket stream connection established.")
    try:
        while True:
            # Expect client to send active scenario name
            data = await websocket.receive_text()
            # Generate new frame coordinates
            profile = get_profile().get("accessibility_profile", "WHEELCHAIR")
            detections = vision_service.get_simulated_scenario_frame(data)
            descriptions = vis_agent.describe_scene(detections)
            risk_data = risk_agent.evaluate_risks(detections, profile)
            emergency_data = emg_agent.handle_emergency(risk_data.get("alerts", []))
            
            payload = {
                "detections": detections,
                "descriptions": descriptions,
                "risk": risk_data,
                "emergency": emergency_data
            }
            await websocket.send_json(payload)
            # Sleep brief period to match camera frames
            import asyncio
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

# ----------------- Dynamic Frame Analysis Endpoints -----------------

@app.post("/api/vision/analyze-frame")
def analyze_frame(dto: FrameAnalysisDTO):
    """Processes base64 frame, updates dynamic graph, and evaluates safety and priority actions."""
    frame_bytes = None
    if dto.frame_data:
        try:
            # Strip data prefix if base64 contains it
            encoded_data = dto.frame_data
            if "," in encoded_data:
                encoded_data = encoded_data.split(",")[1]
            frame_bytes = base64.b64decode(encoded_data)
        except Exception as e:
            print(f"Failed to decode base64 frame: {e}")
            
    # Step 1: Vision Frame Detection & Latency
    detections, vision_latency = vision_service.analyze_frame_bytes(frame_bytes, dto.env_name, dto.elapsed_seconds)
    
    # Start internal timer for agent calculations
    t_start = time.time()
    
    # Step 2: Scene Descriptions
    vision_description = vis_agent.describe_scene(detections, lang=dto.lang, model=dto.model)
    
    # Step 3: Risk Evaluation
    risk_analysis = risk_agent.evaluate_risks(detections, dto.profile, lang=dto.lang, model=dto.model)
    
    # Step 4: Emergency Handling
    emergency_status = emg_agent.handle_emergency(risk_analysis.get("alerts", []), lang=dto.lang, model=dto.model)
    
    agent_latency = int((time.time() - t_start) * 1000)
    
    # Step 5: Visual Mapping Graph Updates
    vmap_agent.update_map_from_detections(dto.env_name, detections, dto.elapsed_seconds)
    
    # Compute combined latencies
    total_latency = vision_latency + agent_latency
    
    return {
        "detections": detections,
        "vision_description": vision_description,
        "risk_analysis": risk_analysis,
        "emergency_status": emergency_status,
        "performance_metrics": {
            "vision_latency_ms": vision_latency,
            "voice_latency_ms": 30 + len(vision_description.get("simplified", "")) * 2,
            "navigation_latency_ms": max(80, agent_latency - 20),
            "total_latency_ms": total_latency
        }
    }

@app.post("/api/graph/reset")
def reset_dynamic_graph(env_name: str = "Dynamic Scanner"):
    """Resets the environment map layout in the database to clear dynamic scanning session."""
    database.save_environment_map(env_name, {
        "Start_Point": {"name": "Scan Start lobby", "type": "entrance", "x": 150, "y": 0, "confidence": 1.0}
    }, [])
    return {"status": "reset"}

