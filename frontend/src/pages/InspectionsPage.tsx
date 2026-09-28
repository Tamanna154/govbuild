import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Inspection } from '../types';
import api from '../api/client';

const DEFAULT_ASSETS = [
  { id: 'ast-gen-001', assetId: 'GEN-AHM-001', name: 'Emergency Diesel Generator 750 kVA', building: { name: 'Gujarat Swarnim Sankul 1' } },
  { id: 'ast-ats-001', assetId: 'ATS-AHM-001', name: 'Automatic Transfer Switch & LT Panel', building: { name: 'Gujarat Swarnim Sankul 1' } },
  { id: 'ast-lft-001', assetId: 'LFT-AHM-001', name: 'Executive Passenger Lift #1', building: { name: 'Gujarat Swarnim Sankul 1' } },
  { id: 'ast-pmp-001', assetId: 'PMP-AHM-001', name: 'Main Hydrant Fire Water Pump 75 kW', building: { name: 'Gujarat Swarnim Sankul 1' } },
  { id: 'ast-chl-001', assetId: 'CHL-AHM-001', name: 'Central Chilled Water HVAC Plant 250 TR', building: { name: 'New Civil Hospital' } },
  { id: 'ast-lft-002', assetId: 'LFT-AHM-002', name: 'Trauma Emergency Stretcher Lift #2', building: { name: 'New Civil Hospital' } },
  { id: 'ast-trf-001', assetId: 'TRF-AHM-001', name: 'Step-Down Power Transformer 11kV/415V', building: { name: 'Gujarat High Court' } }
];

const DEFAULT_INSPECTIONS: Inspection[] = [
  {
    id: 'INS-001',
    inspectionId: 'INS-2026-0901',
    assetId: 'ast-gen-001',
    asset: {
      id: 'ast-gen-001',
      assetId: 'GEN-AHM-001',
      name: 'Main Emergency Diesel Generator 750 kVA',
      category: 'Power & Backup',
      type: 'Generator',
      buildingId: 'bld-gnd-001',
      building: { id: 'bld-gnd-001', buildingId: 'GND-001', name: 'Gujarat Swarnim Sankul 1', district: 'Gandhinagar' },
      expectedLifeYears: 20,
      currentStatus: 'UNDER_MAINTENANCE',
      currentHealthScore: 42,
      currentRiskScore: 82,
      riskLevel: 'CRITICAL',
      criticalityLevel: 'URGENT'
    },
    inspectionDate: '2026-09-27T10:00:00Z',
    physicalCondition: 'Degraded',
    temperature: 84.5,
    vibration: 4.8,
    oilLevel: 45,
    voltage: 395,
    current: 110,
    leakage: true,
    corrosion: false,
    damage: false,
    safetyStatus: 'FLAGGED_DEFECT',
    remarks: 'Low lubricating oil pressure warning. Excessive vibration on mounting dampener #3.',
    recommendedAction: 'Immediate oil filter replacement and sensor recalibration.'
  },
  {
    id: 'INS-002',
    inspectionId: 'INS-2026-0888',
    assetId: 'ast-lft-001',
    asset: {
      id: 'ast-lft-001',
      assetId: 'LFT-AHM-001',
      name: 'Executive Passenger Lift No. 1 (Otis)',
      category: 'Vertical Transport',
      type: 'Elevator',
      buildingId: 'bld-gnd-001',
      building: { id: 'bld-gnd-001', buildingId: 'GND-001', name: 'Gujarat Swarnim Sankul 1', district: 'Gandhinagar' },
      expectedLifeYears: 25,
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 92,
      currentRiskScore: 28,
      riskLevel: 'LOW',
      criticalityLevel: 'MEDIUM'
    },
    inspectionDate: '2026-09-25T14:30:00Z',
    physicalCondition: 'Good',
    temperature: 38.0,
    vibration: 0.8,
    voltage: 415,
    current: 45,
    leakage: false,
    corrosion: false,
    damage: false,
    safetyStatus: 'PASS',
    remarks: 'Governor safety test and brake lining wear check passed.',
    recommendedAction: 'Continue regular quarterly lubrication.'
  },
  {
    id: 'INS-003',
    inspectionId: 'INS-2026-0850',
    assetId: 'ast-pmp-001',
    asset: {
      id: 'ast-pmp-001',
      assetId: 'PMP-AHM-001',
      name: 'Main Hydrant Fire Water Pump 75 kW',
      category: 'Fire Protection',
      type: 'Pump',
      buildingId: 'bld-gnd-001',
      building: { id: 'bld-gnd-001', buildingId: 'GND-001', name: 'Gujarat Swarnim Sankul 1', district: 'Gandhinagar' },
      expectedLifeYears: 15,
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 88,
      currentRiskScore: 35,
      riskLevel: 'LOW',
      criticalityLevel: 'HIGH'
    },
    inspectionDate: '2026-09-22T11:15:00Z',
    physicalCondition: 'Good',
    temperature: 42.0,
    vibration: 1.1,
    voltage: 415,
    current: 85,
    leakage: false,
    corrosion: false,
    damage: false,
    safetyStatus: 'PASS',
    remarks: 'Hydrant delivery pressure maintained at 7.2 bar.',
    recommendedAction: 'Normal operation approved.'
  }
];

