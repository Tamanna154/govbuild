import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, ShieldAlert } from 'lucide-react';
import { FailureRecord } from '../types';
import api from '../api/client';

export const FailuresPage: React.FC = () => {
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetsList, setAssetsList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    assetId: '',
    failureType: 'Electrical Breakdown & Overload',
    symptoms: 'Tripped circuit breaker under heavy load',
    rootCause: 'Component breakdown',
    downtimeHours: '4.5',
    repairCost: '35000',
    severity: 'HIGH',
    resolution: 'Replaced damaged parts & recalibrated'
  });

  const fetchFailures = () => {
    setLoading(true);
    api.get('/failures')
      .then(res => setFailures(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFailures();
    api.get('/assets').then(res => {
      setAssetsList(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, assetId: res.data[0].id }));
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    api.post('/failures', formData).then(() => {
      setShowAddModal(false);
      fetchFailures();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Asset Failure & Root Cause History
          </h2>
          <p className="text-xs text-slate-500">Historical failure log used to feed failure frequency penalties into the Risk Engine.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          Record Asset Failure
        </button>
      </div>

      {/* Failures Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading Failure Records...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Failure Date</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Failure Type</th>
                  <th className="p-3">Root Cause</th>
                  <th className="p-3">Downtime</th>
                  <th className="p-3">Repair Cost</th>
                  <th className="p-3">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {failures.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-slate-500">{new Date(f.failureDate).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-slate-900">{f.asset?.name} ({f.asset?.assetId})</td>
                    <td className="p-3 font-bold text-rose-700">{f.failureType}</td>
                    <td className="p-3">{f.rootCause}</td>
                    <td className="p-3 font-mono">{f.downtimeHours} Hrs</td>
                    <td className="p-3 font-mono font-bold text-slate-900">₹{(f.repairCost || 0).toLocaleString()}</td>
                    <td className="p-3 text-slate-600 max-w-xs">{f.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Record Asset Breakdown & Failure</h3>
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

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Failure Type</label>
                <input
                  type="text"
                  value={formData.failureType}
                  onChange={e => setFormData({ ...formData, failureType: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Root Cause</label>
                <input
                  type="text"
                  value={formData.rootCause}
                  onChange={e => setFormData({ ...formData, rootCause: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded font-bold">
                  Record Failure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
