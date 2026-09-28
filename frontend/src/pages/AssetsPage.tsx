import React, { useEffect, useState } from 'react';
import { Cpu, Search, Filter, Plus, QrCode, ShieldAlert, ArrowUpDown, ChevronRight } from 'lucide-react';
import { Asset } from '../types';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';
import { ExplainableRiskModal } from '../components/common/ExplainableRiskModal';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [explainAssetId, setExplainAssetId] = useState<string | null>(null);
  const [selectedQrAsset, setSelectedQrAsset] = useState<Asset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  // New Asset Form
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electrical',
    type: 'Transformer',
    buildingId: '',
    manufacturer: 'Siemens India',
    model: 'MOD-2026-X',
    serialNumber: 'SN-998822',
    expectedLifeYears: '15',
    criticalityLevel: 'HIGH',
    locationInBuilding: 'Substation B-01'
  });

  const [buildingsList, setBuildingsList] = useState<any[]>([]);

  const fetchAssets = () => {
    setLoading(true);
    api.get('/assets', { params: { search, category: categoryFilter, riskLevel: riskFilter } })
      .then(res => setAssets(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
    api.get('/buildings').then(res => {
      setBuildingsList(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, buildingId: res.data[0].id }));
      }
    });
  }, [search, categoryFilter, riskFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    api.post('/assets', formData).then(() => {
      setShowAddModal(false);
      fetchAssets();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-gov-700" />
            Physical Asset Lifecycle & Health Registry
          </h2>
          <p className="text-xs text-slate-500">Centralized digital asset inventory tracking purchase, warranty, AMC, health, risk, and dependencies.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          Register New Asset
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Asset ID (e.g. GEN-AHM-001), name, serial..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-gov-500 outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
        >
          <option value="">All Categories</option>
          <option value="Electrical">Electrical</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Safety">Safety</option>
          <option value="Security">Security</option>
          <option value="Utility">Utility</option>
          <option value="IT / Communication">IT / Communication</option>
        </select>
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
        >
          <option value="">All Risk Levels</option>
          <option value="CRITICAL">CRITICAL Risk</option>
          <option value="HIGH">HIGH Risk</option>
          <option value="MEDIUM">MEDIUM Risk</option>
          <option value="LOW">LOW Risk</option>
        </select>
      </div>

      {/* Asset Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading Physical Assets Registry...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Asset ID</th>
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Category / Type</th>
                  <th className="p-3">Building Location</th>
                  <th className="p-3">Health Score</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">QR Identification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {assets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-gov-800">
                      <span className="bg-gov-50 px-2 py-0.5 rounded border border-gov-200">{a.assetId}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{a.name}</div>
                      <div className="text-[10px] text-slate-400">{a.manufacturer} ({a.model})</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold">{a.category}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{a.type}</div>
                    </td>
                    <td className="p-3">{a.building?.name || 'Main Building'}</td>
                    <td className="p-3 w-36">
                      <HealthBar score={a.currentHealthScore} showText={false} />
                      <span className="text-[10px] font-bold text-slate-700">{a.currentHealthScore}% Score</span>
                    </td>
                    <td className="p-3">
                      <RiskBadge level={a.riskLevel} score={a.currentRiskScore} />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedQrAsset(a)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 font-mono text-[11px]"
                      >
                        <QrCode className="w-3.5 h-3.5 text-gov-700" /> QR Code
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setExplainAssetId(a.assetId)}
                        className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded text-[11px] font-semibold"
                      >
                        Why Risk?
                      </button>
                      <button
                        onClick={() => navigate(`/assets/${a.assetId}`)}
                        className="px-2.5 py-1 bg-gov-700 text-white hover:bg-gov-800 rounded text-[11px] font-bold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="font-bold text-base text-slate-900">Asset QR Tag & Identification</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center">
              {selectedQrAsset.qrCodeUrl ? (
                <img src={selectedQrAsset.qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded" />
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded flex items-center justify-center text-xs">Generating QR...</div>
              )}
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                {selectedQrAsset.assetId}
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedQrAsset.name}</h4>
              <p className="text-xs text-slate-500">{selectedQrAsset.building?.name}</p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gov-700 text-white rounded text-xs font-bold shadow"
              >
                Print Label
              </button>
              <button
                onClick={() => setSelectedQrAsset(null)}
                className="px-4 py-2 border rounded text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explainable Risk Modal */}
      <ExplainableRiskModal assetId={explainAssetId} onClose={() => setExplainAssetId(null)} />
    </div>
  );
};
