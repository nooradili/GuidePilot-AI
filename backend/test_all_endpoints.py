# GuidePilot AI Comprehensive Backend Endpoints Test Suite
import requests
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("==================================================")
    print("   GUIDEPILOT AI ENDPOINT VALIDATION RUNNER")
    print("==================================================\n")

    results = {}

    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/api/health")
        results["GET /api/health"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/health"] = (False, str(e))

    # 2. Hardware Detection
    try:
        r = requests.get(f"{BASE_URL}/api/hardware/detect")
        results["GET /api/hardware/detect"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/hardware/detect"] = (False, str(e))

    # 3. Save User Profile
    profile_payload = {
        "name": "Jane Doe",
        "accessibility_profile": "WHEELCHAIR",
        "high_contrast_mode": True,
        "text_size_scale": 120,
        "voice_guidance_enabled": True,
        "preferred_ollama_model": "llama3"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/profile", json=profile_payload)
        results["POST /api/profile"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/profile"] = (False, str(e))

    # 4. Get User Profile
    try:
        r = requests.get(f"{BASE_URL}/api/profile")
        results["GET /api/profile"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/profile"] = (False, str(e))

    # 5. Route planning (Wheelchair avoiding stairs)
    route_payload = {
        "env_name": "Airport Terminal",
        "origin": "Entrance",
        "destination": "Gate_1",
        "profile": "WHEELCHAIR"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/navigation/route", json=route_payload)
        results["POST /api/navigation/route (WHEELCHAIR)"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/navigation/route (WHEELCHAIR)"] = (False, str(e))

    # 6. Route planning (Blind-user tactile path)
    route_payload_blind = {
        "env_name": "Airport Terminal",
        "origin": "Entrance",
        "destination": "Gate_1",
        "profile": "BLIND"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/navigation/route", json=route_payload_blind)
        results["POST /api/navigation/route (BLIND)"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/navigation/route (BLIND)"] = (False, str(e))

    # 7. Save route
    save_route_payload = {
        "origin_name": "Main Entrance Lobby",
        "destination_name": "Gate 1 (Wheelchair boarding)",
        "path_coordinates": [{"x": 0, "y": 0}, {"x": 10, "y": 0}],
        "safety_score": 90.0,
        "distance_meters": 35.0,
        "route_type": "WHEELCHAIR"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/navigation/save", json=save_route_payload)
        results["POST /api/navigation/save"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/navigation/save"] = (False, str(e))

    # 8. Get routes history
    try:
        r = requests.get(f"{BASE_URL}/api/navigation/routes")
        results["GET /api/navigation/routes"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/navigation/routes"] = (False, str(e))

    # 9. Get scenario detections and agent reactions
    try:
        r = requests.get(f"{BASE_URL}/api/vision/scenario/Airport Corridor")
        results["GET /api/vision/scenario/Airport Corridor"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/vision/scenario/Airport Corridor"] = (False, str(e))

    # 10. Twin simulation
    twin_payload = {
        "env_name": "Airport Terminal",
        "sim_profiles": ["WHEELCHAIR", "BLIND", "ELDERLY"]
    }
    try:
        r = requests.post(f"{BASE_URL}/api/twin/simulate", json=twin_payload)
        results["POST /api/twin/simulate"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/twin/simulate"] = (False, str(e))

    # 11. Get Knowledge Graph
    try:
        r = requests.get(f"{BASE_URL}/api/graph?env_name=Airport Terminal&profile=WHEELCHAIR")
        results["GET /api/graph"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/graph"] = (False, str(e))

    # 12. Travel guide document upload
    # Write a test file first
    test_filepath = "data/uploads/test_upload_doc.txt"
    os.makedirs("data/uploads", exist_ok=True)
    with open(test_filepath, "w", encoding="utf-8") as f:
        f.write("GUIDEPILOT UNIVERSITY DIRECTORY\nThe main entrance ramp is next to Hall A. Elevator is on 1st Floor.")
        
    try:
        with open(test_filepath, "rb") as f:
            files = {"file": ("test_upload_doc.txt", f, "text/plain")}
            r = requests.post(f"{BASE_URL}/api/travel/upload", files=files)
            results["POST /api/travel/upload"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/travel/upload"] = (False, str(e))

    # 13. Query travel assistant (RAG)
    query_payload = {
        "query": "Where is the main entrance ramp?"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/travel/query", json=query_payload)
        results["POST /api/travel/query"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/travel/query"] = (False, str(e))

    # 14. Generate Accessibility Audit Report
    report_payload = {
        "building_name": "Grand Central Station",
        "location_address": "42nd Street Park Ave",
        "facilities": ["Elevator A", "Wheelchair Ramp"],
        "barriers": ["Escalator only to Subway"],
        "lang": "en"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/reports/generate", json=report_payload)
        results["POST /api/reports/generate (EN)"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/reports/generate (EN)"] = (False, str(e))

    # 15. Generate Accessibility Audit Report in Arabic RTL
    report_payload_ar = {
        "building_name": "محطة القطار المركزية",
        "location_address": "شارع ٤٢، نيويورك",
        "facilities": ["مدخل المصعد أ", "منحدر كراسي متحركة"],
        "barriers": ["سلم متحرك فقط"],
        "lang": "ar"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/reports/generate", json=report_payload_ar)
        results["POST /api/reports/generate (AR)"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/reports/generate (AR)"] = (False, str(e))

    # 16. Get audit reports history
    try:
        r = requests.get(f"{BASE_URL}/api/reports")
        results["GET /api/reports"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/reports"] = (False, str(e))

    # 17. Coaching Metrics
    try:
        r = requests.get(f"{BASE_URL}/api/coaching/metrics")
        results["GET /api/coaching/metrics"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["GET /api/coaching/metrics"] = (False, str(e))

    # 18. Update Coaching Stats
    coaching_payload = {
        "distance_delta": 150.0,
        "risks_delta": 2,
        "independence_score": 88.5
    }
    try:
        r = requests.post(f"{BASE_URL}/api/coaching/update", json=coaching_payload)
        results["POST /api/coaching/update"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/coaching/update"] = (False, str(e))

    # 19. Dynamic vision frame analysis
    # Simple base64 image data placeholder
    dummy_frame_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    frame_payload = {
        "frame_data": dummy_frame_base64,
        "env_name": "Dynamic Airport Scanner",
        "elapsed_seconds": 2.5,
        "profile": "WHEELCHAIR",
        "lang": "ar" # Verify translation guidance in Arabic
    }
    try:
        r = requests.post(f"{BASE_URL}/api/vision/analyze-frame", json=frame_payload)
        results["POST /api/vision/analyze-frame"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/vision/analyze-frame"] = (False, str(e))

    # 20. Reset Dynamic Graph
    try:
        r = requests.post(f"{BASE_URL}/api/graph/reset?env_name=Dynamic Scanner")
        results["POST /api/graph/reset"] = (r.status_code == 200, r.json())
    except Exception as e:
        results["POST /api/graph/reset"] = (False, str(e))

    # Print out results
    print(f"{'Endpoint':<45} | {'Status':<6} | Details")
    print("-" * 80)
    failed = 0
    for endpoint, (success, data) in results.items():
        status_str = "PASS" if success else "FAIL"
        summary = str(data)[:60] + "..." if len(str(data)) > 60 else str(data)
        print(f"{endpoint:<45} | {status_str:<6} | {summary}")
        if not success:
            failed += 1

    print("\n==================================================")
    if failed == 0:
        print("   ALL TESTS PASSED SUCCESSFULLY! :)")
    else:
        print(f"   {failed} ENDPOINT TEST(S) FAILED! :(")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
