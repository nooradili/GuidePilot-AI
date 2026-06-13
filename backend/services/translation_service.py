# GuidePilot Multilingual Translation System
# Supports English (en), Arabic (ar), Spanish (es), French (fr), and German (de)

from typing import Dict, Any

TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        "pathway_clear": "The pathway ahead appears clear. No immediate obstacles detected.",
        "pathway_clear_simple": "Pathway clear.",
        "no_barriers": "No barriers or facilities detected in immediate proximity.",
        "stair_warn_slow": "Staircase ahead {dist} meters. Slow down.",
        "stair_warn_halt": "Inaccessible stair hazard detected {dist} meters ahead! Halt immediately.",
        "obstacle_warn": "Collision risk: obstacle {label} detected {dist} meters ahead.",
        "vehicle_warn": "Danger! Moving vehicle detected {dist} meters ahead.",
        "elevator_stairs_alternative": "Warning. Stairs detected ahead. Elevator available on your right side.",
        "route_summary": "Route planned. Total distance {dist} meters. Safety score {score} percent. First step: {step}",
        "emergency_halt": "STOP! Moving vehicle approaching! Move 2 steps right immediately.",
        "all_clear": "All systems operating normally.",
        "stairs": "Staircase",
        "elevator": "Elevator Entrance",
        "tactile": "Tactile Path",
        "cone": "Construction Cone",
        "vehicle": "Vehicle",
        "counter": "Reception Counter",
        "restroom": "Restroom Door",
        "ramp": "Wheelchair Ramp",
        "corridor": "Corridor",
        "exit": "Exit Door"
    },
    "ar": {
        "pathway_clear": "يبدو الممر أمامك خالياً. لم يتم الكشف عن أي عوائق مباشرة.",
        "pathway_clear_simple": "الممر آمن للعبور.",
        "no_barriers": "لم يتم الكشف عن عوائق أو مرافق في المحيط المباشر.",
        "stair_warn_slow": "يوجد درج أمامك على بعد {dist} متر. يرجى إبطاء السرعة.",
        "stair_warn_halt": "خطر! درج غير ميسر للكراسي المتحركة على بعد {dist} متر! توقف فوراً.",
        "obstacle_warn": "خطر الاصطدام: تم الكشف عن عقبة {label} على بعد {dist} متر أمامك.",
        "vehicle_warn": "خطر! مركبة متحركة تقترب على بعد {dist} متر أمامك.",
        "elevator_stairs_alternative": "تحذير. تم رصد درج أمامك. المصعد متوفر على يمينك.",
        "route_summary": "تم تخطيط المسار. المسافة الإجمالية {dist} متر. درجة الأمان {score} بالمائة. الخطوة الأولى: {step}",
        "emergency_halt": "قفو! مركبة متحركة تقترب! تحرك خطوتين لليمين فوراً.",
        "all_clear": "جميع الأنظمة تعمل بشكل طبيعي.",
        "stairs": "درج",
        "elevator": "مدخل المصعد",
        "tactile": "المسار الحسي للمكفوفين",
        "cone": "مخروط بناء",
        "vehicle": "مركبة",
        "counter": "مكتب الاستقبال",
        "restroom": "باب دورة المياه",
        "ramp": "منحدر كراسي متحركة",
        "corridor": "ممر",
        "exit": "مخرج الطوارئ"
    },
    "es": {
        "pathway_clear": "El camino por delante parece despejado. No se detectan obstáculos inmediatos.",
        "pathway_clear_simple": "Camino despejado.",
        "no_barriers": "No se detectaron barreras ni instalaciones en la proximidad inmediata.",
        "stair_warn_slow": "Escalera adelante a {dist} metros. Reduzca la velocidad.",
        "stair_warn_halt": "¡Peligro de escalera inaccesible detectado a {dist} metros! Deténgase inmediatamente.",
        "obstacle_warn": "Riesgo de colisión: obstáculo {label} detectado a {dist} metros adelante.",
        "vehicle_warn": "¡Peligro! Vehículo en movimiento detectado a {dist} metros adelante.",
        "elevator_stairs_alternative": "Advertencia. Escaleras detectadas adelante. Ascensor disponible a su derecha.",
        "route_summary": "Ruta planificada. Distancia total {dist} metros. Puntuación de seguridad {score} por ciento. Primer paso: {step}",
        "emergency_halt": "¡ALTO! ¡Vehículo en movimiento acercándose! Muévase 2 pasos a la derecha de inmediato.",
        "all_clear": "Todos los sistemas funcionan con normalidad.",
        "stairs": "Escalera",
        "elevator": "Entrada de Ascensor",
        "tactile": "Camino Táctil",
        "cone": "Cono de Construcción",
        "vehicle": "Vehículo",
        "counter": "Mostrador de Recepción",
        "restroom": "Puerta del Baño",
        "ramp": "Rampa de Acceso",
        "corridor": "Pasillo",
        "exit": "Puerta de Salida"
    },
    "fr": {
        "pathway_clear": "La voie devant semble libre. Aucun obstacle immédiat détecté.",
        "pathway_clear_simple": "Voie libre.",
        "no_barriers": "Aucune barrière ni installation détectée à proximité immédiate.",
        "stair_warn_slow": "Escalier devant à {dist} mètres. Ralentissez.",
        "stair_warn_halt": "Danger d'escalier inaccessible détecté à {dist} mètres! Arrêtez-vous immédiatement.",
        "obstacle_warn": "Risque de collision: obstacle {label} détecté à {dist} mètres devant.",
        "vehicle_warn": "Danger! Véhicule en mouvement détecté à {dist} mètres devant.",
        "elevator_stairs_alternative": "Attention. Escalier détecté devant. Ascenseur disponible sur votre droite.",
        "route_summary": "Itinéraire planifié. Distance totale {dist} mètres. Score de sécurité {score} pour cent. Première étape: {step}",
        "emergency_halt": "STOP! Véhicule en mouvement en approche! Décalez-vous de 2 pas vers la droite immédiatement.",
        "all_clear": "Tous les systèmes fonctionnent normalement.",
        "stairs": "Escalier",
        "elevator": "Entrée de l'Ascenseur",
        "tactile": "Bande Podotactile",
        "cone": "Cône de Chantier",
        "vehicle": "Véhicule",
        "counter": "Comptoir d'Accueil",
        "restroom": "Porte des Toilettes",
        "ramp": "Rampe d'Accès",
        "corridor": "Couloir",
        "exit": "Porte de Sortie"
    },
    "de": {
        "pathway_clear": "Der Weg vor Ihnen scheint frei zu sein. Keine unmittelbaren Hindernisse erkannt.",
        "pathway_clear_simple": "Weg frei.",
        "no_barriers": "Keine Barrieren oder Einrichtungen in unmittelbarer Nähe erkannt.",
        "stair_warn_slow": "Treppe in {dist} Metern voraus. Bitte verlangsamen Sie Ihr Tempo.",
        "stair_warn_halt": "Unzugängliche Treppengefahr in {dist} Metern erkannt! Sofort anhalten.",
        "obstacle_warn": "Kollisionsrisiko: Hindernis {label} in {dist} Metern voraus erkannt.",
        "vehicle_warn": "Gefahr! Sich bewegendes Fahrzeug in {dist} Metern voraus erkannt.",
        "elevator_stairs_alternative": "Warnung. Treppe voraus erkannt. Aufzug auf der rechten Seite verfügbar.",
        "route_summary": "Route geplant. Gesamtdistanz {dist} Meter. Sicherheitsbewertung {score} Prozent. Erster Schritt: {step}",
        "emergency_halt": "HALT! Sich bewegendes Fahrzeug nähert sich! Sofort 2 Schritte nach rechts gehen.",
        "all_clear": "Alle Systeme arbeiten normal.",
        "stairs": "Treppe",
        "elevator": "Aufzugseingang",
        "tactile": "Taktiler Pfad",
        "cone": "Baupfeiler",
        "vehicle": "Fahrzeug",
        "counter": "Rezeptionstresen",
        "restroom": "Toilettentür",
        "ramp": "Rollstuhlrampe",
        "corridor": "Flur",
        "exit": "Ausgangstür"
    }
}

