'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/locationStore';
import { ForecastHorizon, RiskLevel } from '../../shared/types';
import { getRiskHexColor } from '../lib/utils';
import { RISK_LABELS } from '../../shared/translations';
import { apiClient } from '../lib/api';
import { MapPin, Info, Layers } from 'lucide-react';
import L from 'leaflet';

interface LeafletMapProps {
  activeLayer: 'overall' | 'onset' | 'break' | 'heavyRain' | 'revival';
  horizonDays: ForecastHorizon;
  onSelectFeature?: (feat: any) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  activeLayer,
  horizonDays,
  onSelectFeature,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const { language, activeCoords, getActiveLocationName } = useAppStore();

  const [features, setFeatures] = useState<any[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch verified GeoJSON from configured backend provider
  useEffect(() => {
    setIsLoading(true);
    apiClient
      .getRiskMap(activeLayer, horizonDays)
      .then((data) => {
        if (data && data.features && Array.isArray(data.features)) {
          setFeatures(data.features);
          if (data.features.length > 0) {
            setSelectedFeature(data.features[0]);
          } else {
            setSelectedFeature(null);
          }
        } else {
          setFeatures([]);
          setSelectedFeature(null);
        }
      })
      .catch((err) => {
        console.warn('Geospatial layer fetch failed:', err);
        setFeatures([]);
        setSelectedFeature(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeLayer, horizonDays]);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = activeCoords?.latitude || 21.257;
      const initialLon = activeCoords?.longitude || 77.511;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 7,
        minZoom: 4,
        maxZoom: 16,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Render features from configured provider
    if (features.length > 0) {
      features.forEach((feat) => {
        const props = feat.properties || {};
        const riskLevel: RiskLevel = props.riskLevel || 'LOW';
        const color = getRiskHexColor(riskLevel);

        if (feat.geometry && feat.geometry.coordinates) {
          const polygon = L.geoJSON(feat, {
            style: {
              color: color,
              weight: 2,
              fillColor: color,
              fillOpacity: 0.35,
            },
          });

          polygon.on('click', () => {
            setSelectedFeature(feat);
            if (onSelectFeature) onSelectFeature(feat);
          });

          const label = RISK_LABELS[language]?.[riskLevel] || riskLevel;
          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #1e293b; padding: 4px;">
              <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 4px;">${props.name || 'Administrative Block'}</div>
              <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${props.districtName || ''}, ${props.stateName || ''}</div>
              <div style="margin-bottom: 2px;">Hazard Risk: <strong>${label}</strong></div>
              <div>Lead Horizon: <strong>${props.leadDays || horizonDays} Days</strong></div>
            </div>
          `;
          polygon.bindPopup(popupHtml);
          polygon.addTo(layerGroup);
        }
      });
    }

    // Active location pinpoint marker
    if (activeCoords) {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      const marker = L.circleMarker([activeCoords.latitude, activeCoords.longitude], {
        radius: 9,
        color: '#10b981',
        fillColor: '#34d399',
        fillOpacity: 0.9,
        weight: 3,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <div style="font-weight: bold; color: #065f46;">📍 Active Location</div>
          <div style="font-size: 11px; color: #374151;">${getActiveLocationName()}</div>
          <div style="font-size: 10px; color: #6b7280; font-family: monospace;">${activeCoords.latitude.toFixed(3)}°N, ${activeCoords.longitude.toFixed(3)}°E</div>
        </div>
      `);
      markerRef.current = marker;

      // Pan to new location smoothly
      map.panTo([activeCoords.latitude, activeCoords.longitude], { animate: true });
    }
  }, [features, activeLayer, horizonDays, language, onSelectFeature, activeCoords, getActiveLocationName]);

  return (
    <div className="relative w-full h-[550px] rounded-xl overflow-hidden border border-monsoon-border shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer legend overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-monsoon-dark/90 border border-monsoon-border rounded-xl p-3 backdrop-blur-md shadow-2xl text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[11px] tracking-wider mb-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Operational Risk Layer</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>Low Hazard</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Moderate Hazard</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
          <span>Elevated Hazard</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span>High / Critical Hazard</span>
        </div>
      </div>

      {selectedFeature && (
        <div className="absolute bottom-4 left-4 z-[1000] max-w-sm w-full bg-monsoon-dark/95 border border-monsoon-border rounded-xl p-3.5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">
              {selectedFeature.properties?.name || 'Selected Block'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-500/30">
              {selectedFeature.properties?.riskLevel || 'LOW'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {selectedFeature.properties?.districtName} District, {selectedFeature.properties?.stateName} • {horizonDays}D Outlook
          </div>
        </div>
      )}
    </div>
  );
};
