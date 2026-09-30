import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

def evaluate_crop_advisories(
    location_meta: Dict[str, Any],
    forecast_data: Dict[str, Any],
    crop_id: Optional[str] = None,
    crop_stage: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Transparent deterministic agronomic rule-based expert system.
    Evaluates sub-seasonal monsoon hazard against crop physiological requirements.
    """
    advisories = []
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M')

    target_crop = (crop_id or 'crop-soybean').lower()
    stage = crop_stage or 'Sowing & Germination'

    break_prob = forecast_data["metrics"]["breakProbability"]["value"]
    heavy_rain_prob = forecast_data["metrics"]["heavyRainProbability"]["value"]
    onset_prob = forecast_data["metrics"]["onsetProbability"]["value"]
    expected_rain_mm = forecast_data["rainfallOutlook"]["expectedMm"]
    consecutive_dry_days = forecast_data["rainfallOutlook"]["consecutiveDryDaysExpected"]
    confidence = forecast_data["confidenceScore"]

    # RULE 1: SOWING READINESS UNDER ONSET (Kharif crops: Soybean, Cotton, Maize, Groundnut)
    if 'sowing' in stage.lower() or 'land' in stage.lower():
        if onset_prob >= 75 and expected_rain_mm >= 50:
            if 'soybean' in target_crop:
                advisories.append({
                    "id": f"ADV-{uuid.uuid4().hex[:8]}",
                    "locationId": location_meta["id"],
                    "cropId": "crop-soybean",
                    "cropName": "Soybean",
                    "cropStage": stage,
                    "category": "Sowing",
                    "recommendedAction": "Initiate broad bed furrow (BBF) sowing once 75-100 mm cumulative precipitation is achieved in soil profile.",
                    "scientificReason": "Adequate rootzone moisture (depth > 15 cm) ensures 85%+ uniform germination and prevents seed desiccation under intermittent sun.",
                    "forecastPeriod": "Next 5 to 7 days",
                    "riskLevel": "LOW",
                    "confidenceScore": confidence,
                    "ruleReference": "ICAR-IISR-SOW-01 (Soil Moisture Seedbed Rule)",
                    "createdAt": now_str,
                })
            elif 'cotton' in target_crop:
                advisories.append({
                    "id": f"ADV-{uuid.uuid4().hex[:8]}",
                    "locationId": location_meta["id"],
                    "cropId": "crop-cotton",
                    "cropName": "Cotton",
                    "cropStage": stage,
                    "category": "Sowing",
                    "recommendedAction": "Dibble certified seeds at recommended spacing (90x45 cm or 90x60 cm depending on soil depth); avoid sowing in wet slush.",
                    "scientificReason": "Cotton seedling emergence requires well-aerated seedbeds to avoid pythium root rot.",
                    "forecastPeriod": "Next 5 to 8 days",
                    "riskLevel": "LOW",
                    "confidenceScore": confidence,
                    "ruleReference": "CICR-COT-SOW-02 (Seedbed Aeration Protocol)",
                    "createdAt": now_str,
                })

    # RULE 2: DRY SPELL PREPAREDNESS (Break hazard > 30% or consecutive dry days > 7)
    if consecutive_dry_days >= 6 or break_prob >= 30:
        if 'soybean' in target_crop:
            advisories.append({
                "id": f"ADV-{uuid.uuid4().hex[:8]}",
                "locationId": location_meta["id"],
                "cropId": "crop-soybean",
                "cropName": "Soybean",
                "cropStage": stage,
                "category": "Dry-Spell Preparedness",
                "recommendedAction": "Apply organic biomass mulching or run shallow interculture (kolpa/hoe) to create a dust mulch and seal soil capillaries.",
                "scientificReason": f"Break probability of {break_prob}% with ~{consecutive_dry_days} consecutive dry days will induce vegetative stress; dust mulching slows moisture loss by 25%.",
                "forecastPeriod": "Lead Day 8 to 14",
                "riskLevel": "ELEVATED" if break_prob > 40 else "MODERATE",
                "confidenceScore": confidence,
                "ruleReference": "CRIDA-DRY-SP-04 (Interculture Moisture Conservation)",
                "createdAt": now_str,
            })
        elif 'cotton' in target_crop:
            advisories.append({
                "id": f"ADV-{uuid.uuid4().hex[:8]}",
                "locationId": location_meta["id"],
                "cropId": "crop-cotton",
                "cropName": "Cotton",
                "cropStage": stage,
                "category": "Irrigation",
                "recommendedAction": "Prepare drip or furrow alternate-row supplemental irrigation; spray 1% potassium nitrate (KNO3) if vegetative wilt appears.",
                "scientificReason": "Foliar potassium application maintains stomatal regulation and osmotic balance during extended moisture deficits.",
                "forecastPeriod": "Lead Day 7 to 14",
                "riskLevel": "MODERATE",
                "confidenceScore": confidence,
                "ruleReference": "CICR-PHYSIO-03 (Foliar Potassium Stress Mitigation)",
                "createdAt": now_str,
            })

    # RULE 3: EXCESS PRECIPITATION & DRAINAGE (Heavy rain probability > 35%)
    if heavy_rain_prob >= 35:
        advisories.append({
            "id": f"ADV-{uuid.uuid4().hex[:8]}",
            "locationId": location_meta["id"],
            "cropId": target_crop,
            "cropName": target_crop.replace('crop-', '').capitalize(),
            "cropStage": stage,
            "category": "Drainage",
            "recommendedAction": "Inspect field periphery and clear dead furrows/drainage channels to prevent standing water accumulation.",
            "scientificReason": f"Heavy rainfall surge hazard estimated at {heavy_rain_prob}%; Vertisol clay soils are susceptible to severe waterlogging and hypoxia within 48h.",
            "forecastPeriod": "Next 48 to 96 hours",
            "riskLevel": "HIGH" if heavy_rain_prob > 50 else "ELEVATED",
            "confidenceScore": max(65, confidence - 4),
            "ruleReference": "ICAR-DRAIN-09 (Vertisol Surface Runoff Management)",
            "createdAt": now_str,
        })

    # RULE 4: NUTRIENT AND FERTILIZER MANAGEMENT
    if heavy_rain_prob < 40 and break_prob < 40 and expected_rain_mm > 15:
        advisories.append({
            "id": f"ADV-{uuid.uuid4().hex[:8]}",
            "locationId": location_meta["id"],
            "cropId": target_crop,
            "cropName": target_crop.replace('crop-', '').capitalize(),
            "cropStage": stage,
            "category": "Fertilizer",
            "recommendedAction": "Favorable moisture conditions to apply recommended split dose of urea/NPK top-dressing.",
            "scientificReason": "Moderate precipitation without runoff hazard enables rapid solubilization and nutrient assimilation without leaching.",
            "forecastPeriod": "Next 3 to 5 days",
            "riskLevel": "LOW",
            "confidenceScore": confidence,
            "ruleReference": "NARES-FERT-SPLIT-02 (Moisture Synchronized Nutrition)",
            "createdAt": now_str,
        })

    return advisories
