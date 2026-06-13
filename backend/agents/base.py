import json
import re
import requests
from backend import config
from backend.services.translation_service import GuidePilotTranslationService

class BaseAgent:
    def __init__(self, agent_name: str, default_model: str = None):
        self.agent_name = agent_name
        self.default_model = default_model or config.DEFAULT_MODEL
        self.api_url = f"{config.OLLAMA_BASE_URL}/api/generate"

    def __init_subclass__(cls, **kwargs):
        """Auto-registers any subclass of BaseAgent into the AgentRegistry."""
        super().__init_subclass__(**kwargs)
        try:
            from backend.agents.agent_registry import AgentRegistry
            AgentRegistry.register_class(cls.__name__, cls)
        except ImportError:
            # Registry not imported yet during bootstrap, registry will resolve later
            pass

    def query_ollama(self, system_prompt: str, user_prompt: str, temperature: float = 0.2, lang: str = "en", model: str = None) -> str:
        """Sends query to Ollama LLM. Injects language constraints and falls back to simulated response if offline."""
        target_model = model or self.default_model
        
        # Inject multilingual instruction
        localized_system = GuidePilotTranslationService.inject_prompt_instruction(system_prompt, lang)
        
        payload = {
            "model": target_model,
            "prompt": f"System: {localized_system}\n\nUser: {user_prompt}",
            "system": localized_system,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        
        try:
            response = requests.post(self.api_url, json=payload, timeout=6)
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
        except Exception as e:
            print(f"[{self.agent_name}] Ollama connection failed: {e}. Executing offline translated fallback.")
            
        return self._generate_fallback(user_prompt, lang)

    def query_structured(self, system_prompt: str, user_prompt: str, structure_template: dict, lang: str = "en", model: str = None) -> dict:
        """Forces JSON structure from LLM, with fallback validation."""
        extended_system = f"{system_prompt}\nYour response MUST be a valid JSON object matching the following structure: {json.dumps(structure_template)}. Respond ONLY with the JSON string, do not include code block markdown like ```json."
        
        raw_response = self.query_ollama(extended_system, user_prompt, lang=lang, model=model)
        
        # Clean response string to extract JSON
        cleaned = raw_response.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1].split("```")[0].strip()
            
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Try parsing with regular expressions
            try:
                match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
            except Exception:
                pass
            
            print(f"[{self.agent_name}] JSON parsing failed for response snippet. Using translated fallback.")
            return self._generate_fallback_structured(user_prompt, structure_template, lang)

    def _generate_fallback(self, user_prompt: str, lang: str = "en") -> str:
        """Simple rule-based localized fallback response for general agents."""
        prompt_lower = user_prompt.lower()
        if "hello" in prompt_lower or "hi" in prompt_lower:
            if lang == "ar":
                return "مرحباً، أنا GuidePilot، مساعد التنقل الخاص بك دون اتصال بالإنترنت. كيف يمكنني مساعدتك اليوم؟"
            elif lang == "es":
                return "Hola, soy GuidePilot, su asistente de movilidad fuera de línea. ¿Cómo puedo ayudarle hoy?"
            elif lang == "fr":
                return "Bonjour, je suis GuidePilot, votre assistant de mobilité hors ligne. Comment puis-je vous aider aujourd'hui?"
            elif lang == "de":
                return "Hallo, ich bin GuidePilot, Ihr Offline-Mobilitätsassistent. Wie kann ich Ihnen heute helfen?"
            return "Hello, I am GuidePilot, your offline accessibility assistant. How can I help you navigate safely today?"
            
        # Check standard translated safety sentences
        if "stairs" in prompt_lower or "staircase" in prompt_lower:
            if "halt" in prompt_lower or "stop" in prompt_lower:
                return GuidePilotTranslationService.translate("stair_warn_halt", lang, dist="2.0")
            return GuidePilotTranslationService.translate("stair_warn_slow", lang, dist="3.0")
        elif "vehicle" in prompt_lower or "car" in prompt_lower:
            return GuidePilotTranslationService.translate("vehicle_warn", lang, dist="1.5")
        elif "clear" in prompt_lower:
            return GuidePilotTranslationService.translate("pathway_clear", lang)
            
        if lang == "ar":
            return "[رد محاكاة] بناءً على السياق المكاني المحلي، الطريق آمن. يرجى المتابعة بحذر."
        elif lang == "es":
            return "[Respuesta simulada] Según el contexto espacial local, la ruta está despejada. Por favor proceda con precaución."
        elif lang == "fr":
            return "[Réponse simulée] Selon le contexte spatial local, l'itinéraire est dégagé. Veuillez procéder avec prudence."
        elif lang == "de":
            return "[Simulierte Antwort] Basierend auf dem lokalen räumlichen Kontext ist die Route frei. Bitte gehen Sie mit Vorsicht vor."
        return f"[Simulated Response] Based on local spatial context, the route is clear. Please proceed with caution. GuidePilot offline logic active."

    def _generate_fallback_structured(self, user_prompt: str, structure_template: dict, lang: str = "en") -> dict:
        """Fills structural template with localized mock data for offline usage."""
        mock = structure_template.copy()
        
        # Simple heuristics to populate mock structure
        for key in mock:
            if isinstance(mock[key], str):
                if "explain" in key or "rationale" in key or "summary" in key:
                    if lang == "ar":
                        mock[key] = "النظام في وضع المحاكاة دون اتصال بالإنترنت. المتابعة بقواعد الأمان أولاً."
                    elif lang == "es":
                        mock[key] = "Sistema en modo de simulación fuera de línea. Procediendo con reglas de seguridad primero."
                    elif lang == "fr":
                        mock[key] = "Système en mode de simulation hors ligne. Règle de sécurité d'abord."
                    elif lang == "de":
                        mock[key] = "System im Offline-Simulationsmodus. Sicherheitsregeln zuerst."
                    else:
                        mock[key] = "System in offline simulation mode. Proceeding with safety-first navigation heuristics."
                elif "status" in key:
                    mock[key] = "ACCESSIBLE"
                elif "instructions" in key or "warning" in key:
                    mock[key] = self._generate_fallback(user_prompt, lang)
                else:
                    mock[key] = f"Mocked {key}"
            elif isinstance(mock[key], int) or isinstance(mock[key], float):
                if "score" in key:
                    mock[key] = 85
                elif "distance" in key:
                    mock[key] = 5.0
                else:
                    mock[key] = 1
            elif isinstance(mock[key], list):
                mock[key] = []
            elif isinstance(mock[key], dict):
                mock[key] = {}
                
        return mock
