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
  PlayCircle
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';
import { ExplainableRiskModal } from '../components/common/ExplainableRiskModal';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [explainAssetId, setExplainAssetId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading GovBuild360 Analytics Dashboard...</div>;
  }

  const m = data?.metrics || {};

  const healthChartData = [
    { name: 'Excellent (90%+)', value: data?.healthDistribution?.excellent || 0, color: '#10b981' },
    { name: 'Good (75-89%)', value: data?.healthDistribution?.good || 0, color: '#3b82f6' },
    { name: 'Moderate (60-74%)', value: data?.healthDistribution?.moderate || 0, color: '#eab308' },
    { name: 'Poor (40-59%)', value: data?.healthDistribution?.poor || 0, color: '#f97316' },
    { name: 'Critical (<40%)', value: data?.healthDistribution?.critical || 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Scenario Quick Action */}
      <div className="bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gov-700">
        <div>
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest bg-amber-500/20 px-2.5 py-1 rounded border border-amber-400/30">
            Roads & Buildings Department, Govt of Gujarat
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">Government Infrastructure Asset & Risk Command Dashboard</h2>
          <p className="text-xs text-gov-200 mt-1">
            Real-time condition monitoring, dependency graph analysis, and dynamic risk-based maintenance prioritization.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/demo-walkthrough')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gov-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
          >
            <PlayCircle className="w-4 h-4" />
            Launch Demo Scenarios
          </button>
          <button
            onClick={() => navigate('/sensor-simulator')}
            className="px-4 py-2 bg-gov-800 hover:bg-gov-700 text-white font-medium rounded-xl text-xs flex items-center gap-2 border border-gov-600 transition"
          >
            <Radio className="w-4 h-4 text-rose-400" />
            IoT Telemetry Simulator
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Buildings"
          value={m.totalBuildings || 10}
          subtitle="Registered across districts"
          icon={<Building2 className="w-6 h-6 text-gov-600" />}
          onClick={() => navigate('/buildings')}
        />
        <StatCard
          title="Tracked Assets"
          value={m.totalAssets || 55}
          subtitle={`${m.operationalAssets || 50} Operational`}
          icon={<Cpu className="w-6 h-6 text-emerald-600" />}
          onClick={() => navigate('/assets')}
        />
        <StatCard
          title="High Risk Assets"
          value={m.highRiskAssets || 2}
          subtitle={`${m.criticalAssets || 1} Critical Risk`}
          color="border-rose-200 bg-rose-50/50"
          icon={<ShieldAlert className="w-6 h-6 text-rose-600" />}
          onClick={() => navigate('/risk')}
        />
        <StatCard
          title="Open Work Tickets"
          value={m.openTickets || 1}
          subtitle={`${m.expiringWarranties || 1} Warranty Expiring`}
          icon={<Wrench className="w-6 h-6 text-amber-600" />}
          onClick={() => navigate('/maintenance')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Score Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Infrastructure Health Score Distribution</span>
            <span className="text-xs text-slate-500 font-normal">0–100 Scale</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {healthChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div>
              <span className="text-emerald-600 font-bold">{data?.healthDistribution?.excellent || 0}</span>
              <p className="text-slate-500">Excellent</p>
            </div>
            <div>
              <span className="text-amber-600 font-bold">{data?.healthDistribution?.moderate || 0}</span>
              <p className="text-slate-500">Moderate</p>
            </div>
            <div>
              <span className="text-rose-600 font-bold">{data?.healthDistribution?.critical || 0}</span>
              <p className="text-slate-500">Critical</p>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Assets by Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(data?.categoryCounts || {}).map(([cat, count]: any) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{cat}</span>
                  <span className="font-mono text-gov-700">{count} Units</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gov-600 h-full rounded-full" style={{ width: `${Math.min(100, (count / (m.totalAssets || 55)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Attention Assets & Explainable Risk Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              High Risk Infrastructure Assets Requiring Priority Action
            </h3>
            <p className="text-xs text-slate-500">Dynamic Risk Engine evaluation based on Health, Failures, Telemetry & Dependencies</p>
          </div>
          <button
            onClick={() => navigate('/risk')}
            className="text-xs text-gov-700 hover:text-gov-900 font-semibold flex items-center gap-1"
          >
            View Full Risk Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Building</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Explainable AI Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Highlight GEN-AHM-001 Prompt Target */}
              <tr className="bg-rose-50/60 hover:bg-rose-50 transition">
                <td className="p-3">
                  <span className="font-mono font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                    GEN-AHM-001
                  </span>
                </td>
                <td className="p-3 font-bold text-slate-900">Main Emergency Diesel Generator 750 kVA</td>
                <td className="p-3">Gujarat Swarnim Sankul 1</td>
                <td className="p-3 w-36">
                  <HealthBar score={42} showText={false} />
                  <span className="text-[10px] text-rose-700 font-bold">42% (Critical)</span>
                </td>
                <td className="p-3 font-mono font-black text-rose-700 text-sm">82 / 100</td>
                <td className="p-3">
                  <RiskBadge level="CRITICAL" score={82} />
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setExplainAssetId('GEN-AHM-001')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] shadow-sm flex items-center gap-1.5 ml-auto transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why High Risk?
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition">
                <td className="p-3">
                  <span className="font-mono font-bold text-gov-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    LFT-AHM-001
                  </span>
                </td>
                <td className="p-3 font-bold text-slate-900">Executive Passenger Lift No. 1 (Otis)</td>
                <td className="p-3">Gujarat Swarnim Sankul 1</td>
                <td className="p-3 w-36">
                  <HealthBar score={92} showText={false} />
                  <span className="text-[10px] text-emerald-700 font-bold">92% (Good)</span>
                </td>
                <td className="p-3 font-mono font-bold text-slate-800">28 / 100</td>
                <td className="p-3">
                  <RiskBadge level="LOW" score={28} />
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setExplainAssetId('LFT-AHM-001')}
                    className="px-3 py-1.5 bg-gov-100 text-gov-800 hover:bg-gov-200 rounded-lg font-semibold text-[11px] flex items-center gap-1.5 ml-auto transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why High Risk?
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainable Risk Modal */}
      <ExplainableRiskModal assetId={explainAssetId} onClose={() => setExplainAssetId(null)} />
    </div>
  );
};
