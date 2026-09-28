import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  User,
  Cpu,
  Wrench,
  ShieldAlert,
  Layers,
  ArrowLeft,
  ChevronRight,
  Ruler,
  HardHat,
  FileText
} from 'lucide-react';
import { Building } from '../types';
import api from '../api/client';
import { HealthBar } from '../components/common/HealthBar';
import { RiskBadge } from '../components/common/RiskBadge';
import { getBuildingImage } from '../utils/buildingImages';

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
    return <div className="py-24 text-center text-slate-500 text-xs">Loading Building details...</div>;
  }

  const buildingImg = getBuildingImage(building);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/buildings')}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Building Registry
        </button>
      </div>

      {/* Building Hero with Photo & Specs */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative h-64 bg-slate-900 w-full overflow-hidden">
          <img
            src={buildingImg}
            alt={building.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded">
                  {building.buildingId}
                </span>
                <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded font-medium">
                  {building.type}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{building.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {building.address} ({building.district}, {building.taluka})
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/20 text-right">
              <span className="text-[11px] text-slate-300 block">Condition Index</span>
              <span className="text-xl font-bold font-mono text-white">
                {Math.round(building.currentHealthScore)} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Details Summary grid */}
        <div className="p-5 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 block text-[11px]">Governing Department</span>
            <span className="font-semibold text-slate-900">{building.department?.name || 'Roads & Buildings Department'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Primary Civil Contractor</span>
            <span className="font-semibold text-slate-900">{building.contractor || 'L&T Infrastructure'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Built-up Area / Floors</span>
            <span className="font-semibold text-slate-900">{building.builtUpArea || 25000} sq.m / {building.totalFloors} Floors</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Responsible Executive Officer</span>
            <span className="font-semibold text-slate-900">{building.responsibleOfficer || 'Er. Vikram Shah'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-5 border-b border-slate-200 gap-6">
          {(['overview', 'assets', 'tickets'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs font-semibold capitalize transition border-b-2 -mb-[1px] ${
                activeTab === tab
                  ? 'border-slate-800 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'assets' ? `Assets (${building.assets?.length || 0})` : tab === 'tickets' ? `Tickets (${building.tickets?.length || 0})` : 'Facility Overview'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Building Specifications & Scope
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {building.description ||
                'Key administrative public facility under the Roads & Buildings Department, Government of Gujarat. Houses critical civil governance wings with dedicated power backup, HVAC chillers, elevators, fire-suppression networks, and telecommunications.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Coordinates</span>
                <span className="font-mono text-slate-900 font-semibold">
                  Lat {building.latitude}, Lng {building.longitude}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Overall Status</span>
                <span className="text-emerald-700 font-bold font-mono">
                  {building.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Infrastructure Summary
            </h3>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Tracked Units</span>
              <span className="font-bold text-slate-900">{building.assets?.length || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Integrated Systems</span>
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
              Assigned Equipment & Life-Safety Infrastructure
            </span>
            <span className="text-slate-500 font-mono">{building.assets?.length || 0} Assets</span>
          </div>
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 uppercase font-semibold text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Risk Rating</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {building.assets?.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-800">{a.assetId}</td>
                  <td className="p-3 font-bold text-slate-900">{a.name}</td>
                  <td className="p-3">{a.category}</td>
                  <td className="p-3 w-32">
                    <HealthBar score={a.currentHealthScore} showText={false} />
                    <span className="text-[10px] text-slate-500">{Math.round(a.currentHealthScore)}%</span>
                  </td>
                  <td className="p-3">
                    <RiskBadge level={a.riskLevel} score={a.currentRiskScore} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/assets/${a.assetId}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 text-xs">
          {building.tickets?.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No open tickets for this building.</div>
          ) : (
            <div className="space-y-2">
              {building.tickets?.map((t: any) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 mr-2">
                      {t.ticketId}
                    </span>
                    <span className="font-semibold text-slate-900">{t.title}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
