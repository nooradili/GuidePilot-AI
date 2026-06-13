from backend.agents.base import BaseAgent

class ExplainabilityAgent(BaseAgent):
    def __init__(self):
        super().__init__("ExplainabilityAgent")

    def explain_decision(self, context_type, decision_data):
        """Generates human-readable, logical explanations for AI decisions."""
        prompt = f"""
        Explain the following AI decision in detail:
        Context Type: {context_type}
        Decision Data: {decision_data}
        
        Provide:
        1. Primary reason for decision
        2. Alternatives that were filtered out
        3. Confidence level estimate (0-100)
        """
        
        template = {
            "primary_reason": "The path bypasses the main hall due to steep stairs. Elevator access is active.",
            "alternatives_rejected": "Stairwell B (Rejected: inaccessible for wheelchair profile).",
            "confidence_percent": 95
        }
        
        result = self.query_structured("You are GuidePilot Explainability Agent. Break down and explain AI reasoning.", prompt, template)
        return result
