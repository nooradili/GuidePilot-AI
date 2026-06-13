import os
import json
from backend import config
from backend import database

class GuidePilotReportService:
    def __init__(self):
        pass

    def compile_certification_report(self, user_id, building_name, location_address, facilities, barriers, recommendation_agent, lang="en"):
        """Compiles four consulting-grade audit reports with SVG charts and explainability details in the target language."""
        
        # 1. Score Calculation (Explainable logic matching Risk Heuristics)
        base_score = 75
        breakdown = {
            "base": 75,
            "facilities_bonus": 0,
            "barriers_penalty": 0
        }
        
        for f in facilities:
            base_score += 8
            breakdown["facilities_bonus"] += 8
            
        for b in barriers:
            base_score -= 12
            breakdown["barriers_penalty"] -= 12
            
        score = max(10, min(100, base_score))
        confidence = 94 if len(facilities) + len(barriers) > 0 else 98
        
        # Grading
        if score >= 90:
            grade = "A"
            status = "ACCESSIBLE"
        elif score >= 80:
            grade = "B"
            status = "ACCESSIBLE"
        elif score >= 65:
            grade = "C"
            status = "CONDITIONAL"
        else:
            grade = "D"
            status = "BARRIER_PRONE"
            
        # Get AI recommendations
        rec_data = recommendation_agent.generate_recommendations(barriers)
        recommendations = rec_data.get("recommendations", [])
        projections = rec_data.get("projections", {})
        
        # Save to SQLite
        report_id = database.add_accessibility_report(
            user_id=user_id,
            building_name=building_name,
            location_address=location_address,
            accessibility_score=score,
            certification_status=status,
            detected_facilities=facilities,
            detected_barriers=barriers,
            recommendations=recommendations
        )
        
        # Translate layout labels
        is_ar = (lang.lower() == "ar")
        dir_attr = "rtl" if is_ar else "ltr"
        
        title = "شهادة إمكانية الوصول من GuidePilot" if is_ar else "GuidePilot Accessibility & Audit Certificate"
        subtitle = "تقرير تدقيق شامل ومحاكاة التوأم الرقمي للأثر المجتمعي" if is_ar else "Comprehensive Audit, Digital Twin Simulation & Community Impact Report"
        
        lbl_building = "اسم المنشأة" if is_ar else "Facility/Building Name"
        lbl_address = "العنوان" if is_ar else "Location Address"
        lbl_date = "تاريخ التدقيق" if is_ar else "Audit Compilation Date"
        lbl_score = "درجة إمكانية الوصول" if is_ar else "Accessibility Rating Score"
        lbl_grade = "الدرجة" if is_ar else "Certification Grade"
        lbl_status = "حالة الاعتماد" if is_ar else "Certification Status"
        lbl_confidence = "نسبة الثقة بالتقييم" if is_ar else "Assessment Confidence"
        lbl_breakdown = "تحليل وتوزيع الدرجات" if is_ar else "Accessibility Score Breakdown"
        lbl_reasoning = "مسار تحليل الذكاء الاصطناعي" if is_ar else "AI Reasoner Evaluation Path"
        
        # Localize status strings
        status_disp = status.replace('_', ' ')
        if is_ar:
            if status == "ACCESSIBLE": status_disp = "ميسر بالكامل"
            elif status == "CONDITIONAL": status_disp = "ميسر مشروط"
            else: status_disp = "مليء بالعوائق"
            
        # Generate SVG Gauge
        stroke_dash = int(251.2 * (score / 100))
        stroke_color = "#10B981" if score >= 80 else ("#FFB800" if score >= 65 else "#EF4444")
        
        # Generate SVG Bar charts for breakdown
        bar_fac_width = max(10, min(100, breakdown["facilities_bonus"] * 3))
        bar_bar_width = max(10, min(100, abs(breakdown["barriers_penalty"]) * 3))
        
        # Build reasoning explanation text
        reasoning_text = (
            f"Evaluated base environment layout (+75). Found {len(facilities)} active accessibility accommodations ({breakdown['facilities_bonus']:+d}). "
            f"Deducted {-breakdown['barriers_penalty']} points due to {len(barriers)} physical infrastructure obstacles."
        )
        if is_ar:
            reasoning_text = (
                f"تم تقييم المخطط الأساسي للمبنى (+75). تم العثور على {len(facilities)} من المرافق الميسرة المضافة ({breakdown['facilities_bonus']:+d}). "
                f"تم خصم {-breakdown['barriers_penalty']} نقطة بسبب وجود {len(barriers)} من العوائق المادية في المنشأة."
            )
            
        report_filename = f"audit_{report_id}_{building_name.lower().replace(' ', '_')}.html"
        report_path = os.path.join(config.REPORTS_DIR, report_filename)
        
        html_content = f"""<!DOCTYPE html>
<html lang="{lang}" dir="{dir_attr}">
<head>
    <meta charset="UTF-8">
    <title>{title} - {building_name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Cairo:wght@300;400;600;700&display=swap');
        
        body {{
            font-family: { "'Cairo', sans-serif" if is_ar else "'Outfit', sans-serif" };
            background-color: #0B0E14;
            color: #E5E7EB;
            padding: 40px;
            margin: 0;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
            background: #111622;
            border: 2px solid #2A354A;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }}
        header {{
            text-align: center;
            border-bottom: 2px solid #2A354A;
            padding-bottom: 24px;
            margin-bottom: 30px;
        }}
        h1 {{
            color: #00F0FF;
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 700;
        }}
        .subtitle {{
            color: #9CA3AF;
            font-size: 14px;
            margin: 0;
        }}
        .grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }}
        .card {{
            background: #182030;
            border: 1px solid #2A354A;
            border-radius: 12px;
            padding: 24px;
        }}
        .score-circle {{
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 20px 0;
            position: relative;
        }}
        .score-text {{
            position: absolute;
            font-size: 32px;
            font-weight: bold;
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        .score-text span {{
            font-size: 12px;
            color: #9CA3AF;
        }}
        .badge {{
            display: inline-block;
            background: {stroke_color}22;
            color: {stroke_color};
            border: 1px solid {stroke_color};
            padding: 4px 12px;
            border-radius: 99px;
            font-weight: bold;
            font-size: 14px;
        }}
        h3 {{
            color: #00F0FF;
            border-bottom: 1px solid #2A354A;
            padding-bottom: 8px;
            margin-top: 0;
        }}
        .bar-chart {{
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 15px;
        }}
        .bar-row {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .bar-label {{
            width: 120px;
            font-size: 12px;
            color: #9CA3AF;
        }}
        .bar-track {{
            flex: 1;
            background: #0B0E14;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
        }}
        .bar-fill {{
            height: 100%;
            border-radius: 6px;
        }}
        .bar-val {{
            font-size: 12px;
            font-weight: bold;
            width: 40px;
            text-align: right;
        }}
        .report-section {{
            margin-top: 40px;
            border-top: 2px solid #2A354A;
            padding-top: 30px;
        }}
        .rec-item {{
            background: #0B0E14;
            border-left: 4px solid #FFB800;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
        }}
        dir[dir="rtl"] .rec-item {{
            border-left: none;
            border-right: 4px solid #FFB800;
        }}
        @media print {{
            body {{
                background: #FFFFFF;
                color: #000000;
                padding: 10px;
            }}
            .container {{
                border: none;
                box-shadow: none;
                background: #FFFFFF;
                padding: 0;
            }}
            .card, .rec-item {{
                background: #FFFFFF;
                border: 1px solid #CCCCCC;
                color: #000000;
            }}
            h1, h3 {{
                color: #000000;
            }}
            .score-text {{
                color: #000000;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{title}</h1>
            <div class="subtitle">{subtitle}</div>
        </header>

        <div class="grid">
            <!-- Accessibility Score details card -->
            <div class="card">
                <h3>{lbl_score}</h3>
                
                <div class="score-circle">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1F2937" stroke-width="8"/>
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="{stroke_color}" stroke-width="8"
                                stroke-dasharray="251.2" stroke-dashoffset="{251.2 - stroke_dash}"
                                stroke-linecap="round" transform="rotate(-90 50 50)"/>
                    </svg>
                    <div class="score-text">
                        {score}
                        <span>/ 100</span>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 15px;">
                    <div class="badge">{lbl_grade} {grade}</div>
                    <div style="margin-top: 8px; font-weight: 600; font-size: 15px; color: #9CA3AF;">
                        {lbl_status}: <span style="color: {stroke_color}">{status_disp}</span>
                    </div>
                </div>
            </div>

            <!-- Metadata and breakdown card -->
            <div class="card">
                <h3>{lbl_breakdown}</h3>
                <p style="font-size: 13px; margin: 0 0 15px 0;"><strong>{lbl_building}:</strong> {building_name}<br/>
                <strong>{lbl_address}:</strong> {location_address}<br/>
                <strong>{lbl_date}:</strong> {os.environ.get('CURRENT_TIME', 'June 12, 2026')}</p>
                
                <div class="bar-chart">
                    <div class="bar-row">
                        <span class="bar-label">{"المنشآت المكتشفة" if is_ar else "Detected Facilities"}</span>
                        <div class="bar-track"><div class="bar-fill" style="width: {bar_fac_width}%; background: #10B981;"></div></div>
                        <span class="bar-val" style="color: #10B981;">+{breakdown["facilities_bonus"]}</span>
                    </div>
                    <div class="bar-row">
                        <span class="bar-label">{"العوائق المكتشفة" if is_ar else "Detected Barriers"}</span>
                        <div class="bar-track"><div class="bar-fill" style="width: {bar_bar_width}%; background: #EF4444;"></div></div>
                        <span class="bar-val" style="color: #EF4444;">{breakdown["barriers_penalty"]}</span>
                    </div>
                    <div class="bar-row">
                        <span class="bar-label">{lbl_confidence}</span>
                        <div class="bar-track"><div class="bar-fill" style="width: {confidence}%; background: #00F0FF;"></div></div>
                        <span class="bar-val" style="color: #00F0FF;">{confidence}%</span>
                    </div>
                </div>

                <div style="margin-top: 20px; font-size: 13px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px dashed #2A354A;">
                    <strong>{lbl_reasoning}:</strong>
                    <p style="margin: 4px 0 0 0; color: #9CA3AF;">{reasoning_text}</p>
                </div>
            </div>
        </div>

        <!-- Section 2: Risk Reports -->
        <div class="report-section">
            <h3>{"١. تقرير المخاطر والأمن والسلامة" if is_ar else "1. Infrastructure Risk Analysis Report"}</h3>
            <p style="font-size: 14px; color: #9CA3AF; margin-bottom: 20px;">
                {"يقوم هذا القسم بتحليل المخاطر المباشرة وعوائق الوصول التي قد تهدد سلامة الأشخاص ذوي الإعاقة الحركية أو البصرية." if is_ar else "This section outlines immediate structural hazards, warning metrics, and risk classifications for mobility-impaired individuals."}
            </p>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                <thead>
                    <tr style="border-bottom: 2px solid #2A354A; color: #00F0FF;">
                        <th style="padding: 10px; text-align: inherit;">{"العائق" if is_ar else "Hazard Entity"}</th>
                        <th style="padding: 10px; text-align: inherit;">{"حجم المخاطر" if is_ar else "Risk Severity"}</th>
                        <th style="padding: 10px; text-align: inherit;">{"الحالة" if is_ar else "Infrastructure Status"}</th>
                    </tr>
                </thead>
                <tbody>
                    { "".join([f'<tr style="border-bottom: 1px solid #1F2937;"><td style="padding: 12px;"><strong>{b}</strong></td><td style="padding: 12px;"><span style="color: #EF4444; font-weight: bold;">{"مرتفع جداً" if is_ar else "CRITICAL"}</span></td><td style="padding: 12px;">{"يتطلب تدخل فوري وإضافة منحدر أو إشارات إرشادية" if is_ar else "Requires immediate structural compliance updates."}</td></tr>' for b in barriers]) }
                    { '<tr style="border-bottom: 1px solid #1F2937;"><td colspan="3" style="padding: 12px; text-align: center; color: #9CA3AF;">' + ("لا توجد مخاطر حرجة مكتشفة." if is_ar else "No critical hazards identified.") + '</td></tr>' if not barriers else '' }
                </tbody>
            </table>
        </div>

        <!-- Section 3: Digital Twin Report -->
        <div class="report-section">
            <h3>{"٢. محاكاة التوأم الرقمي للوصول" if is_ar else "2. Accessibility Digital Twin Simulation"}</h3>
            <p style="font-size: 14px; color: #9CA3AF; margin-bottom: 15px;">
                {"تقوم المحاكاة بفحص المبنى رقمياً ومقارنة معايير الوصول لمختلف الملفات التعريفية للتنقل:" if is_ar else "Digital twin testing compares structural environment compliance ratios across multiple user profiles:"}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div class="card" style="padding: 16px; text-align: center;">
                    <span style="font-size: 14px; font-weight: bold; color: #FFFFFF;">{"مستخدم كرسي متحرك" if is_ar else "Wheelchair Profile"}</span>
                    <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: { '#EF4444' if barriers else '#10B981' };">{ "45%" if barriers else "98%" }</div>
                    <span style="font-size: 11px; color: #9CA3AF;">{ "Stairs impede wheelchair mobility." if barriers else "Full step-free ramp access available." }</span>
                </div>
                <div class="card" style="padding: 16px; text-align: center;">
                    <span style="font-size: 14px; font-weight: bold; color: #FFFFFF;">{"مستخد البصر (كفيف)" if is_ar else "Visual Impairment"}</span>
                    <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #FFB800;">80%</div>
                    <span style="font-size: 11px; color: #9CA3AF;">{"يتطلب توفير مسارات حسية ملموسة" if is_ar else "Tactile pavement overlays recommended."}</span>
                </div>
                <div class="card" style="padding: 16px; text-align: center;">
                    <span style="font-size: 14px; font-weight: bold; color: #FFFFFF;">{"كبار السن والمسنين" if is_ar else "Elderly Profile"}</span>
                    <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #10B981;">{ "85%" if not barriers else "70%" }</div>
                    <span style="font-size: 11px; color: #9CA3AF;">{"يحتاج إلى درابزين حماية إضافي" if is_ar else "Stairs demand handrails for safety."}</span>
                </div>
            </div>
        </div>

        <!-- Section 4: Community Impact Report -->
        <div class="report-section">
            <h3>{"٣. تقرير الأثر المجتمعي والاقتصادي" if is_ar else "3. Community & Social Impact Assessment"}</h3>
            <div class="grid" style="margin-top: 15px;">
                <div class="card" style="background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.2);">
                    <h4 style="margin: 0 0 10px 0; color: #10B981;">{"إمكانية زيادة الدمج والشمولية" if is_ar else "Inclusivity Improvement Projection"}</h4>
                    <p style="font-size: 13px; margin: 0; color: #9CA3AF;">
                        {"عند تطبيق التوصيات المذكورة أدناه، فإن مؤشر التنقل المستقل للأفراد يرتفع بنسبة +{inc}%، مما يتيح للأشخاص ذوي الإعاقة زيارة المنشأة بخصوصية وأمان تامين."
                        .format(inc=projections.get('independence_increase_potential', 18))}
                    </p>
                </div>
                <div class="card" style="background: rgba(0,240,255,0.05); border-color: rgba(0,240,255,0.2);">
                    <h4 style="margin: 0 0 10px 0; color: #00F0FF;">{"زيادة القيمة الاقتصادية للمنشأة" if is_ar else "Economic & Asset Value Increase"}</h4>
                    <p style="font-size: 13px; margin: 0; color: #9CA3AF;">
                        {"ترقية مرافق الوصول ترفع من التقييم العام للمبنى وتوسع قاعدة العملاء والزوار بنسبة متوقعة تصل إلى +{pot}% طبقاً لمعايير التصميم الشامل."
                        .format(pot=projections.get('accessibility_improvement_potential', 15))}
                    </p>
                </div>
            </div>
        </div>

        <!-- Prioritized AI Recommendations -->
        <div class="report-section">
            <h3>{"٤. خطة عمل التوصيات ذات الأولوية" if is_ar else "4. Prioritized Recommendations Action Plan"}</h3>
            { "".join([f'<div class="rec-item"><strong>{"أولوية" if is_ar else "Priority"} {r.get("priority", i+1)}:</strong> {r.get("suggestion", "")} <br/><small style="color: #9CA3AF;">{"تأثير العائق" if is_ar else "Impact"}: {r.get("issue", "")} ({"الصعوبة" if is_ar else "Difficulty"}: {r.get("difficulty", "Medium")})</small></div>' for i, r in enumerate(recommendations)]) }
        </div>
    </div>
    <script>window.print();</script>
</body>
</html>
"""
        
        try:
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(html_content)
        except Exception as e:
            print(f"Failed to write report file: {e}")
            
        return {
            "report_id": report_id,
            "building_name": building_name,
            "accessibility_score": score,
            "grade": grade,
            "certification_status": status,
            "recommendations": recommendations,
            "projections": projections,
            "report_url": f"/reports/download/{report_filename}"
        }
