from typing import Optional
from api.services.weather.base import WeatherDataProvider
from api.services.weather.open_meteo import OpenMeteoWeatherProvider
from api.services.weather.schemas import (
    CurrentWeatherResponse,
    WeatherForecastResponse,
    HistoricalWeatherResponse,
)

class WeatherService:
    def __init__(self, provider: Optional[WeatherDataProvider] = None):
        self.provider = provider or OpenMeteoWeatherProvider()

    def get_current(self, lat: float, lon: float) -> Optional[CurrentWeatherResponse]:
        return self.provider.get_current_weather(lat, lon)

    def get_forecast(self, lat: float, lon: float, days: int = 14) -> Optional[WeatherForecastResponse]:
        return self.provider.get_daily_forecast(lat, lon, days)

    def get_historical(self, lat: float, lon: float, start_date: str, end_date: str) -> Optional[HistoricalWeatherResponse]:
        return self.provider.get_historical_weather(lat, lon, start_date, end_date)

default_weather_service = WeatherService()
