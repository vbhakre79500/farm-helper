from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from api.services.weather.service import default_weather_service
from api.services.weather.schemas import (
    CurrentWeatherResponse,
    WeatherForecastResponse,
    HistoricalWeatherResponse,
)
from api.data.location_repository import get_location_by_id

router = APIRouter(prefix="/weather", tags=["Operational Weather"])

def resolve_coords(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    location_id: Optional[str] = None
) -> tuple[float, float]:
    if lat is not None and lon is not None:
        return lat, lon
    if location_id:
        loc = get_location_by_id(location_id)
        if loc and "latitude" in loc and "longitude" in loc:
            return float(loc["latitude"]), float(loc["longitude"])
    # Default fallback: central coordinates of Indian monsoon core region if not specified
    raise HTTPException(
        status_code=400,
        detail="Must provide either (lat, lon) coordinates or a registered locationId."
    )

@router.get("/current", response_model=CurrentWeatherResponse)
def get_current_weather(
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    locationId: Optional[str] = Query(None, description="Location identifier")
):
    target_lat, target_lon = resolve_coords(lat, lon, locationId)
    data = default_weather_service.get_current(target_lat, target_lon)
    if not data:
        raise HTTPException(status_code=503, detail="Operational weather data currently unavailable from provider.")
    return data

@router.get("/forecast", response_model=WeatherForecastResponse)
def get_weather_forecast(
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    locationId: Optional[str] = Query(None, description="Location identifier"),
    days: int = Query(14, ge=1, le=16, description="Forecast horizon days")
):
    target_lat, target_lon = resolve_coords(lat, lon, locationId)
    data = default_weather_service.get_forecast(target_lat, target_lon, days)
    if not data:
        raise HTTPException(status_code=503, detail="Operational forecast data currently unavailable from provider.")
    return data

@router.get("/historical", response_model=HistoricalWeatherResponse)
def get_historical_weather(
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    locationId: Optional[str] = Query(None, description="Location identifier"),
    startDate: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    endDate: Optional[str] = Query(None, description="End date YYYY-MM-DD")
):
    target_lat, target_lon = resolve_coords(lat, lon, locationId)
    if not startDate or not endDate:
        # Default to previous year monsoon period (e.g. June 1 to Sept 30)
        now = datetime.now()
        year = now.year - 1
        startDate = f"{year}-06-01"
        endDate = f"{year}-09-30"

    data = default_weather_service.get_historical(target_lat, target_lon, startDate, endDate)
    if not data:
        raise HTTPException(status_code=503, detail="Historical weather data currently unavailable from provider.")
    return data
