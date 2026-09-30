from typing import List, Optional, Literal
from pydantic import BaseModel, Field

RiskLevel = Literal['LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL']
ForecastHorizon = Literal[7, 14, 21, 30]

class ProbabilityMetric(BaseModel):
    value: int
    risk: RiskLevel
    confidence: int
    trend: Literal['increasing', 'stable', 'decreasing']
    deltaVsNormal: float
    description: str

class DailyOutlook(BaseModel):
    dayIndex: int
    date: str
    rainfallMm: float
    probabilityOfPrecipitation: int
    tMaxCelsius: float
    tMinCelsius: float
    humidityPct: int
    windSpeedKmph: float
    monsoonPhase: Literal['pre-onset', 'active', 'break', 'revival', 'normal']

class ContributingFactor(BaseModel):
    factor: str
    category: Literal['global_climate', 'atmospheric', 'regional_surface', 'historical_analogue']
    impact: Literal['positive', 'negative', 'neutral']
    shapValue: float
    weightPct: int
    explanation: str

class RainfallOutlook(BaseModel):
    expectedMm: float
    normalMm: float
    anomalyPercentage: float
    rainyDaysExpected: int
    consecutiveDryDaysExpected: int

class ForecastMetrics(BaseModel):
    onsetProbability: ProbabilityMetric
    breakProbability: ProbabilityMetric
    heavyRainProbability: ProbabilityMetric
    revivalProbability: ProbabilityMetric

class HyperlocalForecastResponse(BaseModel):
    locationId: str
    locationName: str
    forecastDate: str
    horizonDays: ForecastHorizon
    modelIdentifier: str
    dataTimestamp: str
    overallRisk: RiskLevel
    confidenceScore: int
    metrics: ForecastMetrics
    rainfallOutlook: RainfallOutlook
    dailyTimeline: List[DailyOutlook]
    contributingFactors: List[ContributingFactor]

class ClimateSignalItem(BaseModel):
    signalType: Literal['ENSO', 'IOD', 'MJO']
    name: str
    currentValue: Optional[str] = None
    numericalIndex: Optional[float] = None
    phaseOrState: Optional[str] = None
    historicalBaseline: Optional[str] = None
    trend: Optional[str] = None
    monsoonInfluence: Optional[str] = None
    influenceRating: Optional[str] = None
    observationDate: Optional[str] = None
    dataSource: Optional[str] = None
    dataFreshness: Optional[str] = None
    status: Literal['active', 'updating', 'stale', 'unavailable']

class AgriculturalAdvisoryItem(BaseModel):
    id: str
    locationId: str
    cropId: str
    cropName: str
    cropStage: str
    category: str
    recommendedAction: str
    scientificReason: str
    forecastPeriod: str
    riskLevel: RiskLevel
    confidenceScore: int
    ruleReference: str
    createdAt: str

class MonsoonAlertItem(BaseModel):
    id: str
    locationId: str
    locationName: str
    category: Literal['MONSOON ONSET', 'DRY SPELL', 'HEAVY RAIN', 'REVIVAL', 'AGRICULTURAL ACTION']
    severity: RiskLevel
    title: str
    eventDescription: str
    forecastPeriod: str
    recommendedAction: str
    createdAt: str
    broadcastChannels: List[str]

class HistoricalRecord(BaseModel):
    year: int
    monsoonOnsetDayOfYear: int
    monsoonOnsetDate: str
    totalSeasonalRainfallMm: float
    normalSeasonalRainfallMm: float
    departurePercentage: float
    drySpellEpisodes: int
    maxConsecutiveDryDays: int
    heavyRainfallDays: int

class DataSourceHealth(BaseModel):
    sourceName: str
    provider: str
    category: str
    lastSuccessfulUpdate: Optional[str] = None
    freshness: Optional[str] = None
    pingLatencyMs: Optional[int] = None
    status: str
    recordsProcessedToday: int

class ModelVersionHealth(BaseModel):
    modelId: str
    name: str
    targetTask: str
    algorithm: str
    trainingDatasetPeriod: Optional[str] = None
    crossValidatedScore: Optional[str] = None
    lastPredictionRun: Optional[str] = None
    status: str

class SystemDataStatusResponse(BaseModel):
    dataSources: List[DataSourceHealth]
    modelVersions: List[ModelVersionHealth]
    systemHealth: dict
