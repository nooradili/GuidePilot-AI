import json
from backend.agents.base import BaseAgent

class AccessibilityAgent(BaseAgent):
    def __init__(self):
        super().__init__("AccessibilityAgent")

    def calculate_score(self, facilities, barriers):
        """Calculates 0-100 score based on building assets and issues."""
        base_score = 75  # Start neutral
        
        # Facilities increase score
        for facility in facilities:
            f_type = facility.lower()
            if "elevator" in f_type:
                base_score += 10
            elif "ramp" in f_type:
                base_score += 8
            elif "tactile" in f_type:
                base_score += 5
            elif "restroom" in f_type:
                base_score += 5
                
        # Barriers decrease score
        for barrier in barriers:
            b_type = barrier.lower()
            if "stairs_only" in b_type or "staircase" in b_type:
                base_score -= 15
            elif "narrow_door" in b_type:
                base_score -= 10
            elif "construction" in b_type:
                base_score -= 12
            elif "clutter" in b_type:
                base_score -= 5
                
        score = max(0, min(100, base_score))
        
        # Determine certification status
        if score >= 85:
            status = "ACCESSIBLE"
        elif score >= 60:
            status = "CONDITIONAL"
        else:
            status = "BARRIER_PRONE"
            
        return {
            "score": score,
            "status": status
        }

    def simulate_digital_twin(self, env_name, sim_profiles):
        """Runs virtual walkthrough simulator for user profiles and returns report."""
        # Standard profiles database
        reports = {}
        for profile in sim_profiles:
            if profile == "WHEELCHAIR":
                bottlenecks = [
                    {"location": "Central Atrium Stairs", "severity": "HIGH", "desc": "No ramp available near main stairwell. Forced 40m detour to back elevator."},
                    {"location": "Restroom Entrance Door", "severity": "MEDIUM", "desc": "Door width is 80cm; standard electric wheelchairs require at least 90cm."}
                ]
                score_impact = -25
            elif profile == "BLIND":
                bottlenecks = [
                    {"location": "Elevator Lobby Corridor", "severity": "HIGH", "desc": "Missing tactile pavement markers. Wall-following layout is interrupted by loose furniture."},
                    {"location": "Main Entrance Lobby", "severity": "LOW", "desc": "No braille signage on key facility listings directory."}
                ]
                score_impact = -15
            elif profile == "ELDERLY":
                bottlenecks = [
                    {"location": "Main Corridor ramp", "severity": "MEDIUM", "desc": "Slope gradient is 8.5% (exceeds recommended 6% for independent elderly traversal). Handrail is missing."}
                ]
                score_impact = -10
            else:
                bottlenecks = []
                score_impact = 0
                
            base_score = 90 + score_impact
            status = "Accessibility Certified" if base_score >= 80 else "Conditional Access"
            
            reports[profile] = {
                "score": max(20, base_score),
                "status": status,
                "bottlenecks": bottlenecks,
                "improvements": [f"Install wedge ramp or expand doorway at detected bottleneck spots.", "Add high-contrast markings and braille signage."]
            }
            
        return reports