class GuidePilotTranslationService:
    @staticmethod
    def translate(key: str, lang: str = "en", **kwargs) -> str:
        """Translates a structured key with formatting arguments. Falls back to English if target lang is missing."""
        target_lang = lang.lower()
        if target_lang not in TRANSLATIONS:
            target_lang = "en"
            
        translated_text = TRANSLATIONS[target_lang].get(key, TRANSLATIONS["en"].get(key, key))
        
        # Localize specific dynamic labels in formatting parameters
        modified_kwargs = {}
        for k, v in kwargs.items():
            if isinstance(v, str):
                v_lower = v.lower()
                translated_val = v
                # Check direct key lookup first
                if v_lower in TRANSLATIONS[target_lang]:
                    translated_val = TRANSLATIONS[target_lang][v_lower]
                else:
                    # Fallback to English value matching
                    for eng_key, val in TRANSLATIONS["en"].items():
                        if val.lower() == v_lower:
                            translated_val = TRANSLATIONS[target_lang].get(eng_key, v)
                            break
                modified_kwargs[k] = translated_val
            else:
                modified_kwargs[k] = v
                
        try:
            return translated_text.format(**modified_kwargs)
        except Exception:
            return translated_text

    @staticmethod
    def inject_prompt_instruction(system_prompt: str, lang: str = "en") -> str:
        """Infects translation guidelines for LLM prompting when target is not English."""
        if lang.lower() == "en":
            return system_prompt
            
        lang_names = {
            "ar": "Arabic (العربية)",
            "es": "Spanish (Español)",
            "fr": "French (Français)",
            "de": "German (Deutsch)"
        }
        target_name = lang_names.get(lang.lower(), "English")
        
        return (
            f"{system_prompt}\n"
            f"IMPORTANT: You MUST generate all text, summaries, descriptions, and rationales in the {target_name} language. "
            f"Do not respond in English. Strictly output the translations matching {target_name}."
        )
