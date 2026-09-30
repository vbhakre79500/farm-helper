from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from api.data.location_repository import get_all_states, get_location_by_id, search_locations_live

router = APIRouter(prefix="", tags=["Locations"])

@router.get("/locations", response_model=List[Dict[str, Any]])
def get_locations():
    """
    Returns verified administrative location hierarchy across states, districts, blocks, and panchayats.
    """
    return get_all_states()

@router.get("/locations/search", response_model=List[Dict[str, Any]])
def search_locations(q: str = Query(..., min_length=2, description="Location search query")):
    """
    Searches administrative hierarchy and live geocoding service for real latitude/longitude coordinates.
    """
    return search_locations_live(q)

@router.get("/locations/{location_id}")
def get_location_detail(location_id: str):
    loc = get_location_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found in administrative registry.")
    return loc
