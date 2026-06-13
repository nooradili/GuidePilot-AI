import os
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# Path Layout
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR    = BASE_DIR / "data"

# Ensure all required directories exist at startup
for _dir in ["uploads", "scenarios", "reports", "maps"]:
    (DATA_DIR / _dir).mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Server
# ─────────────────────────────────────────────────────────────────────────────
HOST = "127.0.0.1"
PORT = 8000

# ─────────────────────────────────────────────────────────────────────────────
# Database & Vector Store
# ─────────────────────────────────────────────────────────────────────────────
DATABASE_PATH      = str(DATA_DIR / "guidepilot.db")
VECTOR_STORE_PATH  = str(DATA_DIR / "chroma_db")
UPLOAD_DIR         = str(DATA_DIR / "uploads")
SCENARIOS_DIR      = str(DATA_DIR / "scenarios")
REPORTS_DIR        = str(DATA_DIR / "reports")
MAPS_DIR           = str(DATA_DIR / "maps")

# ─────────────────────────────────────────────────────────────────────────────
# Local AI Models Configuration
# ─────────────────────────────────────────────────────────────────────────────
OLLAMA_BASE_URL  = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
DEFAULT_MODEL    = "llama3"
AVAILABLE_MODELS = ["llama3", "llama3:latest", "gemma:2b", "mistral:latest"]

# LLM request timeout — short enough to fall through to offline heuristics
LLM_TIMEOUT_SECONDS = 6

# ─────────────────────────────────────────────────────────────────────────────
# Computer Vision & Audio Thresholds
# ─────────────────────────────────────────────────────────────────────────────
# Distance at which a nearby object triggers an alert (metres)
PROXIMITY_ALERT_THRESHOLD_METERS = 2.0

# Minimum YOLO detection confidence to accept
CONFIDENCE_THRESHOLD = 0.50

# ─────────────────────────────────────────────────────────────────────────────
# Real-Time Performance Targets
# ─────────────────────────────────────────────────────────────────────────────
# Maximum acceptable end-to-end latency before warning (ms)
MAX_ACCEPTABLE_LATENCY_MS = 400

# Simulated timeline frame step (seconds per tick)
FRAME_STEP_SECONDS = 0.5

# Default scan FPS when hardware profiling is unavailable
DEFAULT_SCAN_FPS = 2

# ─────────────────────────────────────────────────────────────────────────────
# Spatial Mapping Constants
# ─────────────────────────────────────────────────────────────────────────────
# Euclidean distance threshold for merging nearby graph nodes (coordinate units)
NODE_MERGE_THRESHOLD = 35

# Y-axis progression rate used to convert elapsed time to map coordinates
MAP_PROGRESSION_RATE = 12  # units per second

# ─────────────────────────────────────────────────────────────────────────────
# Supported Languages
# ─────────────────────────────────────────────────────────────────────────────
SUPPORTED_LANGUAGES = ["en", "ar", "es", "fr", "de"]
DEFAULT_LANGUAGE     = "en"
