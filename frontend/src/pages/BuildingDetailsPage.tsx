import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Calendar, User, Cpu, Wrench, ShieldAlert, Layers } from 'lucide-react';
import { Building } from '../types';
import api from '../api/client';
import { HealthBar } from '../components/common/HealthBar';
import { RiskBadge } from '../components/common/RiskBadge';

export const BuildingDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [building, setBuilding] = useState<Building | any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'tickets'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.get(`/buildings/${id}`)
      .then(res => setBuilding(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !building) {
    return <div className="p-8 text-center text-slate-500">Loading Building details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                {building.buildingId}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                {building.type}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{building.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {building.address} ({building.district}, {building.taluka})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-36">
              <HealthBar score={building.currentHealthScore} />
            </div>
          </div>
        </div>

        {/* Details Summary grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block">Department</span>
            <span className="font-semibold text-slate-800">{building.department?.name || 'R&B Department'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Construction Contractor</span>
            <span className="font-semibold text-slate-800">{building.contractor || 'L&T Infrastructure'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Built-up Area / Floors</span>
            <span className="font-semibold text-slate-800">{building.builtUpArea || 25000} sq.m / {building.totalFloors} Floors</span>
          </div>
          <div>
            <span className="text-slate-400 block">Officer Responsible</span>
            <span className="font-semibold text-slate-800">{building.responsibleOfficer || 'Er. Vikram Shah'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 pt-2">
          {(['overview', 'assets', 'tickets'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-xs font-bold capitalize transition border-b-2 ${
                activeTab === tab ? 'border-gov-700 text-gov-700' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'assets' ? `Assets (${building.assets?.length || 0})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Building Overview & Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {building.description || 'Primary government administrative building managed under Roads & Buildings Department, Government of Gujarat. Contains critical electrical, mechanical, HVAC, water supply, and safety infrastructure.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Infrastructure Summary</h3>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Registered Assets</span>
              <span className="font-bold text-slate-900">{building.assets?.length || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Building Systems</span>
              <span className="font-bold text-slate-900">{building.systems?.length || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Open Tickets</span>
              <span className="font-bold text-slate-900">{building.tickets?.length || 0}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Health</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {building.assets?.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-gov-800">{a.assetId}</td>
                  <td className="p-3 font-bold text-slate-900">{a.name}</td>
                  <td className="p-3">{a.category}</td>
                  <td className="p-3 w-32">
                    <HealthBar score={a.currentHealthScore} showText={false} />
                    <span className="text-[10px] text-slate-500">{a.currentHealthScore}%</span>
                  </td>
                  <td className="p-3">
                    <RiskBadge level={a.riskLevel} score={a.currentRiskScore} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/assets/${a.assetId}`)}
                      className="px-2.5 py-1 bg-gov-50 text-gov-700 hover:bg-gov-100 rounded text-[11px] font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
