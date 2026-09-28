import React, { useEffect, useState } from 'react';
import { Wrench, Plus, CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { MaintenanceTicket } from '../types';
import api from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';

export const MaintenancePage: React.FC = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetsList, setAssetsList] = useState<any[]>([]);

  // Complete Form State
  const [completeForm, setCompleteForm] = useState({
    repairDetails: 'Completed comprehensive servicing, bearing replacement & AVR recalibration.',
    partsReplaced: 'Vibration Dampener, Main Bearing #2, Fuel Filter, AVR Board',
    labourCost: '12000',
    materialCost: '28000',
    technicianRemarks: 'Post-repair load test verified parameters optimal. Zero vibration.'
  });

  // Create Form State
  const [createForm, setCreateForm] = useState({
    assetId: '',
    problemDescription: 'High vibration & temperature anomaly observed under load',
    priorityLevel: 'URGENT'
  });

  const fetchTickets = () => {
    setLoading(true);
    api.get('/maintenance')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
    api.get('/assets').then(res => {
      setAssetsList(res.data);
      if (res.data.length > 0) {
        setCreateForm(prev => ({ ...prev, assetId: res.data[0].id }));
      }
    });
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    api.post('/maintenance', createForm).then(() => {
      setShowAddModal(false);
      fetchTickets();
    });
  };

  const handleCompleteRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    api.post(`/maintenance/${selectedTicket.id}/complete`, completeForm)
      .then(res => {
        setComparisonResult(res.data.comparison);
        fetchTickets();
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-gov-700" />
            Dynamic Maintenance Work Orders & Overhaul Workflow
          </h2>
          <p className="text-xs text-slate-500">Risk-prioritized maintenance tickets, post-repair health verification, and cost tracking.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          Create Work Order Ticket
        </button>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading Maintenance Work Orders...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Asset & Building</th>
                  <th className="p-3">Problem Description</th>
                  <th className="p-3">Priority Level</th>
                  <th className="p-3">Ticket Status</th>
                  <th className="p-3">Total Cost</th>
                  <th className="p-3 text-right">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-gov-800">{t.ticketId}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{t.asset?.name || 'Asset'} ({t.asset?.assetId})</div>
                      <div className="text-[10px] text-slate-500">{t.building?.name}</div>
                    </td>
                    <td className="p-3 max-w-xs">{t.problemDescription}</td>
                    <td className="p-3">
                      <RiskBadge level={t.priorityLevel} showScore={false} />
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${t.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      ₹{t.totalCost ? t.totalCost.toLocaleString() : '0'}
                    </td>
                    <td className="p-3 text-right">
                      {t.status !== 'VERIFIED' ? (
                        <button
                          onClick={() => { setSelectedTicket(t); setShowCompleteModal(true); setComparisonResult(null); }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow transition"
                        >
                          Complete & Verify Repair
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 justify-end">
                          <CheckCircle className="w-4 h-4" /> Verified Post-Repair
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complete Repair & Post-Maintenance Verification Modal */}
      {showCompleteModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Post-Maintenance Verification & Risk Recalculation
            </h3>

            {!comparisonResult ? (
              <form onSubmit={handleCompleteRepair} className="space-y-3 text-xs">
                <div>
                  <span className="font-mono text-xs font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                    {selectedTicket.ticketId}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedTicket.asset?.name}</h4>
                </div>

                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Repair Overhaul Details</label>
                  <textarea
                    required
                    value={completeForm.repairDetails}
                    onChange={e => setCompleteForm({ ...completeForm, repairDetails: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none h-16"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Parts Replaced</label>
                  <input
                    type="text"
                    value={completeForm.partsReplaced}
                    onChange={e => setCompleteForm({ ...completeForm, partsReplaced: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block text-slate-700 mb-1">Labour Cost (₹)</label>
                    <input
                      type="number"
                      value={completeForm.labourCost}
                      onChange={e => setCompleteForm({ ...completeForm, labourCost: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block text-slate-700 mb-1">Material Cost (₹)</label>
                    <input
                      type="number"
                      value={completeForm.materialCost}
                      onChange={e => setCompleteForm({ ...completeForm, materialCost: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCompleteModal(false)} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded font-bold shadow">
                    Submit Repair & Verify Health
                  </button>
                </div>
              </form>
            ) : (
              /* BEFORE vs AFTER Repair Metrics Comparison Display */
              <div className="space-y-4 py-2 animate-in fade-in">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center text-xs text-emerald-950">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <h4 className="font-bold text-sm">Post-Maintenance Repair Successfully Verified!</h4>
                  <p className="mt-0.5">Health Score restored and Risk mitigated across infrastructure engines.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Before Maintenance</span>
                    <div className="text-sm font-bold text-slate-800">Health: <span className="text-rose-700">{comparisonResult.beforeHealthScore}%</span></div>
                    <div className="text-sm font-bold text-slate-800">Risk Score: <span className="text-rose-700">{comparisonResult.beforeRiskScore}</span></div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-rose-200 text-rose-900 rounded">URGENT PRIORITY</span>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">After Maintenance</span>
                    <div className="text-sm font-bold text-slate-800">Health: <span className="text-emerald-700">{comparisonResult.afterHealthScore}%</span></div>
                    <div className="text-sm font-bold text-slate-800">Risk Score: <span className="text-emerald-700">{comparisonResult.afterRiskScore}</span></div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-200 text-emerald-900 rounded">LOW PRIORITY</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-semibold text-slate-700">
                  Total Repair Cost: ₹{(parseInt(completeForm.labourCost) + parseInt(completeForm.materialCost)).toLocaleString()} | Health Improvement: +{comparisonResult.healthImprovement}% | Risk Reduction: -{comparisonResult.riskReduction} pts
                </div>

                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="w-full py-2 bg-gov-700 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Create Work Order Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Select Asset</label>
                <select
                  value={createForm.assetId}
                  onChange={e => setCreateForm({ ...createForm, assetId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none font-bold"
                >
                  {assetsList.map(a => (
                    <option key={a.id} value={a.id}>{a.assetId} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Problem Description</label>
                <textarea
                  required
                  value={createForm.problemDescription}
                  onChange={e => setCreateForm({ ...createForm, problemDescription: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none h-20"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Priority Level</label>
                <select
                  value={createForm.priorityLevel}
                  onChange={e => setCreateForm({ ...createForm, priorityLevel: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none"
                >
                  <option value="URGENT">URGENT</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gov-700 text-white rounded font-bold">
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
