import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { Inspection } from '../types';
import api from '../api/client';

export const InspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetsList, setAssetsList] = useState<any[]>([]);

  // Inspection Form State
  const [formData, setFormData] = useState({
    assetId: '',
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
    remarks: 'Routine quality inspection verified clean.',
    recommendedAction: 'Continue scheduled operations.'
  });

  const fetchInspections = () => {
    setLoading(true);
    api.get('/inspections')
      .then(res => setInspections(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInspections();
    api.get('/assets').then(res => {
      setAssetsList(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, assetId: res.data[0].id }));
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    api.post('/inspections', formData).then(() => {
      setShowAddModal(false);
      fetchInspections();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-gov-700" />
            Field Asset Inspection Registry
          </h2>
          <p className="text-xs text-slate-500">Record physical observations, telemetry parameters, and update asset health scores.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          Conduct Asset Inspection
        </button>
      </div>

      {/* Inspections Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading Inspections Log...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Inspection ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Telemetry Readings</th>
                  <th className="p-3">Safety Status</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inspections.map(ins => (
                  <tr key={ins.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-gov-800">{ins.inspectionId}</td>
                    <td className="p-3 font-mono text-slate-500">{new Date(ins.inspectionDate).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {ins.asset?.name || 'Asset'} ({ins.asset?.assetId})
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${ins.physicalCondition === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {ins.physicalCondition}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      Temp: {ins.temperature || 'N/A'}°C | Vib: {ins.vibration || 'N/A'} mm/s
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {ins.safetyStatus}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{ins.remarks || 'Routine verification'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conduct Inspection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Conduct Field Asset Inspection</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Select Asset</label>
                <select
                  value={formData.assetId}
                  onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none font-bold"
                >
                  {assetsList.map(a => (
                    <option key={a.id} value={a.id}>{a.assetId} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Physical Condition</label>
                  <select
                    value={formData.physicalCondition}
                    onChange={e => setFormData({ ...formData, physicalCondition: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Safety Status</label>
                  <select
                    value={formData.safetyStatus}
                    onChange={e => setFormData({ ...formData, safetyStatus: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none"
                  >
                    <option value="PASS">PASS</option>
                    <option value="WARN">WARNING</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Vibration (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vibration}
                    onChange={e => setFormData({ ...formData, vibration: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Inspector Observations & Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none h-16"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gov-700 text-white rounded font-bold">
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
