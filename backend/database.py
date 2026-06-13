import sqlite3
import json
from datetime import datetime
from backend import config

def get_db_connection():
    conn = sqlite3.connect(config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def db_init():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. User Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        profile_name TEXT NOT NULL,
        accessibility_profile TEXT CHECK(accessibility_profile IN ('WHEELCHAIR', 'BLIND', 'ELDERLY', 'TEMPORARY')) DEFAULT 'WHEELCHAIR',
        high_contrast_mode INTEGER DEFAULT 0,
        text_size_scale INTEGER DEFAULT 100,
        voice_guidance_enabled INTEGER DEFAULT 1,
        preferred_ollama_model TEXT DEFAULT 'llama3',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. Saved Routes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_routes (
        route_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        origin_name TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        path_coordinates_json TEXT NOT NULL,
        safety_score REAL NOT NULL,
        distance_meters REAL NOT NULL,
        route_type TEXT CHECK(route_type IN ('WHEELCHAIR', 'BLIND', 'ELDERLY', 'TEMPORARY', 'VISION_MARKER', 'SHORTEST')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
    )
    """)
    
    # 3. Accessibility Reports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS accessibility_reports (
        report_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        building_name TEXT NOT NULL,
        location_address TEXT,
        accessibility_score INTEGER CHECK(accessibility_score BETWEEN 0 AND 100),
        certification_status TEXT CHECK(certification_status IN ('ACCESSIBLE', 'CONDITIONAL', 'BARRIER_PRONE')),
        detected_facilities_json TEXT,
        detected_barriers_json TEXT,
        recommendations_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
    )
    """)
    
    # 4. Memory Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memory_logs (
        memory_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        interaction_type TEXT NOT NULL,
        query_text TEXT NOT NULL,
        response_text TEXT NOT NULL,
        extracted_entities_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
    )
    """)
    
    # 5. Coaching Stats Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coaching_stats (
        stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        daily_distance_meters REAL DEFAULT 0.0,
        risk_alerts_avoided INTEGER DEFAULT 0,
        independence_index REAL DEFAULT 50.0,
        personalized_tips_json TEXT,
        recorded_date DATE DEFAULT CURRENT_DATE,
        FOREIGN KEY(user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
    )
    """)
    
    # 6. Persistent Environment Maps Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS environment_maps (
        env_name TEXT PRIMARY KEY,
        nodes_json TEXT NOT NULL,
        links_json TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_routes_user ON saved_routes(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_building ON accessibility_reports(building_name)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_logs(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_coaching_user_date ON coaching_stats(user_id, recorded_date)")
    
    # Insert default user profile if not present
    cursor.execute("SELECT 1 FROM user_profiles WHERE user_id = 'default_user'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO user_profiles (user_id, profile_name, accessibility_profile, high_contrast_mode, text_size_scale, voice_guidance_enabled, preferred_ollama_model)
        VALUES ('default_user', 'Default User', 'WHEELCHAIR', 0, 100, 1, 'llama3')
        """)
        
    conn.commit()
    conn.close()

# Database helper functions

def get_user_profile(user_id='default_user'):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def update_user_profile(user_id, profile_name, accessibility_profile, high_contrast_mode, text_size_scale, voice_guidance_enabled, preferred_ollama_model):
    conn = get_db_connection()
    conn.execute("""
    UPDATE user_profiles
    SET profile_name = ?, accessibility_profile = ?, high_contrast_mode = ?, text_size_scale = ?, voice_guidance_enabled = ?, preferred_ollama_model = ?
    WHERE user_id = ?
    """, (profile_name, accessibility_profile, int(high_contrast_mode), text_size_scale, int(voice_guidance_enabled), preferred_ollama_model, user_id))
    conn.commit()
    conn.close()
    return get_user_profile(user_id)

def add_saved_route(user_id, origin_name, destination_name, path_coordinates, safety_score, distance_meters, route_type):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO saved_routes (user_id, origin_name, destination_name, path_coordinates_json, safety_score, distance_meters, route_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, origin_name, destination_name, json.dumps(path_coordinates), safety_score, distance_meters, route_type))
    conn.commit()
    route_id = cursor.lastrowid
    conn.close()
    return route_id

def get_saved_routes(user_id='default_user'):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM saved_routes WHERE user_id = ? ORDER BY created_at DESC", (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_accessibility_report(user_id, building_name, location_address, accessibility_score, certification_status, detected_facilities, detected_barriers, recommendations):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO accessibility_reports (user_id, building_name, location_address, accessibility_score, certification_status, detected_facilities_json, detected_barriers_json, recommendations_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, building_name, location_address, accessibility_score, certification_status, json.dumps(detected_facilities), json.dumps(detected_barriers), json.dumps(recommendations)))
    conn.commit()
    report_id = cursor.lastrowid
    conn.close()
    return report_id

def get_accessibility_reports(user_id='default_user'):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM accessibility_reports WHERE user_id = ? ORDER BY created_at DESC", (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_memory_log(user_id, interaction_type, query_text, response_text, extracted_entities=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO memory_logs (user_id, interaction_type, query_text, response_text, extracted_entities_json)
    VALUES (?, ?, ?, ?, ?)
    """, (user_id, interaction_type, query_text, response_text, json.dumps(extracted_entities or {})))
    conn.commit()
    conn.close()

def get_memory_logs(user_id='default_user', limit=10):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM memory_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_coaching_stats(user_id, delta_distance, risk_alerts_avoided_delta, current_independence):
    conn = get_db_connection()
    date_str = datetime.now().date().isoformat()
    row = conn.execute("SELECT * FROM coaching_stats WHERE user_id = ? AND recorded_date = ?", (user_id, date_str)).fetchone()
    
    tips = [
        "Take the elevator detour on Corridor 2 to practice using low-risk pathways.",
        "Your independence score increased because you navigated independently with zero emergency triggers today!",
        "Try scanning new blueprints before visiting to raise your environmental familiarity."
    ]
    
    if row:
        conn.execute("""
        UPDATE coaching_stats
        SET daily_distance_meters = daily_distance_meters + ?,
            risk_alerts_avoided = risk_alerts_avoided + ?,
            independence_index = ?
        WHERE user_id = ? AND recorded_date = ?
        """, (delta_distance, risk_alerts_avoided_delta, current_independence, user_id, date_str))
    else:
        conn.execute("""
        INSERT INTO coaching_stats (user_id, daily_distance_meters, risk_alerts_avoided, independence_index, personalized_tips_json, recorded_date)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, delta_distance, risk_alerts_avoided_delta, current_independence, json.dumps(tips), date_str))
        
    conn.commit()
    conn.close()

def get_coaching_history(user_id='default_user'):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM coaching_stats WHERE user_id = ? ORDER BY recorded_date ASC", (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Environment Map Persistence Functions

def get_environment_map(env_name: str):
    """Retrieves nodes and edges for a scanned environment."""
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM environment_maps WHERE env_name = ?", (env_name,)).fetchone()
    conn.close()
    if row:
        return {
            "env_name": row["env_name"],
            "nodes": json.loads(row["nodes_json"]),
            "links": json.loads(row["links_json"])
        }
    return None

def save_environment_map(env_name: str, nodes: dict, links: list):
    """Saves or completely overwrites an environment map."""
    conn = get_db_connection()
    conn.execute("""
    INSERT OR REPLACE INTO environment_maps (env_name, nodes_json, links_json, last_updated)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    """, (env_name, json.dumps(nodes), json.dumps(links)))
    conn.commit()
    conn.close()

def merge_environment_map(env_name: str, new_nodes: dict, new_links: list):
    """Loads previous map, merges new observations, and updates SQLite dynamically."""
    existing = get_environment_map(env_name)
    if not existing:
        save_environment_map(env_name, new_nodes, new_links)
        return get_environment_map(env_name)

    nodes = existing["nodes"]
    links = existing["links"]

    # 1. Merge Nodes (keyed by name/ID)
    for node_id, node_info in new_nodes.items():
        # Update or add node info
        nodes[node_id] = node_info

    # 2. Merge Links/Edges
    for link in new_links:
        # Check if identical link exists (regardless of direction)
        match = next((l for l in links if 
                      (l["from"] == link["from"] and l["to"] == link["to"]) or
                      (l["from"] == link["to"] and l["to"] == link["from"])), None)
        if match:
            # Update values with latest observations
            match["distance"] = link.get("distance", match["distance"])
            match["type"] = link.get("type", match["type"])
            match["risk"] = link.get("risk", match["risk"])
        else:
            links.append(link)

    save_environment_map(env_name, nodes, links)
    return get_environment_map(env_name)

