import React, { useEffect, useState } from 'react';
import {
  Building2,
  Cpu,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle,
  Wrench,
  HelpCircle,
  ArrowRight,
  Radio,
  PlayCircle,
  FileCheck,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  Activity
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';
import { ExplainableRiskModal } from '../components/common/ExplainableRiskModal';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [explainAssetId, setExplainAssetId] = useState<string | null>(null);
  const [selectedHealthTier, setSelectedHealthTier] = useState<string | null>('critical');
  const navigate = useNavigate();

  // Active Role view (defaults to logged-in user role or SUPER_ADMIN)
  const [activeRoleView, setActiveRoleView] = useState<Role>(user?.role || 'SUPER_ADMIN');

  useEffect(() => {
    if (user?.role) {
      setActiveRoleView(user.role);
    }
  }, [user?.role]);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 font-medium text-xs">
        Loading Gujarat Public Infrastructure Analytics...
      </div>
    );
  }

  const m = data?.metrics || {};
  const hd = data?.healthDistribution || {};
  const breakdown = data?.healthBreakdownDetails || {};

  const healthChartData = [
    { key: 'excellent', name: 'Excellent (90-100%)', value: hd.excellent || 0, color: '#059669' },
    { key: 'good', name: 'Good (75-89%)', value: hd.good || 0, color: '#2563eb' },
    { key: 'moderate', name: 'Moderate (60-74%)', value: hd.moderate || 0, color: '#d97706' },
    { key: 'poor', name: 'Poor (40-59%)', value: hd.poor || 0, color: '#ea580c' },
    { key: 'critical', name: 'Critical (<40%)', value: hd.critical || 0, color: '#dc2626' }
  ];

  const currentTierAssets: any[] = selectedHealthTier ? (breakdown[selectedHealthTier] || []) : [];

  const handleSliceClick = (entry: any) => {
    setSelectedHealthTier(entry.key);
  };

  return (
    <div className="space-y-6">
      {/* Official Government Header Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="text-amber-400 font-bold">Government of Gujarat</span>
            <span>•</span>
            <span>Roads & Buildings (R&B) Department</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            State Infrastructure Asset & Risk Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Unified condition monitoring, lifecycle registry, dependency network analysis, and predictive risk management.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/demo-walkthrough')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-md text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <PlayCircle className="w-4 h-4" />
            Launch Demo Scenarios
          </button>
          <button
            onClick={() => navigate('/sensor-simulator')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md text-xs flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Radio className="w-4 h-4 text-rose-400" />
            IoT Telemetry
          </button>
        </div>
      </div>

      {/* Role-Based Dashboard View Selector */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Role Perspective:
          </span>
          <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {activeRoleView.replace('_', ' ')}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { role: 'SUPER_ADMIN', label: 'Super Admin (Chief Engineer)' },
            { role: 'DEPT_ADMIN', label: 'Executive Engineer (Facility)' },
            { role: 'INSPECTOR', label: 'Field Safety Inspector' },
            { role: 'TECHNICIAN', label: 'Maintenance Contractor' }
          ].map(r => (
            <button
              key={r.role}
              onClick={() => {
                setActiveRoleView(r.role as Role);
                switchRole(r.role as Role);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition text-xs ${
                activeRoleView === r.role
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role-Tailored Curated KPI Stats */}
      {activeRoleView === 'SUPER_ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/buildings')}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">State Building Registry</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.totalBuildings || 10}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Civil & administrative complexes</p>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/assets')}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Tracked Assets</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.totalAssets || 55}</h3>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{m.operationalAssets || 50} Operational</p>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/risk')}
            className="bg-white p-4 rounded-lg border border-rose-200 bg-rose-50/30 shadow-sm hover:border-rose-300 transition cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-rose-700 uppercase">High Risk Assets</span>
                <h3 className="text-2xl font-bold text-rose-900 mt-1">{m.highRiskAssets || 2}</h3>
                <p className="text-[11px] text-rose-700 font-medium mt-0.5">{m.criticalAssets || 1} Require Urgent Action</p>
              </div>
              <div className="p-2 bg-rose-100 rounded border border-rose-200 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/maintenance')}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Work Orders</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.openTickets || 1}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{m.expiringAMCs || 1} AMC Renewals Pending</p>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeRoleView === 'DEPT_ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Division Facility Uptime</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">98.4%</h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">All essential life-support systems online</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Preventive Work Tickets</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.openTickets || 1} Open</h3>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Average resolution SLA: 48 Hours</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Contractor AMC Status</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.expiringAMCs || 1} Due Renewal</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">L&T Infrastructure & Voltas HVAC</p>
          </div>
        </div>
      )}

      {activeRoleView === 'INSPECTOR' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Scheduled Audits</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">3 Facilities</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Gandhinagar Secretariat & Civil Hospital</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Assets Due for Review</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.criticalAssets || 1} Critical Asset</h3>
            <p className="text-[11px] text-rose-700 font-medium mt-0.5">Diesel Generator (GEN-AHM-001)</p>
          </div>
          <div
            onClick={() => navigate('/scan')}
            className="bg-slate-800 text-white p-4 rounded-lg border border-slate-700 shadow-sm hover:bg-slate-900 transition cursor-pointer flex justify-between items-center"
          >
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase">On-Site QR Scanner</span>
              <h3 className="text-lg font-bold text-white mt-1">Scan Asset Tag</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Quick lookup via camera or QR code</p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      )}

      {activeRoleView === 'TECHNICIAN' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Maintenance Tickets</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.openTickets || 1} Pending</h3>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Diesel Generator Oil Pressure Fault</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Spares & Inventory Requisition</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">In Stock</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Oil Filter Element & 15W-40 Lube Oil</p>
          </div>
          <div
            onClick={() => navigate('/maintenance')}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer flex justify-between items-center"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Work Log Entry</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Submit Task Report</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Update ticket status and resolution hours</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      )}

      {/* Main Analytics Grid: Interactive Health Distribution + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Infrastructure Health Score Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Infrastructure Health Score Distribution
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click on any slice or band below to view the specific public assets.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              0–100 Rating
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            {/* Pie Chart Canvas */}
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    onClick={handleSliceClick}
                    cursor="pointer"
                  >
                    {healthChartData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        stroke={selectedHealthTier === entry.key ? '#0f172a' : '#ffffff'}
                        strokeWidth={selectedHealthTier === entry.key ? 3 : 1.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Assets`, name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute text-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 block">{m.totalAssets || 55}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Assets</span>
              </div>
            </div>

            {/* Clickable Interactive Legend */}
            <div className="space-y-1.5 text-xs">
              {healthChartData.map((item) => {
                const isSelected = selectedHealthTier === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedHealthTier(item.key)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-100 font-bold border border-slate-300'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono text-xs">{item.value} Assets</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drilldown Asset Detail Panel (Shows on slice click) */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-600" />
                Assets in "{selectedHealthTier?.toUpperCase()}" Health Range ({currentTierAssets.length})
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Click an asset to view profile</span>
            </div>

            {currentTierAssets.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded text-center text-slate-500 text-xs">
                No assets currently in this health score range.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentTierAssets.map((asset: any) => (
                  <div
                    key={asset.id}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex justify-between items-center text-xs cursor-pointer transition"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {asset.assetId}
                        </span>
                        <span className="font-semibold text-slate-900 truncate">{asset.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {asset.building?.name || 'Main Facility'} • {asset.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            asset.currentHealthScore < 40
                              ? 'text-rose-700'
                              : asset.currentHealthScore < 75
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {Math.round(asset.currentHealthScore)}% Health
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          Risk: {Math.round(asset.currentRiskScore || 0)}/100
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Assets by Infrastructure Category
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Portfolio count across electrical, mechanical, HVAC, civil, and safety disciplines.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Statewide
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(data?.categoryCounts || {}).map(([cat, count]: any) => {
              const total = m.totalAssets || 55;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {count} Units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Risk Priority Action Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              High Risk Infrastructure Assets Requiring Engineering Attention
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated by Dynamic Risk Engine incorporating Condition Degradation, Cascade Dependencies, and IoT Anomalies.
            </p>
          </div>
          <button
            onClick={() => navigate('/risk')}
            className="text-xs text-slate-800 hover:text-slate-950 font-semibold flex items-center gap-1 transition"
          >
            View Full Risk Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Asset Description</th>
                <th className="p-3">Facility / Location</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Risk Rating</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Root Cause Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Highlight GEN-AHM-001 (Priority Target) */}
              <tr className="bg-rose-50/40 hover:bg-rose-50 transition">
                <td className="p-3">
                  <span className="font-mono font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                    GEN-AHM-001
                  </span>
                </td>
                <td className="p-3 font-bold text-slate-900">Main Emergency Diesel Generator 750 kVA</td>
                <td className="p-3">Gujarat Swarnim Sankul 1</td>
                <td className="p-3 w-36">
                  <HealthBar score={42} showText={false} />
                  <span className="text-[10px] text-rose-700 font-bold">42% (Critical Condition)</span>
                </td>
                <td className="p-3 font-mono font-black text-rose-700 text-sm">82 / 100</td>
                <td className="p-3">
                  <RiskBadge level="CRITICAL" score={82} />
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setExplainAssetId('GEN-AHM-001')}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-semibold text-[11px] shadow-sm flex items-center gap-1.5 ml-auto transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why High Risk?
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition">
                <td className="p-3">
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    LFT-AHM-001
                  </span>
                </td>
                <td className="p-3 font-bold text-slate-900">Executive Passenger Lift No. 1 (Otis)</td>
                <td className="p-3">Gujarat Swarnim Sankul 1</td>
                <td className="p-3 w-36">
                  <HealthBar score={92} showText={false} />
                  <span className="text-[10px] text-emerald-700 font-bold">92% (Normal)</span>
                </td>
                <td className="p-3 font-mono font-bold text-slate-800">28 / 100</td>
                <td className="p-3">
                  <RiskBadge level="LOW" score={28} />
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setExplainAssetId('LFT-AHM-001')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] flex items-center gap-1.5 ml-auto transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why Low Risk?
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainable AI Risk Root Cause Modal */}
      <ExplainableRiskModal assetId={explainAssetId} onClose={() => setExplainAssetId(null)} />
    </div>
  );
};
