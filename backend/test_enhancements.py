# GuidePilot AI Advanced Enhancements Verification Suite

import os
import json
import unittest
from backend import config
from backend import database
from backend.agents.agent_registry import AgentRegistry
from backend.services.translation_service import GuidePilotTranslationService
from backend.agents.base import BaseAgent
from backend.agents.risk import RiskAgent
from backend.agents.emergency import EmergencyAgent
from backend.agents.visual_mapping import VisualMappingAgent
from backend.services.report_service import GuidePilotReportService
from backend.agents.recommendation import RecommendationAgent

class TestGuidePilotEnhancements(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize db
        database.db_init()

    def test_agent_registry_framework(self):
        """Phase 1: Verify auto-registration and dependency injection lifecycle."""
        # Ensure our agents auto-register themselves upon class bootup
        registered = AgentRegistry.list_registered_agents()
        self.assertIn("RiskAgent", registered)
        self.assertIn("VisualMappingAgent", registered)
        self.assertIn("EmergencyAgent", registered)

        # Retrieve instance from injector
        risk_inst = AgentRegistry.get_agent("RiskAgent")
        self.assertIsInstance(risk_inst, RiskAgent)

    def test_multilingual_translation(self):
        """Phase 1: Verify correct translation output and parameter localizer."""
        # Check standard localization keys
        ar_stair = GuidePilotTranslationService.translate("stair_warn_slow", "ar", dist="3.5")
        self.assertIn("درج أمامك", ar_stair)
        self.assertIn("3.5", ar_stair)

        # Check noun localization mapping
        es_obstacle = GuidePilotTranslationService.translate("obstacle_warn", "es", label="cone", dist="2.0")
        self.assertIn("cono de construcción", es_obstacle.lower())

    def test_persistent_memory_merging(self):
        """Phase 2: Verify SQLite map updating and spatial consolidation."""
        env = "Test Corridor 4"
        
        # Fresh save
        nodes1 = {
            "Start": {"name": "Lobby Entrance", "type": "entrance", "x": 0, "y": 0, "confidence": 1.0}
        }
        links1 = []
        database.save_environment_map(env, nodes1, links1)
        
        # Merge new nodes and link
        nodes2 = {
            "Stairs_Node": {"name": "Staircase", "type": "stairs", "x": 50, "y": 80, "confidence": 0.8}
        }
        links2 = [
            {"from": "Start", "to": "Stairs_Node", "distance": 10.0, "type": "stairs", "risk": "medium"}
        ]
        
        merged = database.merge_environment_map(env, nodes2, links2)
        self.assertIsNotNone(merged)
        self.assertIn("Start", merged["nodes"])
        self.assertIn("Stairs_Node", merged["nodes"])
        self.assertEqual(len(merged["links"]), 1)

    def test_risk_prioritization_and_explainability(self):
        """Phase 3: Verify score math, weights, confidence ratings, and priority levels."""
        risk_agent = RiskAgent()
        
        # Test case: Wheelchair user encountering Stairs (high risk / critical warning)
        detections = [
            {"label": "Staircase", "distance_meters": 1.5, "confidence": 0.95, "bounding_box": [100, 150, 200, 220]}
        ]
        
        analysis = risk_agent.evaluate_risks(detections, profile="WHEELCHAIR", lang="en")
        
        self.assertEqual(analysis["risk_level"], "HIGH")
        self.assertTrue(len(analysis["alerts"]) > 0)
        
        first_alert = analysis["alerts"][0]
        self.assertEqual(first_alert["priority"], "CRITICAL")
        self.assertEqual(first_alert["hazard"], "STAIRCASE")
        
        # Check explainability details
        self.assertLess(analysis["accessibility_score"], 100)
        self.assertIn("stairs_penalty", analysis["score_breakdown"])
        self.assertEqual(analysis["confidence"], 95)
        self.assertIsNotNone(analysis["reasoning_path"])

    def test_multi_report_certificate_export(self):
        """Phase 5: Verify PDF/HTML layout compilers and SVG chart creation."""
        report_service = GuidePilotReportService()
        rec_agent = RecommendationAgent()
        
        result = report_service.compile_certification_report(
            user_id="default_user",
            building_name="Terminal A Testing",
            location_address="Airport Avenue 44",
            facilities=["Elevator Entrance", "Wheelchair Ramp"],
            barriers=["Staircase"],
            recommendation_agent=rec_agent,
            lang="ar" # Test RTL compiling
        )
        
        self.assertIsNotNone(result)
        self.assertEqual(result["building_name"], "Terminal A Testing")
        self.assertTrue(result["report_url"].endswith(".html"))
        
        # Verify physical file creation
        filename = result["report_url"].split("/")[-1]
        report_path = os.path.join(config.REPORTS_DIR, filename)
        self.assertTrue(os.path.exists(report_path))
        
        # Read contents to check RTL and Cairo fonts
        with open(report_path, "r", encoding="utf-8") as f:
            html = f.read()
            self.assertIn('dir="rtl"', html)
            self.assertIn("'Cairo'", html)
            self.assertIn("<svg", html)  # SVG gauge check

if __name__ == "__main__":
    unittest.main()
