import json
from backend.agents.base import BaseAgent
from backend.services.translation_service import GuidePilotTranslationService

class VisionAgent(BaseAgent):
    def __init__(self):
        super().__init__("VisionAgent")

    def describe_scene(self, detections, mode="ACCESSIBILITY", lang="en", model=None):
        """Compiles scene description using spatial layout coordinate heuristics and LLM prompts."""
        if not detections:
            return {
                "detailed": GuidePilotTranslationService.translate("pathway_clear", lang),
                "simplified": GuidePilotTranslationService.translate("pathway_clear_simple", lang),
                "accessibility_notes": GuidePilotTranslationService.translate("no_barriers", lang)
            }
            
        # Group detections by relative position
        descriptions = []
        for det in detections:
            label = det.get("label", "Object")
            dist = det.get("distance_meters", 3.0)
            box = det.get("bounding_box", [0, 0, 1, 1])
            
            # Position calculation based on horizontal bounding box center
            center_x = (box[0] + box[2]) / 2.0 if len(box) >= 4 else 320
            # Assume image width is 640
            if center_x < 220:
                pos = "to your left"
                if lang == "ar": pos = "على يسارك"
                elif lang == "es": pos = "a su izquierda"
                elif lang == "fr": pos = "sur votre gauche"
                elif lang == "de": pos = "zu Ihrer Linken"
            elif center_x > 420:
                pos = "to your right"
                if lang == "ar": pos = "على يمينك"
                elif lang == "es": pos = "a su derecha"
                elif lang == "fr": pos = "sur votre droite"
                elif lang == "de": pos = "zu Ihrer Rechten"
            else:
                pos = "directly ahead"
                if lang == "ar": pos = "أمامك مباشرة"
                elif lang == "es": pos = "directamente adelante"
                elif lang == "fr": pos = "directement devant vous"
                elif lang == "de": pos = "direkt vor Ihnen"
                
            label_translated = GuidePilotTranslationService.translate(label.lower(), lang)
            if label_translated == label.lower():
                # Try singular labels
                label_translated = GuidePilotTranslationService.translate(label.lower().rstrip("s"), lang)
                
            if lang == "ar":
                descriptions.append(f"{label_translated} يقع على بعد {dist:.1f} متر {pos}")
            elif lang == "es":
                descriptions.append(f"un {label_translated.lower()} ubicado a {dist:.1f} metros {pos}")
            elif lang == "fr":
                descriptions.append(f"un {label_translated.lower()} situé à {dist:.1f} mètres {pos}")
            elif lang == "de":
                descriptions.append(f"ein {label_translated.lower()} befindet sich {dist:.1f} Meter {pos}")
            else:
                descriptions.append(f"a {label.lower()} located {dist:.1f} meters {pos}")
            
        scene_summary = ", and ".join(descriptions)
        
        # Structure payload
        system_prompt = "You are GuidePilot Vision Agent. Synthesize spatial detections into descriptive voice-guide snippets."
        user_prompt = f"Convert these detected items into detailed, simplified, and accessibility-specific scene summaries: {scene_summary}."
        
        # Provide templates matching selected language
        if lang == "ar":
            template = {
                "detailed": "أنت تقف في ممر. يوجد درج على بعد 2 متر أمامك مباشرة، ويوجد مدخل مصعد على يمينك.",
                "simplified": "درج أمامك. مصعد على اليمين.",
                "accessibility_notes": "الدرج يفتقر إلى المؤشرات الحسية الملموسة. مدخل المصعد عرضه قياسي ومناسب للكراسي المتحركة."
            }
        elif lang == "es":
            template = {
                "detailed": "Está de pie en un pasillo. Una escalera está a 2 metros directamente adelante y una entrada de ascensor está a su derecha.",
                "simplified": "Escaleras adelante. Ascensor a la derecha.",
                "accessibility_notes": "La escalera carece de indicadores de seguridad. El ancho del ascensor parece estándar."
            }
        elif lang == "fr":
            template = {
                "detailed": "Vous êtes debout dans un couloir. Un escalier se trouve à 2 mètres directement devant vous, et un ascenseur est situé sur votre droite.",
                "simplified": "Escalier devant. Ascenseur à droite.",
                "accessibility_notes": "L'escalier manque de bandes podotactiles. La largeur de la porte de l'ascenseur est standard."
            }
        elif lang == "de":
            template = {
                "detailed": "Sie stehen in einem Flur. Eine Treppe befindet sich 2 Meter direkt vor Ihnen, und ein Aufzugseingang befindet sich zu Ihrer Rechten.",
                "simplified": "Treppe voraus. Aufzug rechts.",
                "accessibility_notes": "Der Treppe fehlen Sicherheitsmarkierungen. Der Aufzugseingang hat eine Standardbreite."
            }
        else:
            template = {
                "detailed": "You are standing in a corridor. A staircase is 2 meters directly ahead, and a doorway is located to your right.",
                "simplified": "Stairs ahead. Door on right.",
                "accessibility_notes": "Staircase lacks safety indicators. Doorway width appears standard (90cm)."
            }
        
        result = self.query_structured(system_prompt, user_prompt, template, lang=lang, model=model)
        return result
