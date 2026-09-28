import React, { useEffect, useState } from 'react';
import { Cpu, Search, Plus, QrCode, ShieldAlert, ChevronRight, X, FileText, CheckCircle2 } from 'lucide-react';
import { Asset } from '../types';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';
import { ExplainableRiskModal } from '../components/common/ExplainableRiskModal';

const DEFAULT_ASSETS_PAGE: Asset[] = [
  {
    id: 'ast-gen-001',
    assetId: 'GEN-AHM-001',
    name: 'Main Emergency Diesel Generator 750 kVA',
    category: 'Power & Backup',
    type: 'Diesel Generator',
    buildingId: 'bld-gnd-001',
    building: { id: 'bld-gnd-001', buildingId: 'GND-001', name: 'Gujarat Swarnim Sankul 1', district: 'Gandhinagar' },
    manufacturer: 'Cummins India Ltd',
    model: 'QSK23-G3',
    serialNumber: 'SN-CUM-2024-8891',
    expectedLifeYears: 20,
    currentStatus: 'UNDER_MAINTENANCE',
    currentHealthScore: 42,
    currentRiskScore: 82,
    riskLevel: 'CRITICAL',
    criticalityLevel: 'URGENT',
    locationInBuilding: 'Basement Substation B-02'
  },
  {
    id: 'ast-ats-001',
    assetId: 'ATS-AHM-001',
    name: 'Automatic Transfer Switch & Main LT Panel',
    category: 'Power & Backup',
    type: 'Transfer Switch',
    buildingId: 'bld-gnd-001',
    building: { id: 'bld-gnd-001', buildingId: 'GND-001', name: 'Gujarat Swarnim Sankul 1', district: 'Gandhinagar' },
    manufacturer: 'Schneider Electric',
    model: 'MasterPact MTZ2 1600A',
    serialNumber: 'SN-SCH-2023-1102',
    expectedLifeYears: 25,
    currentStatus: 'OPERATIONAL',
    currentHealthScore: 88,
    currentRiskScore: 38,
    riskLevel: 'LOW',
    criticalityLevel: 'HIGH',
    locationInBuilding: 'Main Switchgear Room'
  },
  {
    id: 'ast-lft-001',
    assetId: 'LFT-AHM-001',
    name: 'Executive Passenger Lift No. 1 (Otis)',
    category: 'Vertical Transport',
    type: 'Passenger Elevator',
    buildingId: 'bld-gnd-001',
    building: { id: 'bld-gnd-001', buildingId: 'GND-001', name: 'Gujarat Swarnim Sankul 1', district: 'Gandhinagar' },
    manufacturer: 'Otis Elevator Company India',
    model: 'Gen2-Regen (13 Persons / 1000 kg)',
    serialNumber: 'SN-OTIS-2022-4412',
    expectedLifeYears: 25,
    currentStatus: 'OPERATIONAL',
    currentHealthScore: 92,
    currentRiskScore: 28,
    riskLevel: 'LOW',
    criticalityLevel: 'MEDIUM',
    locationInBuilding: 'Central Atrium Shaft A'
  },
  {
    id: 'ast-chl-001',
    assetId: 'CHL-AHM-001',
    name: 'Central Chilled Water HVAC Plant 250 TR',
    category: 'HVAC',
    type: 'Water-Cooled Chiller',
    buildingId: 'bld-ahm-001',
    building: { id: 'bld-ahm-001', buildingId: 'AHM-001', name: 'New Civil Hospital', district: 'Ahmedabad' },
    manufacturer: 'Voltas Limited (Tata Group)',
    model: 'VWC-250-Centrifugal',
    serialNumber: 'SN-VOL-2021-9981',
    expectedLifeYears: 20,
    currentStatus: 'OPERATIONAL',
    currentHealthScore: 68,
    currentRiskScore: 54,
    riskLevel: 'MEDIUM',
    criticalityLevel: 'HIGH',
    locationInBuilding: 'Utility Plant Room'
  },
  {
    id: 'ast-pmp-001',
    assetId: 'PMP-AHM-001',
    name: 'Main Hydrant Fire Water Pump 75 kW',
    category: 'Fire Protection',
    type: 'Centrifugal Fire Pump',
    buildingId: 'bld-gnd-001',
    building: { id: 'bld-gnd-001', buildingId: 'GND-001', name: 'Gujarat Swarnim Sankul 1', district: 'Gandhinagar' },
    manufacturer: 'Kirloskar Brothers Ltd',
    model: 'DB 100/26 Fire Spec',
    serialNumber: 'SN-KBL-2023-3341',
    expectedLifeYears: 15,
    currentStatus: 'OPERATIONAL',
    currentHealthScore: 88,
    currentRiskScore: 35,
    riskLevel: 'LOW',
    criticalityLevel: 'HIGH',
    locationInBuilding: 'Fire Pump Yard 1'
  }
];

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS_PAGE);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [explainAssetId, setExplainAssetId] = useState<string | null>(null);
  const [selectedTechSpecsAsset, setSelectedTechSpecsAsset] = useState<Asset | null>(null);
  const navigate = useNavigate();

  const fetchAssets = () => {
    api.get('/assets', { params: { search, category: categoryFilter, riskLevel: riskFilter } })
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAssets(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAssets();
  }, [search, categoryFilter, riskFilter]);

  const filteredAssets = assets.filter(a => {
    const matchesSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetId.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || a.category === categoryFilter;
    const matchesRisk = !riskFilter || a.riskLevel === riskFilter;
    return matchesSearch && matchesCat && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Infrastructure Engineering</span>
            <span>•</span>
            <span>Roads & Buildings Dept</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-slate-700" />
            Physical Asset Lifecycle & Health Registry
          </h1>
          <p className="text-xs text-slate-500">
            Real-time condition monitoring, technical specifications, and maintenance history for Gujarat civil complexes.
          </p>
        </div>
        <button
          onClick={() => navigate('/scan-qr')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition"
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          Scan Equipment QR
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Asset ID or name (e.g. GEN-AHM-001)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-slate-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium outline-none"
        >
          <option value="">All Categories</option>
          <option value="Power & Backup">Power & Backup</option>
          <option value="HVAC">HVAC & Chilled Water</option>
          <option value="Vertical Transport">Vertical Transport (Lifts)</option>
          <option value="Fire Protection">Fire Protection & Hydrants</option>
        </select>
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium outline-none"
        >
          <option value="">All Risk Levels</option>
          <option value="CRITICAL">CRITICAL Risk (Immediate Action)</option>
          <option value="HIGH">HIGH Risk</option>
          <option value="MEDIUM">MEDIUM Risk</option>
          <option value="LOW">LOW Risk</option>
        </select>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Facility Location</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Technical Specs & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAssets.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{a.assetId}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{a.name}</div>
                    <div className="text-[11px] text-slate-500">{a.manufacturer} ({a.model})</div>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">{a.category}</span>
                  </td>
                  <td className="p-3 text-slate-600">{a.building?.name || 'Main Complex'}</td>
                  <td className="p-3 w-36">
                    <HealthBar score={a.currentHealthScore} showText={false} />
                    <span className="text-[11px] font-bold text-slate-700">{Math.round(a.currentHealthScore)}%</span>
                  </td>
                  <td className="p-3">
                    <RiskBadge level={a.riskLevel} score={a.currentRiskScore} />
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTechSpecsAsset(a)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded border border-amber-300 text-[11px] transition"
                    >
                      Technical Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/assets/${a.id}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-[11px] transition"
                    >
                      Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Specifications Modal */}
      {selectedTechSpecsAsset && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {selectedTechSpecsAsset.assetId}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-slate-700" />
                  {selectedTechSpecsAsset.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTechSpecsAsset.building?.name} • {selectedTechSpecsAsset.locationInBuilding || 'Main Equipment Room'}
                </p>
              </div>
              <button onClick={() => setSelectedTechSpecsAsset(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-slate-700">
                <div>Manufacturer: <strong className="text-slate-900 block">{selectedTechSpecsAsset.manufacturer || 'OEM Partner'}</strong></div>
                <div>Model Number: <strong className="text-slate-900 block">{selectedTechSpecsAsset.model || 'Standard Industrial'}</strong></div>
                <div>Serial Number: <strong className="text-slate-900 font-mono block">{selectedTechSpecsAsset.serialNumber || 'SN-998811'}</strong></div>
                <div>Category: <strong className="text-slate-900 block">{selectedTechSpecsAsset.category}</strong></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block">Engineering Parameter Ratings:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Rated Design Capacity: <strong className="text-slate-900 block">750 kVA / 415 V</strong></div>
                  <div>Operating Voltage: <strong className="text-slate-900 block">3-Phase 415 V ±5%</strong></div>
                  <div>Useful Life Standard: <strong className="text-slate-900 block">{selectedTechSpecsAsset.expectedLifeYears} Years</strong></div>
                  <div>Maintenance SLA: <strong className="text-emerald-700 block">Active 24h Response</strong></div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center justify-between">
                <div>
                  <span className="font-bold block">AMC & Warranty Coverage Active</span>
                  <span className="text-[11px] text-emerald-700">Covered under Roads & Buildings E&M Annual Maintenance Contract</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTechSpecsAsset(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedTechSpecsAsset.id;
                  setSelectedTechSpecsAsset(null);
                  navigate(`/assets/${id}`);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs"
              >
                Full Asset Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explain Risk Modal */}
      <ExplainableRiskModal assetId={explainAssetId} onClose={() => setExplainAssetId(null)} />
    </div>
  );
};
