import json
from backend.agents.base import BaseAgent
from backend.services.translation_service import GuidePilotTranslationService

class EmergencyAgent(BaseAgent):
    def __init__(self):
        super().__init__("EmergencyAgent")

    def handle_emergency(self, active_risks, current_location=None, lang="en", model=None):
        """Analyzes risks for catastrophic events (e.g. falling or vehicle heading towards user)."""
        critical_alerts = [r for r in active_risks if r.get("level") == "HIGH"]
        
        if not critical_alerts:
            return {
                "emergency_active": False,
                "instructions": GuidePilotTranslationService.translate("all_clear", lang),
                "reroute_action": None
            }
            
        hazards = [c.get("hazard", "Obstacle") for c in critical_alerts]
        prompt = f"We have critical hazards: {', '.join(hazards)}. Generate a direct, loud emergency instruction to shout to the user to keep them safe."
        
        # Select correct localized templates
        if lang == "ar":
            template = {
                "emergency_active": True,
                "instructions": "توقف فوراً! مركبة متحركة تقترب! تحرك خطوتين لليمين فوراً.",
                "reroute_action": "TURN_BACK"
            }
        elif lang == "es":
            template = {
                "emergency_active": True,
                "instructions": "¡ALTO! ¡Vehículo acercándose! Dé dos pasos a la derecha inmediatamente.",
                "reroute_action": "TURN_BACK"
            }
        elif lang == "fr":
            template = {
                "emergency_active": True,
                "instructions": "ATTENTION! Véhicule en approche! Faites 2 pas sur le côté droit immédiatement.",
                "reroute_action": "TURN_BACK"
            }
        elif lang == "de":
            template = {
                "emergency_active": True,
                "instructions": "HALT! Fahrzeug nähert sich! Gehen Sie sofort zwei Schritte nach rechts.",
                "reroute_action": "TURN_BACK"
            }
        else:
            template = {
                "emergency_active": True,
                "instructions": "STOP! Moving vehicle approaching! Move 2 steps right immediately.",
                "reroute_action": "TURN_BACK"
            }
            
        result = self.query_structured("You are GuidePilot Emergency Agent. Issue loud, concise warning instructions.", prompt, template, lang=lang, model=model)
        return result
