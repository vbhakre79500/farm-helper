"""
Forecast Service:
Interfaces between model provider, meteorological feeds, and the API.
Returns None when prediction service is unavailable.
"""

from typing import Dict, Any, Optional
from api.services.providers import ForecastProvider

provider = ForecastProvider()

def generate_hyperlocal_forecast(location_id: str, lead_days: int = 14) -> Optional[Dict[str, Any]]:
    return provider.get_forecast(location_id, lead_days)
