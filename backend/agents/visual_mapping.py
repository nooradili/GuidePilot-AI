# GuidePilot Visual Mapping Agent
# Constructs spatial environments from visual observations and compiles a 3-layer Hybrid Knowledge Graph.

import math
from typing import Dict, List, Any
from backend.agents.base import BaseAgent
from backend import database

class VisualMappingAgent(BaseAgent):
    def __init__(self):
        super().__init__("VisualMappingAgent")

    def get_hybrid_graph(self, env_name: str, profile: str = "WHEELCHAIR") -> Dict[str, Any]:
        """
        Compiles the 3-Layer Hybrid Knowledge Graph architecture:
        - Layer 1: Dynamic Vision Graph (detected physical objects, bounds, coordinates)
        - Layer 2: Semantic Knowledge Graph (categories, relationships, names)
        - Layer 3: Accessibility Intelligence Graph (mobility restrictions, rating scores, priorities)
        """
        env_map = database.get_environment_map(env_name)
        if not env_map:
            # Return empty structure if not initialized yet
            return {"nodes": [], "edges": [], "layers": {
                "layer1_vision": {"nodes": [], "edges": []},
                "layer2_semantic": {"nodes": [], "edges": []},
                "layer3_intelligence": {"nodes": [], "edges": []}
            }}

        raw_nodes = env_map["nodes"]
        raw_links = env_map["links"]

        nodes = []
        edges = []

        # --- LAYER 1: Dynamic Vision Graph & LAYER 2: Semantic Knowledge Graph ---
        for node_id, info in raw_nodes.items():
            n_type = info.get("type", "corridor")
            
            # Map type to visual groups, safety scores, and labels
            group = "Location"
            accessibility_val = 100
            
            if n_type in ["elevator", "ramp"]:
                group = "Facility"
                accessibility_val = 95
            elif n_type in ["stairs", "staircase"]:
                group = "Barrier"
                accessibility_val = 0 if profile == "WHEELCHAIR" else 60
            elif n_type in ["toilet", "restroom"]:
                group = "Facility"
                accessibility_val = 90
            elif n_type in ["cone", "obstacle", "hazard", "box"]:
                group = "Barrier"
                accessibility_val = 30
            elif n_type in ["vehicle", "car"]:
                group = "Barrier"
                accessibility_val = 10

            nodes.append({
                "id": node_id,
                "label": info.get("name", node_id),
                "group": group,
                "type": n_type,
                "accessibility": accessibility_val,
                "x": info.get("x", 0),
                "y": info.get("y", 0),
                "confidence": info.get("confidence", 0.9)
            })

        for link in raw_links:
            from_node = link["from"]
            to_node = link["to"]
            l_type = link.get("type", "corridor")
            risk = link.get("risk", "low")

            # Layer 2 Semantic relationships
            relation = "ConnectedRoute"
            color = "#00F0FF" # Default Neon Cyan

            # Layer 3 Accessibility checks
            if profile == "WHEELCHAIR" and l_type in ["stairs", "staircase"]:
                relation = "BlockedRoute"
                color = "#EF4444" # Red
            elif risk == "high":
                relation = "DangerRoute"
                color = "#EF4444"
            elif risk == "medium":
                relation = "CautionRoute"
                color = "#FFB800" # Amber
            elif l_type == "ramp":
                relation = "AccessibleRamp"
                color = "#10B981" # Green
            elif l_type == "elevator":
                relation = "AccessibleElevator"
                color = "#10B981"

            edges.append({
                "from": from_node,
                "to": to_node,
                "relation": relation,
                "distance": link.get("distance", 5.0),
                "color": color,
                "layer": "layer2_semantic"
            })

        # --- LAYER 3: Accessibility Intelligence Layer ---
        # Append User Preference as a reasoning node
        user_node_id = "User_Pref"
        nodes.append({
            "id": user_node_id,
            "label": f"User: {profile}",
            "group": "Preference",
            "type": "user_profile",
            "accessibility": 100,
            "x": 100,
            "y": -120,
            "confidence": 1.0
        })

        # Link profile dynamically to elements it directly prioritizes or restricts
        for node in nodes:
            if node["id"] == user_node_id:
                continue
                
            if node["group"] == "Barrier" and node["accessibility"] <= 30:
                edges.append({
                    "from": user_node_id,
                    "to": node["id"],
                    "relation": "RestrictsAccess",
                    "distance": 0.0,
                    "color": "#EF4444",
                    "layer": "layer3_intelligence"
                })
            elif node["group"] == "Facility":
                edges.append({
                    "from": user_node_id,
                    "to": node["id"],
                    "relation": "Prioritizes",
                    "distance": 0.0,
                    "color": "#10B981",
                    "layer": "layer3_intelligence"
                })

        # Compile explicit sub-layers for advanced graph visualization
        layer1_nodes = [n for n in nodes if n["id"] != user_node_id]
        layer1_edges = [{**e, "relation": "PhysicalLink"} for e in edges if e["layer"] == "layer2_semantic"]

        layer2_nodes = [n for n in nodes if n["id"] != user_node_id]
        layer2_edges = [e for e in edges if e["layer"] == "layer2_semantic"]

        layer3_nodes = nodes
        layer3_edges = edges

        return {
            "nodes": nodes,
            "edges": edges,
            "layers": {
                "layer1_vision": {"nodes": layer1_nodes, "edges": layer1_edges},
                "layer2_semantic": {"nodes": layer2_nodes, "edges": layer2_edges},
                "layer3_intelligence": {"nodes": layer3_nodes, "edges": layer3_edges}
            }
        }

    def update_map_from_detections(self, env_name: str, detections: List[Dict[str, Any]], elapsed_seconds: float):
        """
        Parses active camera detections, maps them to dynamic 2D coordinates
        along the path, merges redundant spatial observations, and commits to database.
        """
        # Load or initialize map
        env_map = database.get_environment_map(env_name)
        if env_map:
            nodes = env_map["nodes"]
            links = env_map["links"]
        else:
            nodes = {
                "Start_Point": {"name": "Scan Start lobby", "type": "entrance", "x": 150, "y": 0, "confidence": 1.0}
            }
            links = []

        # Current user walking timeline coordinate
        user_x = 150
        user_y = int(elapsed_seconds * 12)  # Walk forward in units over time
        
        # Link previous dynamic node to user's timeline progression
        current_node_id = f"Path_Pt_{int(elapsed_seconds)}"
        nodes[current_node_id] = {
            "name": f"Pathway Corridor (Scan Pt)",
            "type": "corridor",
            "x": user_x,
            "y": user_y,
            "confidence": 0.95
        }
        
        # Link last point to this new point
        prev_node_id = "Start_Point"
        if len(nodes) > 2:
            # Find the most recently added path point
            path_nodes = [nid for nid in nodes if nid.startswith("Path_Pt_")]
            if path_nodes:
                path_nodes.sort(key=lambda nid: int(nid.split("_")[-1]))
                if len(path_nodes) > 1:
                    prev_node_id = path_nodes[-2]
                    
        links.append({
            "from": prev_node_id,
            "to": current_node_id,
            "distance": 8,
            "type": "corridor",
            "risk": "low"
        })

        # Process frame detections
        for det in detections:
            label = det.get("label", "Object")
            confidence = det.get("confidence", 0.8)
            dist_m = det.get("distance_meters", 3.0)
            box = det.get("bounding_box", [0, 0, 1, 1])

            # Map category type
            n_type = "obstacle"
            label_lower = label.lower()
            if "elevator" in label_lower:
                n_type = "elevator"
            elif "stair" in label_lower or "step" in label_lower:
                n_type = "stairs"
            elif "ramp" in label_lower:
                n_type = "ramp"
            elif "restroom" in label_lower or "toilet" in label_lower or "bathroom" in label_lower:
                n_type = "toilet"
            elif "cone" in label_lower:
                n_type = "cone"
            elif "vehicle" in label_lower or "car" in label_lower:
                n_type = "vehicle"
            elif "door" in label_lower:
                n_type = "exit"

            # 2D relative angle offset calculation
            center_x = (box[0] + box[2]) / 2.0 if len(box) >= 4 else 320
            # Center of standard 640 width is 320
            offset_factor = (center_x - 320) / 320.0  # -1.0 to 1.0
            
            # Map coordinates ahead of user timeline
            det_x = user_x + int(offset_factor * 80)
            det_y = user_y + int(dist_m * 12)

            # Spatial Consolidation: merge with existing node of same type if within distance
            matched_node_id = None
            for nid, ninfo in nodes.items():
                if ninfo.get("type") == n_type:
                    dx = ninfo.get("x", 0) - det_x
                    dy = ninfo.get("y", 0) - det_y
                    dist_units = math.sqrt(dx*dx + dy*dy)
                    if dist_units < 35: # Spatial tolerance limit
                        matched_node_id = nid
                        break

            if matched_node_id:
                # Update existing matched node with stronger confidence and updated distance coordinates
                nodes[matched_node_id]["confidence"] = max(nodes[matched_node_id]["confidence"], confidence)
                # Keep average position
                nodes[matched_node_id]["x"] = int((nodes[matched_node_id]["x"] + det_x) / 2)
                nodes[matched_node_id]["y"] = int((nodes[matched_node_id]["y"] + det_y) / 2)
            else:
                # Create a new spatial node
                new_id = f"{n_type.capitalize()}_{int(elapsed_seconds)}_{len(nodes)}"
                nodes[new_id] = {
                    "name": f"Detected {label}",
                    "type": n_type,
                    "x": det_x,
                    "y": det_y,
                    "confidence": confidence
                }

                # Link from current corridor point to the detected landmark
                links.append({
                    "from": current_node_id,
                    "to": new_id,
                    "distance": int(dist_m),
                    "type": n_type,
                    "risk": "medium" if n_type in ["stairs", "cone", "vehicle"] else "low"
                })

        # Save merged mapping back to SQLite
        database.merge_environment_map(env_name, nodes, links)
        return {"status": "updated", "node_count": len(nodes), "link_count": len(links)}
