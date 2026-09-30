from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from api.models.schemas import HyperlocalForecastResponse
from api.data.location_repository import get_location_by_id
from api.services.weather.service import default_weather_service
from api.services.climate_service import climate_signal_service
from api.ml.inference import evaluate_forecast_diagnostics

router = APIRouter(prefix="", tags=["Hyperlocal Forecast"])

@router.get("/forecast/{location_id}", response_model=HyperlocalForecastResponse)
def get_forecast(
    location_id: str,
    days: int = Query(14, description="Forecast horizon days (7, 14, 21, 30)")
):
    """
    Retrieves operational probabilistic forecast.
    Uses real Open-Meteo numerical weather forecasts and NOAA climate signals.
    Never generates artificial random probabilities.
    """
    # 1. Extended horizon validation
    if days in (21, 30):
        raise HTTPException(
            status_code=404,
            detail="Extended 21/30-day prediction unavailable without long-range coupled dynamical model."
        )

    # 2. Resolve geographic coordinates
    loc = get_location_by_id(location_id)
    if not loc or "latitude" not in loc or "longitude" not in loc:
        # Fallback to default central coordinates if location not found
        lat, lon = 21.257, 77.511
        loc_meta = {"id": location_id, "name": "Monsoon Domain Region"}
    else:
        lat = float(loc["latitude"])
        lon = float(loc["longitude"])
        loc_meta = loc

    # 3. Fetch real operational daily weather forecast
    weather_resp = default_weather_service.get_forecast(lat, lon, days=days)
    if not weather_resp or not weather_resp.daily:
        raise HTTPException(
            status_code=503,
            detail="Operational meteorological forecast feed currently unavailable."
        )

    # 4. Fetch real climate signals
    enso = climate_signal_service.fetch_real_enso()
    mjo = climate_signal_service.fetch_real_mjo()

    # 5. Evaluate diagnostics
    daily_dicts = [d.model_dump() for d in weather_resp.daily]
    forecast_result = evaluate_forecast_diagnostics(
        location_meta=loc_meta,
        daily_forecasts=daily_dicts,
        enso_data=enso,
        mjo_data=mjo,
        lead_days=days
    )

    return forecast_result
