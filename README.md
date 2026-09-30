# MONSOON-SENSE
**Hyperlocal Monsoon Onset & Break Prediction System (Block/Village Scale)**

---

## 1. Product Overview
MONSOON-SENSE is an architectural software platform designed for sub-seasonal climate intelligence and agricultural decision support at Block and Gram Panchayat spatial resolution. The system is engineered to provide 7-to-30-day probabilistic outlooks for monsoon onset, dry spells (break-monsoon), heavy precipitation events, and revival phases, translating these meteorological scenarios into deterministic, crop-specific agricultural guidance.

---

## 2. Architecture
The application employs a decoupled, modular client-server architecture:
- **Presentation Layer**: Next.js 15 web application with server and client components, Zustand state synchronization, and accessible Leaflet geospatial interfaces.
- **API & Application Layer**: Python FastAPI service exposing standardized REST endpoints, input validation schemas, and modular routing.
- **Provider Abstraction Layer**: Pluggable provider interfaces isolating data retrieval logic for climate indices, numerical weather data, satellite products, and geospatial boundaries.
- **Decision Engine**: Rule-based agronomic expert system mapping forecasted meteorological states to crop phenological stages.

---

## 3. Frontend
- **Framework**: Next.js 15 (App Router, Strict TypeScript)
- **Styling**: Tailwind CSS with an agricultural and climate-informed color palette
- **State Management**: Centralized Zustand store synchronizing location hierarchy, horizon selection, user persona, and regional language across all views
- **Localization**: Translation dictionaries supporting English (`en`), Hindi (`hi`), and Marathi (`mr`)
- **Key Modules**:
  - `/`: Product overview, methodology, and architectural specifications
  - `/dashboard`: Primary farmer interface with probabilistic metric cards, rainfall outlook, and crop advisory peek
  - `/risk-map`: Interactive Leaflet map with GeoJSON layer toggling and explicit text risk classifications
  - `/forecast`: 7–30 day outlook with daily precipitation timelines and explainability panel
  - `/climate-signals`: Planetary teleconnection monitoring interface (ENSO, IOD, MJO)
  - `/advisories`: Agronomic rule matrix filterable by crop and growth stage
  - `/history`: Historical meteorological archives and multi-year seasonal comparisons
  - `/alerts`: Dissemination management with formatting adapters for SMS, WhatsApp, and in-app alerts
  - `/officer`: Multi-block surveillance dashboard and automated report compilation
  - `/admin`: Data pipeline status, provider connection monitoring, and model registry
  - `/how-it-works`: Step-by-step scientific pipeline and technical feasibility
  - `/settings`: Language, operational role, and alert preferences
  - `/login` & `/signup`: Role-based authentication interfaces

---

## 4. Backend
- **Framework**: FastAPI (Python 3.13)
- **Data Validation**: Pydantic v2 schemas
- **Middleware**: Cross-Origin Resource Sharing (CORS) configured for Next.js web client
- **Design Pattern**: Dependency-injected provider architecture returning explicit availability statuses and null fields when external feeds are unconfigured

---

## 5. GIS (Geographic Information System)
- **Mapping Library**: Leaflet with responsive viewport controls
- **Coordinate System**: WGS 84 (EPSG:4326)
- **Hierarchy**: State → District → Block → Gram Panchayat/Village
- **Layer Architecture**: Separate polygon overlays for Composite Risk, Onset, Break Hazard, Heavy Precipitation, and Revival Likelihood
- **Compliance Rule**: Map boundaries and hazard attributes render only from configured geospatial data sources; when unconfigured, the base map displays an informative status banner without synthetic geometry

---

## 6. Prediction Architecture
The platform is designed around a hybrid statistical and machine learning prediction framework:
- **Global Forcing**: Coupled oceanic-atmospheric indices (ENSO ONI, IOD DMI, MJO RMM phase and amplitude)
- **Regional Teleconnections**: Gridded surface observations, 850hPa zonal shear, and topography
- **Downscaling Pipeline**: Calibrated gradient-boosted decision trees (XGBoost/LightGBM) designed to downscale regional forecasts to a 0.05° (~5 km) target grid
- **Explainability**: SHAP (SHapley Additive exPlanations) attribution framework designed to quantify physical driver weights
- **Operational Principle**: Prediction endpoints report `unavailable` unless trained model artifacts and input data streams are connected

---

