from backend.agents.navigation import DEMO_MAPS

class GuidePilotGraphService:
    def __init__(self):
        pass

    def build_knowledge_graph(self, env_name, profile="WHEELCHAIR"):
        """Constructs a 3-layer visual accessibility knowledge graph with risk edge data."""
        if env_name not in DEMO_MAPS:
            return {"nodes": [], "edges": []}

        map_data = DEMO_MAPS[env_name]
        raw_nodes = map_data["nodes"]
        raw_links = map_data["links"]

        nodes = []
        edges = []

        # ── Layer 1 & 2: Transform Nodes ──────────────────────────────────────
        for key, info in raw_nodes.items():
            n_type = info["type"]

            group = "Location"
            accessibility_val = 100
            icon = "📍"

            if n_type in ["elevator", "lift"]:
                group = "Facility"
                accessibility_val = 95
                icon = "🛗"
            elif n_type == "ramp":
                group = "Facility"
                accessibility_val = 90
                icon = "↗"
            elif n_type in ["stairs", "staircase", "steps"]:
                group = "Barrier"
                accessibility_val = 0 if profile == "WHEELCHAIR" else 55
                icon = "🪜"
            elif n_type in ["toilet", "restroom"]:
                group = "Facility"
                accessibility_val = 85
                icon = "🚻"
            elif n_type in ["entrance", "exit", "gate"]:
                group = "Location"
                accessibility_val = 100
                icon = "🚪"
            elif n_type == "crossing":
                group = "Location"
                accessibility_val = 70
                icon = "🚶"

            nodes.append({
                "id": key,
                "label": info["name"],
                "type": n_type,
                "group": group,
                "accessibility": accessibility_val,
                "icon": icon,
                "x": info["x"] * 10,
                "y": info["y"] * 10
            })

        # ── Layer 2: Transform Edges ───────────────────────────────────────────
        for link in raw_links:
            from_node = link["from"]
            to_node   = link["to"]
            l_type    = link["type"]
            risk      = link.get("risk", "low")
            distance  = link.get("distance", 0)

            relation = "AccessibleRoute"
            color    = "#00F0FF"   # cyan — clear path

            if profile == "WHEELCHAIR" and l_type in ["stairs", "staircase", "steps"]:
                relation = "BlockedRoute"
                color    = "#EF4444"  # red  — impassable
            elif risk == "high":
                relation = "DangerRoute"
                color    = "#EF4444"
            elif risk == "medium":
                relation = "CautionRoute"
                color    = "#FFB800"  # amber — caution

            edges.append({
                "from":     from_node,
                "to":       to_node,
                "relation": relation,
                "distance": distance,
                "risk":     risk,
                "color":    color
            })

        # ── Layer 3: Accessibility Intelligence overlay ────────────────────────
        nodes.append({
            "id":            "User_Pref",
            "label":         f"User: {profile}",
            "type":          "preference",
            "group":         "Preference",
            "accessibility": 100,
            "icon":          "👤",
            "x":             200,
            "y":             -150
        })

        for node in nodes:
            if node["group"] == "Barrier" and node["accessibility"] == 0:
                edges.append({
                    "from":     "User_Pref",
                    "to":       node["id"],
                    "relation": "RestrictsAccess",
                    "distance": 0,
                    "risk":     "high",
                    "color":    "#EF4444"
                })
            elif node["group"] == "Facility":
                edges.append({
                    "from":     "User_Pref",
                    "to":       node["id"],
                    "relation": "Prioritizes",
                    "distance": 0,
                    "risk":     "none",
                    "color":    "#10B981"
                })

        return {"nodes": nodes, "edges": edges}