export const InspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>(DEFAULT_INSPECTIONS);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetsList, setAssetsList] = useState<any[]>(DEFAULT_ASSETS);

  const [formData, setFormData] = useState({
    assetId: DEFAULT_ASSETS[0].id,
    physicalCondition: 'Good',
    temperature: '45.0',
    vibration: '1.2',
    oilLevel: '95',
    voltage: '415',
    current: '120',
    leakage: false,
    corrosion: false,
    damage: false,
    safetyStatus: 'PASS',
    remarks: 'Field audit verified all operating parameters within nominal tolerance.',
    recommendedAction: 'Continue scheduled operational monitoring.'
  });

  const fetchInspections = () => {
    api.get('/inspections')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setInspections(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchInspections();
    api.get('/assets')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAssetsList(res.data);
          setFormData(prev => ({ ...prev, assetId: res.data[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedAsset = assetsList.find(a => a.id === formData.assetId) || DEFAULT_ASSETS[0];
    const newIns: Inspection = {
      id: `INS-${Date.now()}`,
      inspectionId: `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      assetId: matchedAsset.id,
      asset: {
        id: matchedAsset.id,
        assetId: matchedAsset.assetId || 'AST-001',
        name: matchedAsset.name,
        category: matchedAsset.category || 'General',
        type: matchedAsset.type || 'Equipment',
        buildingId: matchedAsset.buildingId || 'b1',
        building: matchedAsset.building || { name: 'Main Facility', district: 'Gandhinagar' },
        expectedLifeYears: 15,
        currentStatus: 'OPERATIONAL',
        currentHealthScore: formData.safetyStatus === 'FLAGGED_DEFECT' ? 45 : 90,
        currentRiskScore: formData.safetyStatus === 'FLAGGED_DEFECT' ? 75 : 25,
        riskLevel: formData.safetyStatus === 'FLAGGED_DEFECT' ? 'HIGH' : 'LOW',
        criticalityLevel: 'MEDIUM'
      },
      inspectionDate: new Date().toISOString(),
      physicalCondition: formData.physicalCondition,
      temperature: parseFloat(formData.temperature),
      vibration: parseFloat(formData.vibration),
      voltage: parseFloat(formData.voltage),
      current: parseFloat(formData.current),
      oilLevel: parseFloat(formData.oilLevel),
      leakage: formData.leakage,
      corrosion: formData.corrosion,
      damage: formData.damage,
      safetyStatus: formData.safetyStatus,
      remarks: formData.remarks,
      recommendedAction: formData.recommendedAction
    };

    setInspections([newIns, ...inspections]);
    setShowAddModal(false);

    api.post('/inspections', formData).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-sky-700 uppercase tracking-wider">
            <span>Quality & Safety Audits</span>
            <span>•</span>
            <span>R&B Department</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-sky-600" />
            Field Asset Inspection Registry
          </h1>
          <p className="text-xs text-slate-500">Log physical condition, vibration, temperature telemetry, and safety compliance.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Conduct New Inspection
        </button>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3">Inspection ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Asset & Facility</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Telemetry Readings</th>
                <th className="p-3">Safety Status</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {inspections.map(ins => (
                <tr key={ins.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-sky-700">{ins.inspectionId}</td>
                  <td className="p-3 font-mono text-slate-500">{new Date(ins.inspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{ins.asset?.name || 'Public Asset'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{ins.asset?.assetId} • {ins.asset?.building?.name}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      ins.physicalCondition === 'Good'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ins.physicalCondition === 'Degraded'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ins.physicalCondition}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600 space-y-0.5">
                    <div>Temp: <strong className="text-slate-900">{ins.temperature || 45}°C</strong> | Vib: <strong className="text-slate-900">{ins.vibration || 1.2} mm/s</strong></div>
                    <div>Volt: <strong className="text-slate-900">{ins.voltage || 415}V</strong> | Curr: <strong className="text-slate-900">{ins.current || 110}A</strong></div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      ins.safetyStatus === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ins.safetyStatus === 'PASS' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {ins.safetyStatus === 'PASS' ? 'Passed' : 'Defect Flagged'}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate" title={ins.remarks}>
                    {ins.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inspection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-sky-600" />
                Record On-Site Safety Inspection
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Select Asset *</label>
                <select
                  required
                  value={formData.assetId}
                  onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-sky-500 font-medium text-slate-900"
                >
                  {assetsList.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.assetId} — {a.name} ({a.building?.name || 'Main Complex'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Physical Condition</label>
                  <select
                    value={formData.physicalCondition}
                    onChange={e => setFormData({ ...formData, physicalCondition: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Degraded</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Safety Status</label>
                  <select
                    value={formData.safetyStatus}
                    onChange={e => setFormData({ ...formData, safetyStatus: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="PASS">PASS (Operational)</option>
                    <option value="FLAGGED_DEFECT">FLAGGED_DEFECT (Needs Fix)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Vibration (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vibration}
                    onChange={e => setFormData({ ...formData, vibration: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Operating Voltage (V)</label>
                  <input
                    type="number"
                    value={formData.voltage}
                    onChange={e => setFormData({ ...formData, voltage: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Load Current (A)</label>
                  <input
                    type="number"
                    value={formData.current}
                    onChange={e => setFormData({ ...formData, current: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Inspector Remarks</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Inspection Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
