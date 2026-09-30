import {
  ForecastHorizon,
  HyperlocalForecast,
  ClimateSignalData,
  AgriculturalAdvisory,
  MonsoonAlert,
  HistoricalRainfallRecord,
  SystemDataSourceStatus,
  ModelVersionStatus,
  CropStage,
} from '../../shared/types';

export interface CurrentWeather {
  latitude: number;
  longitude: number;
  temperatureCelsius: number;
  humidityPct: number;
  rainfallMm: number;
  windSpeedKmph: number;
  windDirectionDeg: number;
  surfacePressureHpa: number;
  soilMoisture0to7cmPct?: number;
  soilMoisture7to28cmPct?: number;
  weatherCondition: string;
  observedAt: string;
  source: string;
  lastUpdated: string;
}

export interface WeatherForecast {
  latitude: number;
  longitude: number;
  forecastDays: number;
  source: string;
  lastUpdated: string;
  hourly: Array<{
    time: string;
    temperatureCelsius: number;
    humidityPct: number;
    precipitationProbabilityPct: number;
    rainfallMm: number;
    windSpeedKmph: number;
  }>;
  daily: Array<{
    date: string;
    leadDay: number;
    tMaxCelsius: number;
    tMinCelsius: number;
    rainfallMm: number;
    precipitationProbabilityPct: number;
    windSpeedKmph: number;
    evapotranspirationMm?: number;
    weatherCondition: string;
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchFromApi<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`API request failed for ${path}: status ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(`API network error connecting to ${path}:`, error);
    return null;
  }
}

export const apiClient = {
  // Locations endpoint
  async getLocations(): Promise<any[] | null> {
    return fetchFromApi<any[]>('/locations');
  },

  async searchLocations(q: string): Promise<any[] | null> {
    if (!q || q.length < 2) return [];
    return fetchFromApi<any[]>(`/locations/search?q=${encodeURIComponent(q)}`);
  },

  // Operational Weather endpoints (Open-Meteo)
  async getWeatherCurrent(params: { lat?: number; lon?: number; locationId?: string }): Promise<CurrentWeather | null> {
    const p = new URLSearchParams();
    if (params.lat !== undefined) p.append('lat', params.lat.toString());
    if (params.lon !== undefined) p.append('lon', params.lon.toString());
    if (params.locationId) p.append('locationId', params.locationId);
    return fetchFromApi<CurrentWeather>(`/weather/current?${p.toString()}`);
  },

  async getWeatherForecast(params: { lat?: number; lon?: number; locationId?: string; days?: number }): Promise<WeatherForecast | null> {
    const p = new URLSearchParams();
    if (params.lat !== undefined) p.append('lat', params.lat.toString());
    if (params.lon !== undefined) p.append('lon', params.lon.toString());
    if (params.locationId) p.append('locationId', params.locationId);
    if (params.days) p.append('days', params.days.toString());
    return fetchFromApi<WeatherForecast>(`/weather/forecast?${p.toString()}`);
  },

  async getWeatherHistorical(params: { lat?: number; lon?: number; locationId?: string; startDate?: string; endDate?: string }): Promise<any | null> {
    const p = new URLSearchParams();
    if (params.lat !== undefined) p.append('lat', params.lat.toString());
    if (params.lon !== undefined) p.append('lon', params.lon.toString());
    if (params.locationId) p.append('locationId', params.locationId);
    if (params.startDate) p.append('startDate', params.startDate);
    if (params.endDate) p.append('endDate', params.endDate);
    return fetchFromApi<any>(`/weather/historical?${p.toString()}`);
  },

  // Forecast endpoint
  async getForecast(locationId: string, days: ForecastHorizon = 14): Promise<HyperlocalForecast | null> {
    return fetchFromApi<HyperlocalForecast>(`/forecast/${locationId}?days=${days}`);
  },

  // Climate signals
  async getClimateSignals(): Promise<ClimateSignalData[] | null> {
    return fetchFromApi<ClimateSignalData[]>('/climate-signals');
  },

  // GeoJSON Risk Map
  async getRiskMap(layer = 'overall', days: ForecastHorizon = 14): Promise<any | null> {
    return fetchFromApi<any>(`/risk-map?layer=${layer}&days=${days}`);
  },

  // Agricultural Advisories
  async getAdvisories(
    locationId: string,
    cropId?: string,
    stage?: CropStage
  ): Promise<AgriculturalAdvisory[] | null> {
    let query = `/advisory/${locationId}`;
    const params = new URLSearchParams();
    if (cropId) params.append('cropId', cropId);
    if (stage) params.append('stage', stage);
    if (params.toString()) query += `?${params.toString()}`;
    return fetchFromApi<AgriculturalAdvisory[]>(query);
  },

  // Alerts
  async getAlerts(locationId?: string): Promise<MonsoonAlert[] | null> {
    const query = locationId ? `/alerts?locationId=${locationId}` : '/alerts';
    return fetchFromApi<MonsoonAlert[]>(query);
  },

  // Explainability
  async getExplainability(locationId: string, days: ForecastHorizon = 14): Promise<any | null> {
    return fetchFromApi<any>(`/explainability/${locationId}?days=${days}`);
  },

  // Historical Analytics
  async getHistorical(locationId: string): Promise<HistoricalRainfallRecord[] | null> {
    return fetchFromApi<HistoricalRainfallRecord[]>(`/historical/${locationId}`);
  },

  // Admin Data & Model Monitoring
  async getDataStatus(): Promise<{
    dataSources: SystemDataSourceStatus[];
    modelVersions: ModelVersionStatus[];
    systemHealth: { status: string; uptimeHours: number; activeRequests: number };
  } | null> {
    return fetchFromApi<{
      dataSources: SystemDataSourceStatus[];
      modelVersions: ModelVersionStatus[];
      systemHealth: { status: string; uptimeHours: number; activeRequests: number };
    }>('/data-status');
  },
};
