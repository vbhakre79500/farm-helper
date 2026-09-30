"""
Meteorological Feature Engineering:
Extracts physically consistent features from numerical weather forecasts,
gridded surface observations, and planetary teleconnections.
"""

from typing import List, Dict, Any

def compute_monsoon_features(
    daily_rainfall: List[float],
    t_max_list: List[float],
    t_min_list: List[float],
    enso_index: float = 0.0,
    mjo_active: bool = False
) -> Dict[str, Any]:
    """
    Computes physical diagnostic features for onset and break classification.
    """
    total_rain = sum(daily_rainfall)
    rainy_days = sum(1 for r in daily_rainfall if r >= 2.5) # IMD wet-day threshold
    
    # Calculate consecutive dry days
    max_dry_streak = 0
    curr_dry_streak = 0
    for r in daily_rainfall:
        if r < 2.5:
            curr_dry_streak += 1
            if curr_dry_streak > max_dry_streak:
                max_dry_streak = curr_dry_streak
        else:
            curr_dry_streak = 0

    # Max single-day precipitation
    peak_daily_rain = max(daily_rainfall) if daily_rainfall else 0.0

    # Temperature diurnal range
    avg_diurnal_range = (
        sum(tx - tn for tx, tn in zip(t_max_list, t_min_list)) / len(t_max_list)
        if t_max_list and len(t_max_list) == len(t_min_list) else 10.0
    )

    return {
        "totalRainMm": round(total_rain, 1),
        "rainyDaysCount": rainy_days,
        "maxConsecutiveDryDays": max_dry_streak,
        "peakDailyRainMm": round(peak_daily_rain, 1),
        "avgDiurnalRange": round(avg_diurnal_range, 1),
        "ensoIndex": enso_index,
        "mjoActive": mjo_active,
    }
