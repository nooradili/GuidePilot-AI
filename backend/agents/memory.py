from backend import database
from backend.agents.base import BaseAgent

class MemoryAgent(BaseAgent):
    def __init__(self):
        super().__init__("MemoryAgent")

    def load_profile(self, user_id='default_user'):
        profile = database.get_user_profile(user_id)
        if not profile:
            # Re-initialize DB
            database.db_init()
            profile = database.get_user_profile(user_id)
        return profile

    def save_profile(self, user_id, name, acc_profile, high_contrast, text_scale, voice_guidance, model):
        return database.update_user_profile(
            user_id, name, acc_profile, high_contrast, text_scale, voice_guidance, model
        )

    def get_route_history(self, user_id='default_user'):
        return database.get_saved_routes(user_id)

    def save_route(self, user_id, origin, destination, path_coords, safety_score, distance, route_type):
        return database.add_saved_route(
            user_id, origin, destination, path_coords, safety_score, distance, route_type
        )

    def record_interaction(self, user_id, interaction_type, query, response, entities=None):
        database.add_memory_log(user_id, interaction_type, query, response, entities)

    def get_coaching_metrics(self, user_id='default_user'):
        history = database.get_coaching_history(user_id)
        
        # Calculate totals
        total_distance = sum(h["daily_distance_meters"] for h in history)
        total_risk_avoided = sum(h["risk_alerts_avoided"] for h in history)
        latest_independence = history[-1]["independence_index"] if history else 50.0
        
        tips = []
        if history and history[-1].get("personalized_tips_json"):
            import json
            tips = json.loads(history[-1]["personalized_tips_json"])
            
        return {
            "total_distance_meters": total_distance,
            "total_risk_alerts_avoided": total_risk_avoided,
            "latest_independence_score": latest_independence,
            "personalized_tips": tips,
            "history": history
        }

    def record_daily_activity(self, user_id, distance_delta, risks_delta, independence_score):
        database.update_coaching_stats(user_id, distance_delta, risks_delta, independence_score)
