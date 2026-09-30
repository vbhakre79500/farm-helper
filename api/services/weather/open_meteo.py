import requests
from datetime import datetime
from typing import Optional, Dict
from api.services.weather.base import WeatherDataProvider
from api.services.weather.schemas import (
    CurrentWeatherResponse,
    WeatherForecastResponse,
    HistoricalWeatherResponse,
    HourlyForecastItem,
    DailyForecastItem,
    HistoricalDayItem,
)

WMO_WEATHER_CODES: Dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

class OpenMeteoWeatherProvider(WeatherDataProvider):
    """
    Open-Meteo Operational Meteorological Provider.
    Queries global numerical weather models (ECMWF, GFS, ICON) without fabrication.
    """
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1"
        self.archive_url = "https://archive-api.open-meteo.com/v1/archive"

    def get_current_weather(self, lat: float, lon: float) -> Optional[CurrentWeatherResponse]:
        url = (
            f"{self.base_url}/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,"
            "wind_speed_10m,wind_direction_10m,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,weather_code"
            "&timezone=auto"
        )
        try:
            resp = requests.get(url, timeout=6.0)
            if resp.status_code != 200:
                return None
            data = resp.json()
            curr = data.get("current", {})
            w_code = curr.get("weather_code", 0)
            cond = WMO_WEATHER_CODES.get(w_code, "Partly cloudy")
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M")

            return CurrentWeatherResponse(
                latitude=data.get("latitude", lat),
                longitude=data.get("longitude", lon),
                temperatureCelsius=float(curr.get("temperature_2m", 0.0)),
                humidityPct=float(curr.get("relative_humidity_2m", 0.0)),
                rainfallMm=float(curr.get("precipitation", 0.0)),
                windSpeedKmph=float(curr.get("wind_speed_10m", 0.0)),
                windDirectionDeg=float(curr.get("wind_direction_10m", 0.0)),
                surfacePressureHpa=float(curr.get("surface_pressure", 1013.25)),
                soilMoisture0to7cmPct=float(curr.get("soil_moisture_0_to_7cm", 0.0)) if curr.get("soil_moisture_0_to_7cm") is not None else None,
                soilMoisture7to28cmPct=float(curr.get("soil_moisture_7_to_28cm", 0.0)) if curr.get("soil_moisture_7_to_28cm") is not None else None,
                weatherCondition=cond,
                observedAt=curr.get("time", now_iso),
                source="Open-Meteo Operational Forecast API",
                lastUpdated=now_iso,
            )
        except Exception as e:
            print(f"Open-Meteo current weather error: {e}")
            return None

    def get_hourly_forecast(self, lat: float, lon: float, hours: int = 48):
        # Retrieved as part of get_daily_forecast
        return None

    def get_daily_forecast(self, lat: float, lon: float, days: int = 14) -> Optional[WeatherForecastResponse]:
        forecast_days = min(days, 16)
        url = (
            f"{self.base_url}/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m"
            "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,et0_fao_evapotranspiration"
            f"&timezone=auto&forecast_days={forecast_days}"
        )
        try:
            resp = requests.get(url, timeout=7.0)
            if resp.status_code != 200:
                return None
            data = resp.json()
            daily_data = data.get("daily", {})
            hourly_data = data.get("hourly", {})
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M")

            dates = daily_data.get("time", [])
            t_max = daily_data.get("temperature_2m_max", [])
            t_min = daily_data.get("temperature_2m_min", [])
            rain = daily_data.get("precipitation_sum", [])
            pop = daily_data.get("precipitation_probability_max", [])
            wind = daily_data.get("wind_speed_10m_max", [])
            et0 = daily_data.get("et0_fao_evapotranspiration", [])
            w_codes = daily_data.get("weather_code", [])

            daily_items = []
            for i in range(len(dates)):
                daily_items.append(DailyForecastItem(
                    date=dates[i],
                    leadDay=i + 1,
                    tMaxCelsius=float(t_max[i]) if i < len(t_max) and t_max[i] is not None else 0.0,
                    tMinCelsius=float(t_min[i]) if i < len(t_min) and t_min[i] is not None else 0.0,
                    rainfallMm=float(rain[i]) if i < len(rain) and rain[i] is not None else 0.0,
                    precipitationProbabilityPct=int(pop[i]) if i < len(pop) and pop[i] is not None else 0,
                    windSpeedKmph=float(wind[i]) if i < len(wind) and wind[i] is not None else 0.0,
                    evapotranspirationMm=float(et0[i]) if i < len(et0) and et0[i] is not None else None,
                    weatherCondition=WMO_WEATHER_CODES.get(w_codes[i] if i < len(w_codes) else 0, "Partly cloudy"),
                ))

            # Sample first 24 hours of hourly forecast
            h_times = hourly_data.get("time", [])
            h_temps = hourly_data.get("temperature_2m", [])
            h_hum = hourly_data.get("relative_humidity_2m", [])
            h_pop = hourly_data.get("precipitation_probability", [])
            h_rain = hourly_data.get("precipitation", [])
            h_wind = hourly_data.get("wind_speed_10m", [])

            hourly_items = []
            max_h = min(24, len(h_times))
            for j in range(max_h):
                hourly_items.append(HourlyForecastItem(
                    time=h_times[j],
                    temperatureCelsius=float(h_temps[j]) if j < len(h_temps) else 0.0,
                    humidityPct=float(h_hum[j]) if j < len(h_hum) else 0.0,
                    precipitationProbabilityPct=int(h_pop[j]) if j < len(h_pop) and h_pop[j] is not None else 0,
                    rainfallMm=float(h_rain[j]) if j < len(h_rain) and h_rain[j] is not None else 0.0,
                    windSpeedKmph=float(h_wind[j]) if j < len(h_wind) else 0.0,
                ))

            return WeatherForecastResponse(
                latitude=data.get("latitude", lat),
                longitude=data.get("longitude", lon),
                forecastDays=forecast_days,
                source="Open-Meteo Operational Forecast API",
                lastUpdated=now_iso,
                hourly=hourly_items,
                daily=daily_items,
            )
        except Exception as e:
            print(f"Open-Meteo daily forecast error: {e}")
            return None

    def get_historical_weather(self, lat: float, lon: float, start_date: str, end_date: str) -> Optional[HistoricalWeatherResponse]:
        url = (
            f"{self.archive_url}"
            f"?latitude={lat}&longitude={lon}"
            f"&start_date={start_date}&end_date={end_date}"
            "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
            "&timezone=auto"
        )
        try:
            resp = requests.get(url, timeout=9.0)
            if resp.status_code != 200:
                return None
            data = resp.json()
            daily_data = data.get("daily", {})
            times = daily_data.get("time", [])
            t_max = daily_data.get("temperature_2m_max", [])
            t_min = daily_data.get("temperature_2m_min", [])
            rain = daily_data.get("precipitation_sum", [])

            records = []
            for i in range(len(times)):
                records.append(HistoricalDayItem(
                    date=times[i],
                    tMaxCelsius=float(t_max[i]) if i < len(t_max) and t_max[i] is not None else 0.0,
                    tMinCelsius=float(t_min[i]) if i < len(t_min) and t_min[i] is not None else 0.0,
                    rainfallMm=float(rain[i]) if i < len(rain) and rain[i] is not None else 0.0,
                ))

            return HistoricalWeatherResponse(
                latitude=data.get("latitude", lat),
                longitude=data.get("longitude", lon),
                startDate=start_date,
                endDate=end_date,
                source="Copernicus ERA5-Land / Open-Meteo Archive",
                records=records,
            )
        except Exception as e:
            print(f"Open-Meteo historical archive error: {e}")
            return None
