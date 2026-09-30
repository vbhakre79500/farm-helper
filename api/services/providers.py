"""
Provider interfaces for MONSOON-SENSE data architecture.
All providers report status: 'available', 'unavailable', or 'error'.
Never falls back to fabricated or synthetic values.
"""

import os
from typing import List, Dict, Any, Optional

class ClimateDataProvider:
    def __init__(self):
        # Configuration flags (e.g. environment variables or connection strings)
        self.noaa_api_url = os.getenv("NOAA_CPC_API_URL")
        self.bom_dmi_url = os.getenv("BOM_DMI_API_URL")
        self.mjo_feed_url = os.getenv("MJO_ENSEMBLE_URL")

    def get_status(self) -> str:
        if self.noaa_api_url or self.bom_dmi_url or self.mjo_feed_url:
            return "available"
        return "unavailable"

    def get_signals(self) -> List[Dict[str, Any]]:
        """
        Retrieves real-time planetary climate signals.
        Returns unavailable status with null values when external providers are unconfigured.
        """
        if self.get_status() == "unavailable":
            return [
                {
                    "signalType": "ENSO",
                    "name": "Oceanic Niño Index (ONI - Niño 3.4)",
                    "currentValue": None,
                    "numericalIndex": None,
                    "phaseOrState": None,
                    "historicalBaseline": None,
                    "trend": None,
                    "monsoonInfluence": None,
                    "influenceRating": None,
                    "observationDate": None,
                    "dataSource": "NOAA Climate Prediction Center",
                    "dataFreshness": None,
                    "status": "unavailable",
                },
                {
                    "signalType": "IOD",
                    "name": "Indian Ocean Dipole (Dipole Mode Index - DMI)",
                    "currentValue": None,
                    "numericalIndex": None,
                    "phaseOrState": None,
                    "historicalBaseline": None,
                    "trend": None,
                    "monsoonInfluence": None,
                    "influenceRating": None,
                    "observationDate": None,
                    "dataSource": "Australian Bureau of Meteorology",
                    "dataFreshness": None,
                    "status": "unavailable",
                },
                {
                    "signalType": "MJO",
                    "name": "Madden–Julian Oscillation (RMM Index)",
                    "currentValue": None,
                    "numericalIndex": None,
                    "phaseOrState": None,
                    "historicalBaseline": None,
                    "trend": None,
                    "monsoonInfluence": None,
                    "influenceRating": None,
                    "observationDate": None,
                    "dataSource": "BoM & NOAA NCEP MJO Ensemble",
                    "dataFreshness": None,
                    "status": "unavailable",
                },
            ]
        # In a configured environment, HTTP requests would fetch and parse live telemetry here
        return []

class GeospatialDataProvider:
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        self.geojson_path = os.getenv("GEOJSON_DATA_PATH")

    def get_status(self) -> str:
        if self.db_url or (self.geojson_path and os.path.exists(self.geojson_path)):
            return "available"
        return "unavailable"

    def get_locations(self) -> List[Dict[str, Any]]:
        # Returns empty list when no database/file is configured
        return []

    def get_risk_map_features(self, layer: str, days: int) -> List[Dict[str, Any]]:
        # Returns empty feature collection when no geographic database is connected
        return []

class ForecastProvider:
    def __init__(self):
        self.model_path = os.getenv("PREDICTION_MODEL_PATH")
        self.nwp_feed = os.getenv("NWP_MET_FEED_URL")

    def get_status(self) -> str:
        if self.model_path and os.path.exists(self.model_path):
            return "available"
        return "unavailable"

    def get_forecast(self, location_id: str, lead_days: int) -> Optional[Dict[str, Any]]:
        """
        Retrieves prediction only when validated model pipeline is connected.
        Returns None when unconfigured so frontend renders EmptyState.
        """
        if self.get_status() == "unavailable":
            return None
        return None

class HistoricalDataProvider:
    def __init__(self):
        self.archive_path = os.getenv("HISTORICAL_ARCHIVE_PATH")

    def get_status(self) -> str:
        if self.archive_path and os.path.exists(self.archive_path):
            return "available"
        return "unavailable"

    def get_historical_records(self, location_id: str) -> List[Dict[str, Any]]:
        # Returns empty list when unconfigured
        return []

class AlertProvider:
    def __init__(self):
        self.alerts_feed = os.getenv("ALERTS_FEED_URL")

    def get_alerts(self, location_id: Optional[str] = None) -> List[Dict[str, Any]]:
        # Returns empty list when no active verified alerts exist
        return []
