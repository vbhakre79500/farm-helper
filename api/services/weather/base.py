from abc import ABC, abstractmethod
from typing import Optional
from api.services.weather.schemas import (
    CurrentWeatherResponse,
    WeatherForecastResponse,
    HistoricalWeatherResponse,
)

class WeatherDataProvider(ABC):
    """
    Abstract contract for meteorological data providers.
    All implementations must return verified provider data or raise exceptions on failure.
    """
    @abstractmethod
    def get_current_weather(self, lat: float, lon: float) -> Optional[CurrentWeatherResponse]:
        pass

    @abstractmethod
    def get_hourly_forecast(self, lat: float, lon: float, hours: int = 48):
        pass

    @abstractmethod
    def get_daily_forecast(self, lat: float, lon: float, days: int = 14) -> Optional[WeatherForecastResponse]:
        pass

    @abstractmethod
    def get_historical_weather(self, lat: float, lon: float, start_date: str, end_date: str) -> Optional[HistoricalWeatherResponse]:
        pass
