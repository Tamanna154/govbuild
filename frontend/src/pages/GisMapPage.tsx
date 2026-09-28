import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Building2,
  MapPin,
  Shield,
  Layers,
  ExternalLink,
  ChevronRight,
  X,
  Info,
  Activity,
  HardHat,
  Ruler
} from 'lucide-react';
import { Building } from '../types';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { HealthBar } from '../components/common/HealthBar';
import { getBuildingImage } from '../utils/buildingImages';

// Custom SVG map pin icons with clean institutional styling
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-gis-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: #ffffff; width: 6px; height: 6px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export const GisMapPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [activeDistrict, setActiveDistrict] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/buildings')
      .then(res => setBuildings(res.data))
      .catch(err => console.error('Error fetching buildings for GIS:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBuildings =
    activeDistrict === 'ALL'
      ? buildings
      : buildings.filter(b => b.district.toLowerCase() === activeDistrict.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Geographic Information System (GIS)</span>
            <span>•</span>
            <span>Gujarat Public Infrastructure</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-700" />
            State Infrastructure GIS Asset & Health Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial registry showing Gujarat government offices, hospitals, and civil structures with live condition ratings.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs bg-slate-50 px-3 py-2 rounded-md border border-slate-200 text-slate-700 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Healthy (75%+)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate (50-74%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Critical (&lt;50%)
          </span>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Side: Buildings List / Filter */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col h-[650px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Registered Locations</h3>
            <span className="text-[11px] text-slate-500 font-mono font-medium">{filteredBuildings.length} Facilities</span>
          </div>

          {/* Quick District Filter */}
          <select
            value={activeDistrict}
            onChange={e => setActiveDistrict(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Gujarat Districts</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Surat">Surat</option>
            <option value="Rajkot">Rajkot</option>
          </select>

          {/* Buildings scrollable listing */}
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {filteredBuildings.map(b => {
              const img = getBuildingImage(b);
              const isSelected = selectedBuilding?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBuilding(b)}
                  className={`p-2.5 rounded border text-xs cursor-pointer transition flex items-center gap-3 ${
                    isSelected
                      ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <img
                    src={img}
                    alt={b.name}
                    className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-600">{b.buildingId}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          b.currentHealthScore >= 75
                            ? 'text-emerald-700'
                            : b.currentHealthScore >= 50
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {Math.round(b.currentHealthScore)}%
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 truncate leading-snug">{b.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{b.district}, Gujarat</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Map Canvas */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-[650px] relative">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Loading Geospatial Gujarat Infrastructure Map...
            </div>
          ) : (
            <MapContainer
              center={[23.1065, 72.6025]}
              zoom={10}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredBuildings.map(b => {
                const color =
                  b.currentHealthScore < 50 ? '#dc2626' : b.currentHealthScore < 75 ? '#d97706' : '#059669';
                const buildingImg = getBuildingImage(b);

                return (
                  <Marker
                    key={b.id}
                    position={[b.latitude || 23.0225, b.longitude || 72.5714]}
                    icon={createCustomIcon(color)}
                    eventHandlers={{
                      click: () => setSelectedBuilding(b)
                    }}
                  >
                    <Popup className="custom-building-popup">
                      <div className="w-64 font-sans text-xs -m-1 space-y-2">
                        {/* Building Image inside Popup */}
                        <div className="relative h-28 w-full rounded overflow-hidden border border-slate-200">
                          <img
                            src={buildingImg}
                            alt={b.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                            {b.buildingId}
                          </div>
                          <div className="absolute top-1.5 right-1.5 bg-white/90 text-slate-800 font-semibold text-[9px] px-1.5 py-0.5 rounded border border-slate-200">
                            {b.type}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight text-xs">{b.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{b.district}, Gujarat</p>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="text-slate-500">Infrastructure Health</span>
                            <span className="font-bold text-slate-800">{Math.round(b.currentHealthScore)}%</span>
                          </div>
                          <HealthBar score={b.currentHealthScore} showText={false} />
                        </div>

                        <div className="pt-2 flex gap-1.5">
                          <button
                            onClick={() => setSelectedBuilding(b)}
                            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition text-center"
                          >
                            View Image & Info
                          </button>
                          <button
                            onClick={() => navigate(`/buildings/${b.id}`)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-[11px] transition text-center flex items-center justify-center gap-1"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3" />
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

      {/* Building Image & Detail Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden space-y-0">
            {/* Modal Header with Building Image Banner */}
            <div className="relative h-60 w-full bg-slate-900">
              <img
                src={getBuildingImage(selectedBuilding)}
                alt={selectedBuilding.name}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              <button
                onClick={() => setSelectedBuilding(null)}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded">
                    {selectedBuilding.buildingId}
                  </span>
                  <span className="text-[11px] bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                    {selectedBuilding.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight">{selectedBuilding.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedBuilding.address || `${selectedBuilding.name}, ${selectedBuilding.district}, Gujarat`}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* Health and Status Bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Current Structural Condition</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedBuilding.currentCondition || 'Satisfactory'}</span>
                </div>
                <div className="w-full sm:w-48">
                  <div className="flex justify-between items-center text-[11px] mb-1 font-medium">
                    <span className="text-slate-500">Health Index</span>
                    <span className="font-bold text-slate-900">{Math.round(selectedBuilding.currentHealthScore)} / 100</span>
                  </div>
                  <HealthBar score={selectedBuilding.currentHealthScore} showText={false} />
                </div>
              </div>

              {/* Facility Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 border border-slate-200 rounded bg-white">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase mb-0.5">
                    <Ruler className="w-3 h-3" />
                    <span>Built-up Area</span>
                  </div>
                  <div className="font-bold text-slate-900">{selectedBuilding.builtUpArea || 25000} sq.m</div>
                </div>

                <div className="p-2.5 border border-slate-200 rounded bg-white">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase mb-0.5">
                    <Layers className="w-3 h-3" />
                    <span>Total Floors</span>
                  </div>
                  <div className="font-bold text-slate-900">{selectedBuilding.totalFloors || 4} Floors (G+{((selectedBuilding.totalFloors || 4) - 1)})</div>
                </div>

                <div className="p-2.5 border border-slate-200 rounded bg-white">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase mb-0.5">
                    <HardHat className="w-3 h-3" />
                    <span>Contractor</span>
                  </div>
                  <div className="font-bold text-slate-900 truncate">{selectedBuilding.contractor || 'State R&B Division'}</div>
                </div>

                <div className="p-2.5 border border-slate-200 rounded bg-white">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase mb-0.5">
                    <Activity className="w-3 h-3" />
                    <span>Tracked Assets</span>
                  </div>
                  <div className="font-bold text-slate-900">{selectedBuilding._count?.assets || 5} Critical Units</div>
                </div>
              </div>

              {/* Coordinates info */}
              <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between">
                <span>Latitude: {selectedBuilding.latitude}</span>
                <span>Longitude: {selectedBuilding.longitude}</span>
                <span>District: {selectedBuilding.district}</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBuilding(null)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/buildings/${selectedBuilding.id}`)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <span>Open Full Building Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
