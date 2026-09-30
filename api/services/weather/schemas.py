from typing import List, Optional
from pydantic import BaseModel

class CurrentWeatherResponse(BaseModel):
    latitude: float
    longitude: float
    temperatureCelsius: float
    humidityPct: float
    rainfallMm: float
    windSpeedKmph: float
    windDirectionDeg: float
    surfacePressureHpa: float
    soilMoisture0to7cmPct: Optional[float] = None
    soilMoisture7to28cmPct: Optional[float] = None
    weatherCondition: str
    observedAt: str
    source: str
    lastUpdated: str

class HourlyForecastItem(BaseModel):
    time: str
    temperatureCelsius: float
    humidityPct: float
    precipitationProbabilityPct: int
    rainfallMm: float
    windSpeedKmph: float

class DailyForecastItem(BaseModel):
    date: str
    leadDay: int
    tMaxCelsius: float
    tMinCelsius: float
    rainfallMm: float
    precipitationProbabilityPct: int
    windSpeedKmph: float
    evapotranspirationMm: Optional[float] = None
    weatherCondition: str

class WeatherForecastResponse(BaseModel):
    latitude: float
    longitude: float
    forecastDays: int
    source: str
    lastUpdated: str
    hourly: List[HourlyForecastItem]
    daily: List[DailyForecastItem]

class HistoricalDayItem(BaseModel):
    date: str
    tMaxCelsius: float
    tMinCelsius: float
    rainfallMm: float

class HistoricalWeatherResponse(BaseModel):
    latitude: float
    longitude: float
    startDate: str
    endDate: str
    source: str
    records: List[HistoricalDayItem]
