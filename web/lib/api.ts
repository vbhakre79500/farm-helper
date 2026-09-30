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
  StateOption,
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

export function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL?.trim();

  // In browser runtime: If running in production (e.g. on Vercel or external domain)
  // and NEXT_PUBLIC_API_URL is missing or incorrectly points to localhost,
  // default to the verified production Render backend.
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!url && !isLocalhost) {
      url = 'https://farm-helper-kglt.onrender.com/api';
    } else if (url && url.includes('localhost') && !isLocalhost) {
      url = 'https://farm-helper-kglt.onrender.com/api';
    }
  }

  if (!url) {
    url = 'http://localhost:8000/api';
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Ensure /api suffix
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
}

async function fetchFromApi<T>(path: string, options?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${baseUrl}${cleanPath}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`API request failed for ${targetUrl}: status ${res.status}`);
      // Fallback: If 404 and baseUrl ends with /api, try root path in case endpoint is mounted at root
      if (res.status === 404 && baseUrl.endsWith('/api')) {
        const rootBase = baseUrl.slice(0, -4);
        const rootUrl = `${rootBase}${cleanPath}`;
        try {
          const rootRes = await fetch(rootUrl, {
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            ...options,
            cache: 'no-store',
          });
          if (rootRes.ok) {
            return (await rootRes.json()) as T;
          }
        } catch {
          // Ignore root fallback error
        }
      }
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(`API network error connecting to ${targetUrl}:`, error);

    // If local fetch failed while running in browser, attempt fallback to production Render API
    if (baseUrl.includes('localhost') && typeof window !== 'undefined') {
      const renderFallbackUrl = `https://farm-helper-kglt.onrender.com/api${cleanPath}`;
      try {
        const fbRes = await fetch(renderFallbackUrl, {
          headers: { 'Content-Type': 'application/json', ...options?.headers },
          ...options,
          cache: 'no-store',
        });
        if (fbRes.ok) {
          return (await fbRes.json()) as T;
        }
      } catch {
        // Ignore fallback error
      }
    }

    return null;
  }
}

export const apiClient = {
  // Locations endpoint
  async getLocations(): Promise<StateOption[] | null> {
    return fetchFromApi<StateOption[]>('/locations');
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
