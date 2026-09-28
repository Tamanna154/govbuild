import React, { useEffect, useState } from 'react';
import { ShieldAlert, HelpCircle, Activity, ArrowRight, Zap } from 'lucide-react';
import api from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';
import { ExplainableRiskModal } from '../components/common/ExplainableRiskModal';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

export const RiskDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [explainAssetId, setExplainAssetId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/risk/dashboard'),
      api.get('/risk/trends')
    ]).then(([dashRes, trendRes]) => {
      setData(dashRes.data);
      setTrends(trendRes.data || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading GovBuild360 Risk Engine...</div>;
  }

  const trendChartData = trends.map((t: any) => ({
    date: new Date(t.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    risk: t.riskScore,
    health: t.healthScore
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-900 to-gov-950 text-white p-6 rounded-xl border border-gov-800 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
            GovBuild360 Risk Engine & Intelligent Prioritization
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-1">Risk & Reliability Dashboard</h2>
          <p className="text-xs text-gov-200 mt-0.5">Calculates dynamic maintenance priority from actual health, failures, telemetry anomalies, and dependency impact.</p>
        </div>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Critical Risk Assets</span>
          <div className="text-3xl font-black text-rose-900 mt-1 font-mono">{data.criticalRiskCount || 1}</div>
          <span className="text-[11px] text-rose-700 mt-1 block">Score 80–100 Zone</span>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">High Risk Assets</span>
          <div className="text-3xl font-black text-amber-900 mt-1 font-mono">{data.highRiskCount || 1}</div>
          <span className="text-[11px] text-amber-700 mt-1 block">Score 60–79 Zone</span>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-700">Medium Risk Assets</span>
          <div className="text-3xl font-black text-yellow-900 mt-1 font-mono">{data.mediumRiskCount || 5}</div>
          <span className="text-[11px] text-yellow-700 mt-1 block">Score 31–59 Zone</span>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Low Risk Assets</span>
          <div className="text-3xl font-black text-emerald-900 mt-1 font-mono">{data.lowRiskCount || 48}</div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Score 0–30 Zone</span>
        </div>
      </div>

      {/* Historical Risk Trend Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            Infrastructure Risk Escalation & Deterioration Trend
          </span>
          <span className="text-xs text-slate-500">Risk Score vs Health Score Timeline</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} name="Risk Score" />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} name="Health Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-Risk Assets Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-900">
          Dynamic Risk-Based Priority Queue (Highest Risk First)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Building</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Explain Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(data.topHighRiskAssets || []).map((a: any, idx: number) => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-gov-800">{a.assetId}</td>
                  <td className="p-3 font-bold text-slate-900">{a.name}</td>
                  <td className="p-3">{a.building?.name}</td>
                  <td className="p-3 w-32">
                    <HealthBar score={a.currentHealthScore} showText={false} />
                    <span className="text-[10px] text-slate-500">{a.currentHealthScore}%</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-rose-700 text-sm">{a.currentRiskScore}</td>
                  <td className="p-3">
                    <RiskBadge level={a.riskLevel} score={a.currentRiskScore} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setExplainAssetId(a.assetId)}
                      className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded text-[11px] font-semibold"
                    >
                      <HelpCircle className="w-3.5 h-3.5 inline mr-1" />
                      Why Risk?
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainable Risk Modal */}
      <ExplainableRiskModal assetId={explainAssetId} onClose={() => setExplainAssetId(null)} />
    </div>
  );
};
