from fastapi import APIRouter
from typing import List, Dict, Any
from api.services.climate_service import climate_signal_service

router = APIRouter(prefix="", tags=["Climate Signals"])

@router.get("/climate-signals", response_model=List[Dict[str, Any]])
def get_climate_signals():
    """
    Returns verified global climate signals (ENSO, IOD, MJO) from NOAA CPC and BoM monitoring feeds.
    Returns status: 'unavailable' and null fields whenever upstream feeds are unreachable.
    Never fabricates fallback values.
    """
    return climate_signal_service.get_all_signals()
