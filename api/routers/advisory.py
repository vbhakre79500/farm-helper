from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from api.models.schemas import AgriculturalAdvisoryItem
from api.data.location_repository import get_location_by_id
from api.routers.forecast import get_forecast
from api.advisory.rule_engine import evaluate_crop_advisories

router = APIRouter(prefix="", tags=["Agricultural Advisories"])

@router.get("/advisory/{location_id}", response_model=List[AgriculturalAdvisoryItem])
def get_advisories(
    location_id: str,
    cropId: Optional[str] = Query(None, description="Target crop identifier"),
    stage: Optional[str] = Query(None, description="Current crop phenological stage"),
):
    """
    Evaluates transparent agronomic rule engine against verified forecast conditions.
    Advisories are generated only when valid input forecast data exists.
    """
    loc = get_location_by_id(location_id)
    loc_meta = loc or {"id": location_id, "name": "Active Region"}

    try:
        # Retrieve active forecast for this location
        forecast_resp = get_forecast(location_id=location_id, days=14)
        if not forecast_resp:
            return []
        
        forecast_dict = forecast_resp if isinstance(forecast_resp, dict) else forecast_resp.model_dump()
        advisories = evaluate_crop_advisories(
            location_meta=loc_meta,
            forecast_data=forecast_dict,
            crop_id=cropId,
            crop_stage=stage
        )
        return advisories
    except HTTPException:
        # Forecast unavailable for this horizon/location
        return []
    except Exception as e:
        print(f"Advisory generation notice: {e}")
        return []
