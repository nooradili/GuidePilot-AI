import json
from backend.agents.base import BaseAgent

# Local Spatial Map Data for 5 Demo Environments
DEMO_MAPS = {
    "Airport Terminal": {
        "nodes": {
            "Entrance": {"name": "Main Entrance Lobby", "type": "lobby", "x": 0, "y": 0},
            "Ticketing": {"name": "Ticketing Counter", "type": "counter", "x": 10, "y": 0},
            "Security": {"name": "Security Checkpointpoint", "type": "security", "x": 20, "y": 0},
            "Stairs_A": {"name": "Stairwell to Gate level", "type": "stairs", "x": 30, "y": -5},
            "Elevator_A": {"name": "Elevator A (Gate access)", "type": "elevator", "x": 30, "y": 5},
            "Gate_1": {"name": "Gate 1 (Wheelchair boarding)", "type": "gate", "x": 45, "y": 10},
            "Gate_2": {"name": "Gate 2", "type": "gate", "x": 45, "y": -10},
            "Restroom_Accessible": {"name": "Accessible Toilet", "type": "toilet", "x": 25, "y": 8}
        },
        "links": [
            {"from": "Entrance", "to": "Ticketing", "distance": 15, "type": "tactile_path", "risk": "low"},
            {"from": "Ticketing", "to": "Security", "distance": 20, "type": "tactile_path", "risk": "low"},
            {"from": "Security", "to": "Restroom_Accessible", "distance": 10, "type": "corridor", "risk": "low"},
            {"from": "Security", "to": "Stairs_A", "distance": 15, "type": "stairs", "risk": "medium"},
            {"from": "Security", "to": "Elevator_A", "distance": 18, "type": "ramp", "risk": "low"},
            {"from": "Elevator_A", "to": "Gate_1", "distance": 22, "type": "corridor", "risk": "low"},
            {"from": "Stairs_A", "to": "Gate_2", "distance": 20, "type": "corridor", "risk": "low"},
            {"from": "Elevator_A", "to": "Gate_2", "distance": 25, "type": "corridor", "risk": "low"}
        ]
    },
    "Shopping Mall": {
        "nodes": {
            "Entrance": {"name": "South Entrance", "type": "entrance", "x": 0, "y": 0},
            "Atrium": {"name": "Central Atrium", "type": "lobby", "x": 15, "y": 0},
            "Stairs_Central": {"name": "Central Stairs", "type": "stairs", "x": 20, "y": 5},
            "Elevator_Central": {"name": "Glass Elevator", "type": "elevator", "x": 15, "y": 15},
            "FoodCourt_2F": {"name": "Food Court (2nd Floor)", "type": "food", "x": 35, "y": 10},
            "Cinema_2F": {"name": "Cinema Complex (2nd Floor)", "type": "entertainment", "x": 45, "y": 5},
            "Restroom_Atrium": {"name": "Family Toilet", "type": "toilet", "x": 10, "y": -10}
        },
        "links": [
            {"from": "Entrance", "to": "Atrium", "distance": 25, "type": "corridor", "risk": "low"},
            {"from": "Entrance", "to": "Restroom_Atrium", "distance": 12, "type": "corridor", "risk": "low"},
            {"from": "Atrium", "to": "Stairs_Central", "distance": 10, "type": "stairs", "risk": "medium"},
            {"from": "Atrium", "to": "Elevator_Central", "distance": 15, "type": "corridor", "risk": "low"},
            {"from": "Elevator_Central", "to": "FoodCourt_2F", "distance": 30, "type": "corridor", "risk": "low"},
            {"from": "Stairs_Central", "to": "FoodCourt_2F", "distance": 20, "type": "corridor", "risk": "medium"},
            {"from": "FoodCourt_2F", "to": "Cinema_2F", "distance": 18, "type": "corridor", "risk": "low"}
        ]
    },
    "University Campus": {
        "nodes": {
            "Gate": {"name": "Campus Main Gate", "type": "entrance", "x": 0, "y": 0},
            "Library": {"name": "Science Library", "type": "building", "x": 40, "y": 10},
            "Science_Hall": {"name": "Science Hall (Stairs only)", "type": "building", "x": 30, "y": -20},
            "Ramp_Science": {"name": "Science Hall Side Ramp", "type": "ramp", "x": 28, "y": -15},
            "Auditorium": {"name": "Main Auditorium", "type": "building", "x": 60, "y": 0}
        },
        "links": [
            {"from": "Gate", "to": "Library", "distance": 80, "type": "tactile_path", "risk": "low"},
            {"from": "Gate", "to": "Science_Hall", "distance": 70, "type": "stairs", "risk": "medium"},
            {"from": "Gate", "to": "Ramp_Science", "distance": 75, "type": "ramp", "risk": "low"},
            {"from": "Ramp_Science", "to": "Science_Hall", "distance": 10, "type": "corridor", "risk": "low"},
            {"from": "Library", "to": "Auditorium", "distance": 50, "type": "corridor", "risk": "low"},
            {"from": "Science_Hall", "to": "Auditorium", "distance": 55, "type": "corridor", "risk": "low"}
        ]
    },
    "Hospital": {
        "nodes": {
            "ER_Entrance": {"name": "Emergency Entrance", "type": "entrance", "x": 0, "y": 0},
            "Triage": {"name": "Triage & Reception", "type": "lobby", "x": 10, "y": 0},
            "Ward_A": {"name": "Pediatric Ward A", "type": "ward", "x": 25, "y": -15},
            "Elevator_B": {"name": "Elevator B (Bed Accessible)", "type": "elevator", "x": 30, "y": 10},
            "ICU_2F": {"name": "Intensive Care Unit (2nd Floor)", "type": "icu", "x": 45, "y": 15}
        },
        "links": [
            {"from": "ER_Entrance", "to": "Triage", "distance": 12, "type": "corridor", "risk": "low"},
            {"from": "Triage", "to": "Ward_A", "distance": 25, "type": "corridor", "risk": "low"},
            {"from": "Triage", "to": "Elevator_B", "distance": 32, "type": "corridor", "risk": "low"},
            {"from": "Elevator_B", "to": "ICU_2F", "distance": 20, "type": "corridor", "risk": "low"}
        ]
    },
    "Hotel": {
        "nodes": {
            "Lobby": {"name": "Reception Lobby", "type": "lobby", "x": 0, "y": 0},
            "Bar": {"name": "Lobby Bar (Stepped access)", "type": "bar", "x": 10, "y": -10},
            "Ramp_Bar": {"name": "Bar Side Ramp", "type": "ramp", "x": 12, "y": -5},
            "Elevator_Lobby": {"name": "Main Guest Elevator", "type": "elevator", "x": 20, "y": 10},
            "Room_305": {"name": "Room 305 (Accessible Suite)", "type": "room", "x": 35, "y": 15}
        },
        "links": [
            {"from": "Lobby", "to": "Bar", "distance": 15, "type": "stairs", "risk": "medium"},
            {"from": "Lobby", "to": "Ramp_Bar", "distance": 18, "type": "ramp", "risk": "low"},
            {"from": "Ramp_Bar", "to": "Bar", "distance": 5, "type": "corridor", "risk": "low"},
            {"from": "Lobby", "to": "Elevator_Lobby", "distance": 22, "type": "corridor", "risk": "low"},
            {"from": "Elevator_Lobby", "to": "Room_305", "distance": 40, "type": "corridor", "risk": "low"}
        ]
    }
}

