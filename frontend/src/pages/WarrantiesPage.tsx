import React, { useEffect, useState } from 'react';
import { ShieldCheck, Award, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/client';

export const WarrantiesPage: React.FC = () => {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [amcs, setAmcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/warranties'),
      api.get('/amc')
    ]).then(([wRes, aRes]) => {
      setWarranties(wRes.data || []);
      setAmcs(aRes.data || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-gov-700" />
          Warranty & Annual Maintenance Contract (AMC) Registry
        </h2>
        <p className="text-xs text-slate-500">Track equipment warranty terms, provider commitments, AMC contracts, and SLA compliance.</p>
      </div>

      {/* Warranties Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Active Equipment Warranties
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3">Covered Components</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {warranties.map(w => (
                <tr key={w.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-900">{w.asset?.name} ({w.asset?.assetId})</td>
                  <td className="p-3">{w.providerName}</td>
                  <td className="p-3 font-mono">{new Date(w.startDate).toLocaleDateString()}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{new Date(w.endDate).toLocaleDateString()}</td>
                  <td className="p-3 text-slate-600 max-w-xs">{w.coveredComponents || 'All components'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${w.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AMC Contracts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          Active Annual Maintenance Contracts (AMC)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Contract No</th>
                <th className="p-3">Asset</th>
                <th className="p-3">Contract Value</th>
                <th className="p-3">Service Frequency</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">SLA Commitment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {amcs.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-gov-800">{a.contractNumber}</td>
                  <td className="p-3 font-bold text-slate-900">{a.asset?.name} ({a.asset?.assetId})</td>
                  <td className="p-3 font-mono font-bold">₹{(a.contractValue || 0).toLocaleString()}</td>
                  <td className="p-3">{a.serviceFrequency}</td>
                  <td className="p-3 font-mono">{new Date(a.endDate).toLocaleDateString()}</td>
                  <td className="p-3 text-slate-600">{a.slaDetails || 'Standard SLA'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