## 7. Advisory Engine
The advisory module operates as a deterministic, rule-based expert system:
- **Inputs**: Location metadata, crop selection, crop growth stage, and verified forecast metrics
- **Supported Crops**: Rice (Paddy), Soybean, Cotton, Maize, Pulses (Arhar), Groundnut, Wheat
- **Supported Stages**: Land Preparation, Sowing & Germination, Vegetative Growth, Flowering & Pod/Panicle, Grain Filling, Maturity & Harvest
- **Advisory Categories**: Sowing, Irrigation, Fertilizer, Drainage, Crop Protection, Harvest Planning, Dry-Spell Preparedness, Heavy-Rain Preparedness
- **Operational Principle**: Advisories are generated strictly when forecast data is present; no advisories are fabricated from simulated rainfall

---

## 8. Database
- **Recommended Database**: PostgreSQL 16 with PostGIS spatial extension
- **Schema Design**: Tables for `locations`, `states`, `districts`, `blocks`, `panchayats`, `climate_signals`, `weather_observations`, `forecast_runs`, `advisory_rules`, and `alerts`
- **Spatial Indexing**: GIST spatial indexes on polygon geometries
- **Empty State**: Database starts empty by default; no synthetic or development seed records are bundled

---

## 9. API Structure

| Method | Endpoint | Description | Unconfigured Response |
|---|---|---|---|
| `GET` | `/api/locations` | List administrative locations | `[]` |
| `GET` | `/api/forecast/{locationId}` | 7–30 day probabilistic forecast | `404 Not Found (unavailable)` |
| `GET` | `/api/climate-signals` | Live ENSO, IOD, MJO signals | Status: `unavailable`, null fields |
| `GET` | `/api/risk-map` | GeoJSON block hazard polygons | Empty FeatureCollection |
| `GET` | `/api/advisory/{locationId}` | Deterministic crop advisories | `[]` |
| `POST` | `/api/advisory/generate` | On-demand rule evaluation | `[]` |
| `GET` | `/api/alerts` | Verified hydrological/monsoon alerts | `[]` |
| `GET` | `/api/historical/{locationId}` | Historical rainfall records | `[]` |
| `GET` | `/api/data-status` | Connectivity and model status | Reports `Not Connected` / `Not Configured` |

---

## 10. Deployment
- **Frontend**: Deployable to any Node.js host or Vercel
- **Backend**: Deployable as an ASGI application via Uvicorn/Gunicorn to any containerized or cloud runtime
- **Static Assets**: Served via Next.js optimized asset pipeline

---

## 11. Configuration
The system is configured via environment variables in both the frontend and backend environments.

---

## 12. Data Provider Requirements
To transition from the current unconfigured state to active operations, the following data feeds must be provisioned:
1. **NOAA Climate Prediction Center**: ONI index data access
2. **Australian Bureau of Meteorology / INCOIS**: Equatorial Indian Ocean Dipole (DMI) index access
3. **BoM / NOAA NCEP**: Realtime Multivariate MJO (RMM1, RMM2) daily values
4. **India Meteorological Department (IMD)**: Gridded daily rainfall and temperature telemetry
5. **Copernicus ECMWF**: ERA5-Land reanalysis access
6. **Administrative GIS**: Official Survey of India / PostGIS administrative boundaries

---

## 13. Current Data Availability
- **External Meteorological Feeds**: Not Connected (requires API credentials and endpoints)
- **Trained Model Weights**: Not Configured (requires calibration on local historical ground truth)
- **PostGIS Geospatial DB**: Not Connected (schema ready, requires database connection string)
- **User Interface State**: All views render standardized, informative `EmptyState` components when data is unavailable, adhering strictly to the principle of zero fabricated data

---

## 14. Environment Variables

### Web Application (`web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend API (`api/.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/monsoonsense

# Geospatial
GEOJSON_DATA_PATH=/path/to/administrative_boundaries.geojson

# Meteorological Feeds
NOAA_CPC_API_URL=https://api.cpc.ncep.noaa.gov/...
BOM_DMI_API_URL=https://reg.bom.gov.au/...
MJO_ENSEMBLE_URL=https://www.cpc.ncep.noaa.gov/...

# Model Artifacts
PREDICTION_MODEL_PATH=/path/to/trained_model_weights.bin
HISTORICAL_ARCHIVE_PATH=/path/to/imd_historical_archive.parquet
ALERTS_FEED_URL=https://alerts.imd.gov.in/api/...
```
