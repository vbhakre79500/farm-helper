export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'farmer' | 'officer' | 'admin';

export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export type ForecastHorizon = 7 | 14 | 21 | 30;

export interface GeoLocation {
  id: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  blockId: string;
  blockName: string;
  panchayatId: string;
  panchayatName: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  agroClimaticZone: string;
  soilType: string;
}

export interface StateOption {
  id: string;
  name: string;
  districts: DistrictOption[];
}

export interface DistrictOption {
  id: string;
  name: string;
  stateId: string;
  blocks: BlockOption[];
}

export interface BlockOption {
  id: string;
  name: string;
  districtId: string;
  latitude?: number;
  longitude?: number;
  panchayats: PanchayatOption[];
}

export interface PanchayatOption {
  id: string;
  name: string;
  blockId: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
}

export interface ProbabilityMetric {
  value: number; // 0 - 100%
  risk: RiskLevel;
  confidence: number; // 0 - 100%
  trend: 'increasing' | 'stable' | 'decreasing';
  deltaVsNormal: number; // anomaly percentage or mm
  description: string;
}

export interface HyperlocalForecast {
  locationId: string;
  locationName: string;
  forecastDate: string;
  horizonDays: ForecastHorizon;
  modelIdentifier: string;
  dataTimestamp: string;
  overallRisk: RiskLevel;
  confidenceScore: number;
  metrics: {
    onsetProbability: ProbabilityMetric;
    breakProbability: ProbabilityMetric;
    heavyRainProbability: ProbabilityMetric;
    revivalProbability: ProbabilityMetric;
  };
  rainfallOutlook: {
    expectedMm: number;
    normalMm: number;
    anomalyPercentage: number;
    rainyDaysExpected: number;
    consecutiveDryDaysExpected: number;
  };
  dailyTimeline: DailyOutlook[];
  contributingFactors: ContributingFactor[];
}

export interface DailyOutlook {
  dayIndex: number;
  date: string;
  rainfallMm: number;
  probabilityOfPrecipitation: number;
  tMaxCelsius: number;
  tMinCelsius: number;
  humidityPct: number;
  windSpeedKmph: number;
  monsoonPhase: 'pre-onset' | 'active' | 'break' | 'revival' | 'normal';
}

export interface ContributingFactor {
  factor: string;
  category: 'global_climate' | 'atmospheric' | 'regional_surface' | 'historical_analogue';
  impact: 'positive' | 'negative' | 'neutral';
  shapValue: number;
  weightPct: number;
  explanation: string;
}

export type ClimateSignalType = 'ENSO' | 'IOD' | 'MJO';

export interface ClimateSignalData {
  signalType: ClimateSignalType;
  name: string;
  currentValue: string | null;
  numericalIndex?: number | null;
  phaseOrState?: string | null;
  historicalBaseline?: string | null;
  trend?: 'strengthening' | 'weakening' | 'neutral' | null;
  monsoonInfluence?: string | null;
  influenceRating?: 'favorable' | 'unfavorable' | 'neutral' | null;
  observationDate?: string | null;
  dataSource?: string | null;
  dataFreshness?: string | null;
  status: 'active' | 'updating' | 'stale' | 'unavailable';
}

export type CropCategory = 'Rice' | 'Soybean' | 'Cotton' | 'Maize' | 'Pulses' | 'Groundnut' | 'Wheat';

export type CropStage =
  | 'Land Preparation'
  | 'Sowing & Germination'
  | 'Vegetative Growth'
  | 'Flowering & Pod/Panicle'
  | 'Grain Filling'
  | 'Maturity & Harvest';

export type AdvisoryCategory =
  | 'Sowing'
  | 'Irrigation'
  | 'Fertilizer'
  | 'Crop Selection'
  | 'Drainage'
  | 'Crop Protection'
  | 'Harvest Planning'
  | 'Dry-Spell Preparedness'
  | 'Heavy-Rain Preparedness';

export interface CropInfo {
  id: string;
  name: string;
  category: CropCategory;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  stages: CropStage[];
  optimalRainfallMm: number;
  criticalDrySpellToleranceDays: number;
  waterloggingSensitivity: 'Low' | 'Moderate' | 'High';
}

export interface AgriculturalAdvisory {
  id: string;
  locationId: string;
  cropId: string;
  cropName: string;
  cropStage: CropStage;
  category: AdvisoryCategory;
  recommendedAction: string;
  scientificReason: string;
  forecastPeriod: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  ruleReference: string;
  createdAt: string;
}

export interface MonsoonAlert {
  id: string;
  locationId: string;
  locationName: string;
  category: 'MONSOON ONSET' | 'DRY SPELL' | 'HEAVY RAIN' | 'REVIVAL' | 'AGRICULTURAL ACTION';
  severity: RiskLevel;
  title: string;
  eventDescription: string;
  forecastPeriod: string;
  recommendedAction: string;
  createdAt: string;
  broadcastChannels: ('SMS' | 'WhatsApp' | 'In-app notification')[];
}

export interface SystemDataSourceStatus {
  sourceName: string;
  provider: string;
  category: 'Climate Signals' | 'Weather Observations' | 'Satellite Reanalysis' | 'Geospatial Registry';
  lastSuccessfulUpdate: string | null;
  freshness: string | null;
  pingLatencyMs: number | null;
  status: 'Operational' | 'Degraded' | 'Offline' | 'Not Connected';
  recordsProcessedToday: number;
}

export interface ModelVersionStatus {
  modelId: string;
  name: string;
  targetTask: string;
  algorithm: string;
  trainingDatasetPeriod: string | null;
  crossValidatedScore: string | null;
  lastPredictionRun: string | null;
  status: 'Active' | 'Validating' | 'Retired' | 'Not Configured';
}

export interface HistoricalRainfallRecord {
  year: number;
  monsoonOnsetDayOfYear: number;
  monsoonOnsetDate: string;
  totalSeasonalRainfallMm: number;
  normalSeasonalRainfallMm: number;
  departurePercentage: number;
  drySpellEpisodes: number;
  maxConsecutiveDryDays: number;
  heavyRainfallDays: number;
}
