import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Building2, MapPin, ShieldAlert, Cpu } from 'lucide-react';
import { Building } from '../types';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { HealthBar } from '../components/common/HealthBar';
import { RiskBadge } from '../components/common/RiskBadge';

// Custom SVG map pin icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-gis-pin',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

export const GisMapPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/buildings')
      .then(res => setBuildings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-gov-700" />
            GIS Government Infrastructure Map
          </h2>
          <p className="text-xs text-slate-500">Interactive OpenStreetMap showing Gujarat government buildings and asset risk status across districts.</p>
        </div>
        {/* Map Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Healthy</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Moderate Risk</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-600 inline-block" /> Critical Risk</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[600px] relative">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500">Loading GIS Map layers...</div>
        ) : (
          <MapContainer
            center={[23.0225, 72.5714]} // Gujarat Center (Ahmedabad / Gandhinagar)
            zoom={9}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {buildings.map(b => {
              const color = b.currentHealthScore < 50 ? '#ef4444' : b.currentHealthScore < 75 ? '#f59e0b' : '#10b981';
              return (
                <Marker
                  key={b.id}
                  position={[b.latitude || 23.0225, b.longitude || 72.5714]}
                  icon={createCustomIcon(color)}
                >
                  <Popup>
                    <div className="p-1 space-y-2 max-w-xs font-sans">
                      <span className="font-mono text-[10px] font-bold text-gov-700 bg-gov-50 px-1.5 py-0.5 rounded border border-gov-200">
                        {b.buildingId}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">{b.name}</h4>
                      <p className="text-xs text-slate-500">{b.district}, Gujarat</p>

                      <div className="pt-1">
                        <HealthBar score={b.currentHealthScore} />
                      </div>

                      <div className="pt-2 flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-semibold">{b._count?.assets || 5} Assets</span>
                        <button
                          onClick={() => navigate(`/buildings/${b.id}`)}
                          className="px-2.5 py-1 bg-gov-700 text-white rounded text-xs font-bold hover:bg-gov-800 transition"
                        >
                          View Building
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};
