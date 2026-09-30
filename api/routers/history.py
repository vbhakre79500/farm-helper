from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime
from api.models.schemas import HistoricalRecord
from api.data.location_repository import get_location_by_id
from api.services.weather.service import default_weather_service

router = APIRouter(prefix="", tags=["Historical Analytics"])

@router.get("/historical/{location_id}", response_model=List[HistoricalRecord])
def get_historical_records(location_id: str):
    """
    Retrieves verified historical seasonal rainfall series from Copernicus ERA5 / Open-Meteo Archive.
    """
    loc = get_location_by_id(location_id)
    if not loc or "latitude" not in loc or "longitude" not in loc:
        lat, lon = 21.257, 77.511
    else:
        lat = float(loc["latitude"])
        lon = float(loc["longitude"])

    current_year = datetime.now().year
    past_years = [current_year - 4, current_year - 3, current_year - 2, current_year - 1]
    results: List[HistoricalRecord] = []

    # Benchmark climatological seasonal normal for central/peninsular zone
    climatological_normal = 820.0

    for yr in past_years:
        start_d = f"{yr}-06-01"
        end_d = f"{yr}-09-30"
        hist_resp = default_weather_service.get_historical(lat, lon, start_d, end_d)
        
        if hist_resp and hist_resp.records:
            total_rain = sum(r.rainfallMm for r in hist_resp.records)
            rainy_days = [r for r in hist_resp.records if r.rainfallMm >= 2.5]
            heavy_days = sum(1 for r in hist_resp.records if r.rainfallMm >= 64.5)

            # Dry spell calculation
            max_dry = 0
            curr_dry = 0
            dry_episodes = 0
            for r in hist_resp.records:
                if r.rainfallMm < 2.5:
                    curr_dry += 1
                    if curr_dry > max_dry:
                        max_dry = curr_dry
                    if curr_dry == 5:
                        dry_episodes += 1
                else:
                    curr_dry = 0

            # Estimate onset day of year (first 3-day cluster of rainfall >= 25mm)
            onset_doy = 162 # default June 11
            onset_date = f"{yr}-06-11"
            running_3day = 0.0
            for idx, r in enumerate(hist_resp.records[:30]):
                running_3day += r.rainfallMm
                if idx >= 2:
                    if idx > 2:
                        running_3day -= hist_resp.records[idx - 3].rainfallMm
                    if running_3day >= 25.0:
                        onset_doy = 152 + idx + 1
                        onset_date = r.date
                        break

            dep = round(((total_rain - climatological_normal) / climatological_normal) * 100, 1)

            results.append(HistoricalRecord(
                year=yr,
                monsoonOnsetDayOfYear=onset_doy,
                monsoonOnsetDate=onset_date,
                totalSeasonalRainfallMm=round(total_rain, 1),
                normalSeasonalRainfallMm=climatological_normal,
                departurePercentage=dep,
                drySpellEpisodes=dry_episodes,
                maxConsecutiveDryDays=max_dry,
                heavyRainfallDays=heavy_days,
            ))

    return results
