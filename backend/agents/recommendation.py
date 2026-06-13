import json
from backend.agents.base import BaseAgent

class RecommendationAgent(BaseAgent):
    def __init__(self):
        super().__init__("RecommendationAgent")

    def generate_recommendations(self, barriers):
        """Generates prioritized recommendations and projected scores based on detected obstacles."""
        if not barriers:
            return {
                "recommendations": [],
                "projections": {
                    "accessibility_improvement_potential": 0,
                    "risk_reduction_potential": 0,
                    "independence_increase_potential": 0
                }
            }
            
        prompt = f"Analyze these building barriers: {json.dumps(barriers)}. Generate prioritized solutions, difficulty ratings, and projected score improvements."
        
        template = {
            "recommendations": [
                {
                    "priority": 1,
                    "issue": "Missing wheelchair ramp near atrium entrance.",
                    "suggestion": "Install modular rubber ramp with 1:12 slope at North Entrance.",
                    "difficulty": "Easy",
                    "estimated_cost": "$250"
                }
            ],
            "projections": {
                "accessibility_improvement_potential": 15,
                "risk_reduction_potential": 20,
                "independence_increase_potential": 18
            }
        }
        
        result = self.query_structured("You are GuidePilot Accessibility Recommendation Agent. Generate actionable facilities improvement plans.", prompt, template)
        return result
