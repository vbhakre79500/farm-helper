from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import (
    forecast,
    climate,
    risk_map,
    advisory,
    alerts,
    history,
    data_status,
    locations,
    weather,
)

app = FastAPI(
    title="MONSOON-SENSE API",
    description="Hyperlocal Monsoon Onset & Break Prediction System (Block/Village Scale)",
    version="1.0.0",
)

# CORS middleware for Next.js web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(locations.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(climate.router, prefix="/api")
app.include_router(risk_map.router, prefix="/api")
app.include_router(advisory.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(data_status.router, prefix="/api")
app.include_router(weather.router, prefix="/api")

@app.get("/")
def root():
    return {
        "product": "MONSOON-SENSE",
        "tagline": "Hyperlocal Monsoon Intelligence for Smarter Agricultural Decisions",
        "status": "Operational",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "MONSOON-SENSE Backend Engine"}
