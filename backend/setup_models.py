import os
import requests
import json
from pathlib import Path
from backend import config

def ensure_directories():
    """Creates directory tree."""
    for path_str in [config.UPLOAD_DIR, config.SCENARIOS_DIR, config.REPORTS_DIR]:
        Path(path_str).mkdir(parents=True, exist_ok=True)
    print("✓ Local directories verified.")

def verify_ollama_models():
    """Checks Ollama server status and downloads model if missing."""
    print("Checking Ollama server connectivity...")
    try:
        response = requests.get(f"{config.OLLAMA_BASE_URL}/api/tags", timeout=3)
        if response.status_code != 200:
            print("✗ Ollama API endpoint error. Running in Simulation fallback mode.")
            return
            
        data = response.json()
        models = [m["name"] for m in data.get("models", [])]
        print(f"Detected installed models: {models}")
        
        # Check default model
        target = config.DEFAULT_MODEL
        matched = any(target in m for m in models)
        
        if not matched:
            print(f"Model '{target}' not found. Pulling model in background (this may take a few minutes)...")
            # Pull model
            pull_url = f"{config.OLLAMA_BASE_URL}/api/pull"
            payload = {"name": target, "stream": False}
            requests.post(pull_url, json=payload, timeout=600)  # Long timeout for model pulls
            print(f"✓ Model '{target}' pulled successfully.")
        else:
            print(f"✓ Model '{target}' is installed and ready.")
            
    except Exception as e:
        print(f"✗ Ollama is offline or not installed ({e}). Running in Simulation fallback mode.")

def generate_sample_documents():
    """Populates travel guides to enable immediate RAG testing."""
    guide_path = os.path.join(config.UPLOAD_DIR, "airport_terminal_3_guide.txt")
    
    content = """GUIDEPILOT AIRPORT ACCESSIBILITY BROCHURE: TERMINAL 3

WELCOME TO AIRPORT TERMINAL 3.
This guide outlines facility routing for wheelchair users and visually impaired travelers.

1. ENTRANCES AND DROPOFFS
- Gate 4 and Gate 12 feature step-free sidewalk ramps with tactile yellow indicators.
- Special assistance desks are located immediately inside Gate 4. Phone contact: +1-800-555-0199.

2. SECURITY CHECKPOINT
- Lane 5 is an extra-wide (120cm) security checkpoint lane dedicated to wheelchair users and passengers with service animals.

3. ELEVATORS
- Elevator A is located opposite the Duty-Free shop, serving Gate level (Floor 2).
- Elevator B is located beside Baggage Claim 4, connecting to the Parking Garage.
- All elevators contain braille call buttons and vocal height level voice-outs.

4. RESTROOMS
- Family and wheelchair-accessible restrooms are located adjacent to Gates 1, 14, and Floor 1 Arrivals.
- All accessible bathrooms contain 95cm wide sliding doors and emergency call levers.
"""
    
    try:
        with open(guide_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ Created sample travel guide: {guide_path}")
    except Exception as e:
        print(f"Failed to write sample guide: {e}")

if __name__ == "__main__":
    ensure_directories()
    verify_ollama_models()
    generate_sample_documents()
