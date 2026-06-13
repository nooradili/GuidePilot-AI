import json
from backend.agents.base import BaseAgent
from backend import config
from backend.services.translation_service import GuidePilotTranslationService

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__("RiskAgent")

    def evaluate_risks(self, detections, profile="WHEELCHAIR", lang="en", model=None):
        """
        Evaluates detected objects, raises prioritized alerts, and calculates 
        an explainable accessibility score with weights, confidence, and reasoning.
        """
        alerts = []
        highest_risk = "NONE"
        
        # 1. Base Score & Heuristic Weights
        base_score = 100
        score_breakdown = {
            "base_environment": 100,
            "elevator_bonus": 0,
            "ramp_bonus": 0,
            "stairs_penalty": 0,
            "obstacle_penalty": 0,
            "vehicle_penalty": 0
        }
        
        # Tracking variables for confidence estimation
        total_confidence = 0.0
        detection_count = 0
        
        # 2. Risk Heuristics & Priority Assigner
        for det in detections:
            label = det.get("label", "").lower()
            dist = det.get("distance_meters", 5.0)
            conf = det.get("confidence", 0.8)
            
            total_confidence += conf
            detection_count += 1
            
            risk_level = "NONE"
            priority = "LOW"
            warning_msg = ""
            
            # Map labels to localized warning strings & priorities
            if dist < config.PROXIMITY_ALERT_THRESHOLD_METERS:
                if label in ["staircase", "stairs", "steps"]:
                    if profile == "WHEELCHAIR":
                        risk_level = "HIGH"
                        priority = "CRITICAL"
                        warning_msg = GuidePilotTranslationService.translate("stair_warn_halt", lang, dist=f"{dist:.1f}")
                        score_breakdown["stairs_penalty"] -= 30
                    else:
                        risk_level = "MEDIUM"
                        priority = "HIGH"
                        warning_msg = GuidePilotTranslationService.translate("stair_warn_slow", lang, dist=f"{dist:.1f}")
                        score_breakdown["stairs_penalty"] -= 15
                        
                elif label in ["pole", "wall", "furniture", "box", "construction_cone", "cone"]:
                    risk_level = "MEDIUM"
                    priority = "HIGH"
                    label_translated = GuidePilotTranslationService.translate(label, lang)
                    warning_msg = GuidePilotTranslationService.translate("obstacle_warn", lang, label=label_translated, dist=f"{dist:.1f}")
                    score_breakdown["obstacle_penalty"] -= 10
                    
                elif label in ["car", "vehicle", "forklift"]:
                    risk_level = "HIGH"
                    priority = "CRITICAL"
                    warning_msg = GuidePilotTranslationService.translate("vehicle_warn", lang, dist=f"{dist:.1f}")
                    score_breakdown["vehicle_penalty"] -= 40
                    
                elif label in ["elevator", "elevator entrance"]:
                    score_breakdown["elevator_bonus"] += 20
                elif label in ["ramp", "wheelchair ramp"]:
                    score_breakdown["ramp_bonus"] += 15

            if risk_level == "HIGH":
                highest_risk = "HIGH"
            elif risk_level == "MEDIUM" and highest_risk != "HIGH":
                highest_risk = "MEDIUM"
                
            if risk_level != "NONE":
                alerts.append({
                    "hazard": label.upper(),
                    "distance": dist,
                    "level": risk_level,
                    "priority": priority,
                    "message": warning_msg
                })
                
        # Calculate final accessibility score
        total_penalty = score_breakdown["stairs_penalty"] + score_breakdown["obstacle_penalty"] + score_breakdown["vehicle_penalty"]
        total_bonus = score_breakdown["elevator_bonus"] + score_breakdown["ramp_bonus"]
        final_score = max(0, min(100, base_score + total_penalty + total_bonus))
        
        # Calculate confidence percentage
        if detection_count > 0:
            avg_conf = (total_confidence / detection_count) * 100
            confidence_pct = int(min(99, max(50, avg_conf)))
        else:
            confidence_pct = 95  # Default high confidence when empty path is verified
            
        # Build Reasoning Path
        reasoning_list = []
        if total_penalty < 0:
            reasoning_list.append(f"Deducted {-total_penalty} points due to active hazards in immediate path.")
        if total_bonus > 0:
            reasoning_list.append(f"Credited +{total_bonus} points for nearby step-free infrastructure facilities.")
        if not reasoning_list:
            reasoning_list.append("The path features no hazards. standard parameters apply.")
        reasoning_path = " ".join(reasoning_list)
        
        if lang == "ar":
            reasoning_path = reasoning_path.replace("Deducted", "تم خصم").replace("points due to active hazards in immediate path.", "نقاط بسبب وجود مخاطر نشطة في الممر المباشر.")
            reasoning_path = reasoning_path.replace("Credited", "تم إضافة").replace("points for nearby step-free infrastructure facilities.", "نقاط لوجود مرافق ميسرة خالية من الدرج في الجوار.")
            reasoning_path = reasoning_path.replace("The path features no hazards. standard parameters apply.", "الممر لا يحتوي على مخاطر. تطبق المعايير القياسية.")
            
        # If LLM is available, generate smart summarization reasoning
        summary = GuidePilotTranslationService.translate("pathway_clear", lang)
        if alerts:
            prompt = f"Summarize these active risk alerts into a single, high-impact safety warning for a {profile} user: {json.dumps(alerts)}"
            template = {
                "level": "MEDIUM",
                "summary": "Stairs detected 1.5 meters ahead. Slow down."
            }
            llm_result = self.query_structured("You are GuidePilot Risk Agent. Generate concise hazard summaries.", prompt, template, lang=lang, model=model)
            summary = llm_result.get("summary", alerts[0]["message"])
            
        return {
            "risk_level": highest_risk,
            "alerts": alerts,
            "summary": summary,
            "accessibility_score": final_score,
            "score_breakdown": score_breakdown,
            "confidence": confidence_pct,
            "reasoning_path": reasoning_path
        }