class NavigationAgent(BaseAgent):
    def __init__(self):
        super().__init__("NavigationAgent")

    def plan_route(self, env_name, origin, destination, profile="WHEELCHAIR"):
        """Calculates a custom accessible path based on graph Dijkstra and model formatting."""
        if env_name not in DEMO_MAPS:
            return {"error": f"Environment '{env_name}' not found. Available: {list(DEMO_MAPS.keys())}"}
            
        graph = DEMO_MAPS[env_name]
        nodes = graph["nodes"]
        links = graph["links"]
        
        # 1. Dijkstra Pathfinding
        path_keys = self._dijkstra(nodes, links, origin, destination, profile)
        if not path_keys:
            return {
                "origin": origin,
                "destination": destination,
                "distance_meters": 0.0,
                "safety_score": 0.0,
                "estimated_minutes": 0.0,
                "path_steps": [],
                "explainability": {
                    "rationale": "No accessible route could be found matching your mobility profile constraints."
                }
            }
            
        # 2. Compile route properties
        steps = []
        total_distance = 0.0
        total_risk_penalty = 0.0
        
        for idx in range(len(path_keys) - 1):
            curr_key = path_keys[idx]
            next_key = path_keys[idx + 1]
            
            # Find the connecting link
            link = next((l for l in links if (l["from"] == curr_key and l["to"] == next_key) or (l["from"] == next_key and l["to"] == curr_key)), None)
            
            dist = link["distance"] if link else 10.0
            total_distance += dist
            
            link_type = link["type"] if link else "corridor"
            risk = link["risk"] if link else "low"
            if risk == "high":
                total_risk_penalty += 30.0
            elif risk == "medium":
                total_risk_penalty += 10.0
                
            step_instruction = self._generate_step_instruction(idx + 1, nodes[curr_key], nodes[next_key], dist, link_type, profile)
            steps.append({
                "step_number": idx + 1,
                "instruction": step_instruction,
                "accessibility_marker": link_type.upper().replace("_", " "),
                "risk_level": risk.upper()
            })
            
        safety_score = max(10, 100 - total_risk_penalty)
        estimated_minutes = round((total_distance / 1.0) / 60.0, 1)  # 1.0 m/s walking speed
        
        # 3. LLM formatting query for reasoning
        prompt = f"""
        Analyze this route in {env_name} from {origin} to {destination} for a {profile} user:
        Path steps: {json.dumps(steps)}
        Distance: {total_distance} meters
        Safety Score: {safety_score}/100
        
        Provide a concise, explainable reasoning (2 sentences max) detailing why this path is recommended and which barriers were avoided.
        """
        
        reasoning_template = {
            "rationale": "This route bypasses stairs, taking Elevator A to navigate down to the Gates. Safety score is high as all steps feature tactile guides."
        }
        
        llm_response = self.query_structured("You are GuidePilot Navigation Agent. Provide spatial explanations.", prompt, reasoning_template)
        
        return {
            "origin": nodes[origin]["name"],
            "destination": nodes[destination]["name"],
            "distance_meters": total_distance,
            "safety_score": safety_score,
            "estimated_minutes": estimated_minutes,
            "path_steps": steps,
            "explainability": llm_response
        }

    def _dijkstra(self, nodes, links, start, end, profile):
        """Graph search: Bypasses stairs for WHEELCHAIR profiles."""
        import heapq
        
        # Build adjacency
        adj = {k: [] for k in nodes}
        for link in links:
            f, t, d = link["from"], link["to"], link["distance"]
            l_type = link["type"]
            
            # Constraint check
            if profile == "WHEELCHAIR" and l_type == "stairs":
                continue # Block stairs completely for wheelchairs
                
            adj[f].append((t, d))
            adj[t].append((f, d))
            
        # Dijkstra search
        queue = [(0, start, [start])]
        visited = set()
        
        while queue:
            (cost, node, path) = heapq.heappop(queue)
            if node in visited:
                continue
                
            visited.add(node)
            if node == end:
                return path
                
            for neighbor, weight in adj[node]:
                if neighbor not in visited:
                    heapq.heappush(queue, (cost + weight, neighbor, path + [neighbor]))
                    
        return []

    def _generate_step_instruction(self, step_num, from_node, to_node, dist, l_type, profile):
        if l_type == "stairs":
            return f"Proceed up the stairs {dist} meters to {to_node['name']}."
        elif l_type == "elevator":
            return f"Enter the elevator and proceed to the level of {to_node['name']}."
        elif l_type == "ramp":
            return f"Move along the wheelchair ramp {dist} meters to reach {to_node['name']}."
        elif l_type == "tactile_path":
            prefix = "Follow the tactile guidance path " if profile == "BLIND" else "Walk along the main hallway "
            return f"{prefix}{dist} meters from {from_node['name']} to {to_node['name']}."
        else:
            return f"Walk along the corridor {dist} meters to {to_node['name']}."
