from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from api.models.schemas import MonsoonAlertItem
from api.data.location_repository import get_location_by_id, ADMIN_STATES
from api.routers.forecast import get_forecast

router = APIRouter(prefix="", tags=["Monsoon Alerts"])

@router.get("/alerts", response_model=List[MonsoonAlertItem])
def get_alerts(locationId: Optional[str] = Query(None, description="Filter alerts by location ID")):
    """
    Retrieves operational meteorological and agronomic alerts derived from real weather forecast thresholds.
    """
    target_loc_id = locationId
    if not target_loc_id:
        # Default to first block in verified registry
        first_blk = ADMIN_STATES[0]["districts"][0]["blocks"][0]
        target_loc_id = first_blk["id"]

    loc = get_location_by_id(target_loc_id)
    loc_name = loc.get("name", "Active Region") if loc else "Active Region"

    alerts: List[Dict[str, Any]] = []
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    try:
        fc = get_forecast(location_id=target_loc_id, days=14)
        if fc:
            fc_dict = fc if isinstance(fc, dict) else fc.model_dump()
            metrics = fc_dict.get("metrics", {})
            rainfall_outlook = fc_dict.get("rainfallOutlook", {})

            heavy_prob = metrics.get("heavyRainProbability", {}).get("value", 0)
            break_prob = metrics.get("breakProbability", {}).get("value", 0)
            consecutive_dry = rainfall_outlook.get("consecutiveDryDaysExpected", 0)
            expected_rain = rainfall_outlook.get("expectedMm", 0.0)

            # Heavy Rain Alert
            if heavy_prob >= 40:
                alerts.append({
                    "id": f"ALT-{uuid.uuid4().hex[:6]}",
                    "locationId": target_loc_id,
                    "locationName": loc_name,
                    "category": "HEAVY RAIN",
                    "severity": "HIGH" if heavy_prob >= 65 else "ELEVATED",
                    "title": f"Heavy Rainfall Warning — {loc_name}",
                    "eventDescription": f"Numerical weather models indicate a {heavy_prob}% probability of intense precipitation clusters over the next 48 to 72 hours.",
                    "forecastPeriod": "Next 48 to 72 hours",
                    "recommendedAction": "Maintain open drainage channels in standing crops. Postpone foliar pesticide sprays and synthetic nitrogen top-dressing.",
                    "createdAt": now_str,
                    "broadcastChannels": ["IN-APP", "SMS"],
                })

            # Dry Spell Hazard Alert
            if break_prob >= 40 or consecutive_dry >= 6:
                alerts.append({
                    "id": f"ALT-{uuid.uuid4().hex[:6]}",
                    "locationId": target_loc_id,
                    "locationName": loc_name,
                    "category": "DRY SPELL",
                    "severity": "HIGH" if consecutive_dry >= 8 else "MODERATE",
                    "title": f"Sub-Seasonal Dry Spell Outlook — {loc_name}",
                    "eventDescription": f"Forecast indicates {consecutive_dry} consecutive dry days with break probability at {break_prob}%. Soil rootzone moisture will experience rapid depletion.",
                    "forecastPeriod": "Lead Day 6 to 14",
                    "recommendedAction": "Apply organic mulch or shallow interculture (dust mulching) to conserve capillary moisture. Schedule alternate-furrow deficit irrigation.",
                    "createdAt": now_str,
                    "broadcastChannels": ["IN-APP", "WHATSAPP"],
                })

            # Favorable Onset Advisory Alert
            onset_prob = metrics.get("onsetProbability", {}).get("value", 0)
            if onset_prob >= 70 and expected_rain >= 40.0:
                alerts.append({
                    "id": f"ALT-{uuid.uuid4().hex[:6]}",
                    "locationId": target_loc_id,
                    "locationName": loc_name,
                    "category": "MONSOON ONSET",
                    "severity": "LOW",
                    "title": f"Monsoon Influx & Sowing Readiness — {loc_name}",
                    "eventDescription": f"Monsoon onset probability reaches {onset_prob}% with cumulative expected rainfall of {expected_rain} mm.",
                    "forecastPeriod": "Next 7 days",
                    "recommendedAction": "Finalize seedbed preparation. Initiate sowing once 75-100 mm cumulative precipitation wets the top 15 cm of soil.",
                    "createdAt": now_str,
                    "broadcastChannels": ["IN-APP", "SMS"],
                })

    except Exception as e:
        print(f"Alert evaluation notice: {e}")

    return alerts
