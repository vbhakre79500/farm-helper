-- MONSOON-SENSE PostgreSQL + PostGIS Comprehensive Database Schema
-- Production-ready schema for hyperlocal monsoon onset & break prediction

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles & Roles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL CHECK (role IN ('farmer', 'officer', 'admin')),
    location_id VARCHAR(64),
    language VARCHAR(8) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Geographic Hierarchy & Spatial Boundaries (PostGIS)
CREATE TABLE IF NOT EXISTS states (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(16),
    geometry GEOMETRY(MultiPolygon, 4326),
    centroid GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(32) PRIMARY KEY,
    state_id VARCHAR(32) REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326),
    centroid GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocks (
    id VARCHAR(32) PRIMARY KEY,
    district_id VARCHAR(32) REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326),
    centroid GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS panchayats (
    id VARCHAR(32) PRIMARY KEY,
    block_id VARCHAR(32) REFERENCES blocks(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326),
    centroid GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS villages (
    id VARCHAR(32) PRIMARY KEY,
    panchayat_id VARCHAR(32) REFERENCES panchayats(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geometry GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Weather Observations (Current & Historical)
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature_celsius DOUBLE PRECISION,
    rainfall_mm DOUBLE PRECISION,
    relative_humidity_pct DOUBLE PRECISION,
    wind_speed_kmph DOUBLE PRECISION,
    wind_direction_deg DOUBLE PRECISION,
    surface_pressure_hpa DOUBLE PRECISION,
    soil_moisture_0_to_7cm_pct DOUBLE PRECISION,
    soil_moisture_7_to_28cm_pct DOUBLE PRECISION,
    evapotranspiration_mm DOUBLE PRECISION,
    weather_condition VARCHAR(128),
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historical_weather (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL,
    record_date DATE NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    t_max_celsius DOUBLE PRECISION,
    t_min_celsius DOUBLE PRECISION,
    normal_rainfall_mm DOUBLE PRECISION,
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (location_id, record_date)
);

-- 4. Weather Forecasts
CREATE TABLE IF NOT EXISTS weather_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL,
    forecast_date DATE NOT NULL,
    lead_day INT NOT NULL,
    rainfall_expected_mm DOUBLE PRECISION,
    pop_percentage INT,
    t_max_celsius DOUBLE PRECISION,
    t_min_celsius DOUBLE PRECISION,
    humidity_pct INT,
    wind_speed_kmph DOUBLE PRECISION,
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (location_id, forecast_date, lead_day)
);

-- 5. Planetary Climate Signals (ENSO, IOD, MJO)
CREATE TABLE IF NOT EXISTS climate_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_type VARCHAR(16) NOT NULL CHECK (signal_type IN ('ENSO', 'IOD', 'MJO')),
    name VARCHAR(128) NOT NULL,
    numerical_index DOUBLE PRECISION,
    phase_or_state VARCHAR(64),
    historical_baseline VARCHAR(64),
    trend VARCHAR(32),
    monsoon_influence TEXT,
    influence_rating VARCHAR(32),
    observation_date DATE,
    data_source VARCHAR(128),
    data_freshness VARCHAR(64),
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Model Versions & Forecast Runs
CREATE TABLE IF NOT EXISTS model_versions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_task VARCHAR(255) NOT NULL,
    algorithm VARCHAR(255) NOT NULL,
    training_dataset_period VARCHAR(128),
    cross_validated_score VARCHAR(128),
    last_prediction_run TIMESTAMP WITH TIME ZONE,
    status VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forecast_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version_id VARCHAR(64) REFERENCES model_versions(id),
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL,
    input_feature_count INT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS forecast_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES forecast_runs(id) ON DELETE CASCADE,
    location_id VARCHAR(64) NOT NULL,
    horizon_days INT NOT NULL,
    onset_probability INT,
    break_probability INT,
    heavy_rain_probability INT,
    revival_probability INT,
    overall_risk VARCHAR(32),
    confidence_score INT,
    expected_rainfall_mm DOUBLE PRECISION,
    normal_rainfall_mm DOUBLE PRECISION,
    anomaly_pct DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Risk Zones & Spatial Layers
CREATE TABLE IF NOT EXISTS risk_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL,
    layer_type VARCHAR(32) NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    risk_index DOUBLE PRECISION,
    geometry GEOMETRY(Geometry, 4326),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Crops, Crop Stages & Advisory Rules
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    scientific_name VARCHAR(128),
    season VARCHAR(32) NOT NULL,
    icon VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id VARCHAR(64) REFERENCES crops(id) ON DELETE CASCADE,
    stage_name VARCHAR(128) NOT NULL,
    stage_order INT NOT NULL,
    duration_days INT,
    water_requirement_mm DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS advisory_rules (
    id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(64) REFERENCES crops(id),
    crop_stage VARCHAR(128),
    hazard_trigger VARCHAR(64) NOT NULL,
    threshold_condition JSONB NOT NULL,
    recommended_action TEXT NOT NULL,
    scientific_reason TEXT NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    reference_code VARCHAR(128) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS advisories (
    id VARCHAR(64) PRIMARY KEY,
    location_id VARCHAR(64) NOT NULL,
    crop_id VARCHAR(64) REFERENCES crops(id),
    crop_stage VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    recommended_action TEXT NOT NULL,
    scientific_reason TEXT NOT NULL,
    forecast_period VARCHAR(128),
    risk_level VARCHAR(32) NOT NULL,
    confidence_score INT,
    rule_reference VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Monsoon Alerts & Notifications
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    location_id VARCHAR(64) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    event_description TEXT NOT NULL,
    forecast_period VARCHAR(128),
    recommended_action TEXT NOT NULL,
    broadcast_channels TEXT[] DEFAULT ARRAY['IN-APP'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(64) REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID,
    channel VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_response TEXT
);

-- 10. Data Source Health & Ingestion Telemetry
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    endpoint_url TEXT,
    last_successful_update TIMESTAMP WITH TIME ZONE,
    freshness VARCHAR(64),
    ping_latency_ms INT,
    status VARCHAR(64) NOT NULL,
    records_processed_today INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_ingestion_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_source_id VARCHAR(64) REFERENCES data_sources(id),
    request_time TIMESTAMP WITH TIME ZONE NOT NULL,
    response_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL,
    records_ingested INT DEFAULT 0,
    error_message TEXT
);

-- Spatial GIST Indexes
CREATE INDEX IF NOT EXISTS idx_states_geom ON states USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_districts_geom ON districts USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_blocks_geom ON blocks USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_panchayats_geom ON panchayats USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_villages_geom ON villages USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_risk_zones_geom ON risk_zones USING GIST (geometry);

-- Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_weather_obs_loc_time ON weather_observations (location_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_historical_loc_date ON historical_weather (location_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_advisories_loc ON advisories (location_id);
CREATE INDEX IF NOT EXISTS idx_alerts_loc ON alerts (location_id);
