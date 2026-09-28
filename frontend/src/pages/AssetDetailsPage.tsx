import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cpu, ShieldAlert, Wrench, History, QrCode, Calendar, MapPin, Zap, ArrowRight, HelpCircle } from 'lucide-react';
import { Asset } from '../types';
import api from '../api/client';
import { HealthBar } from '../components/common/HealthBar';
import { RiskBadge } from '../components/common/RiskBadge';
import { ExplainableRiskModal } from '../components/common/ExplainableRiskModal';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AssetDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'lifecycle' | 'health_risk' | 'inspections' | 'maintenance' | 'dependencies'>('overview');
  const [showExplain, setShowExplain] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/assets/${id}`)
      .then(res => setAsset(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !asset) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Asset Details...</div>;
  }

  const healthHistoryChartData = (asset.healthHistory || []).map((h: any) => ({
    date: new Date(h.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    score: h.healthScore
  })).reverse();

  const riskHistoryChartData = (asset.riskHistory || []).map((r: any) => ({
    date: new Date(r.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    score: r.riskScore
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Asset Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gov-700 bg-gov-50 px-2.5 py-0.5 rounded border border-gov-200">
                {asset.assetId}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                {asset.category} / {asset.type}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${asset.currentStatus === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {asset.currentStatus}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{asset.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {asset.building?.name} — Location: {asset.locationInBuilding || 'Main Equipment Room'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-gov-700" /> Print QR Tag
            </button>
            <button
              onClick={() => setShowExplain(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-gov-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <HelpCircle className="w-4 h-4" /> Why Risk Score?
            </button>
          </div>
        </div>

        {/* Health & Risk Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <HealthBar score={asset.currentHealthScore} />
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500">Risk Assessment</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{asset.currentRiskScore} / 100</div>
            </div>
            <RiskBadge level={asset.riskLevel} score={asset.currentRiskScore} />
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500">Dynamic Priority</span>
              <div className="mt-1">
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${asset.criticalityLevel === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {asset.criticalityLevel} PRIORITY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 pt-2 overflow-x-auto">
          {(['overview', 'lifecycle', 'health_risk', 'inspections', 'maintenance', 'dependencies'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-xs font-bold capitalize transition border-b-2 whitespace-nowrap ${
                activeTab === tab ? 'border-gov-700 text-gov-700' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.replace('_', ' & ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Technical Specifications & Procurement Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Manufacturer</span>
                <span className="font-semibold text-slate-800">{asset.manufacturer || 'Siemens'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Model & Serial</span>
                <span className="font-semibold text-slate-800">{asset.model || 'MOD-2022'} ({asset.serialNumber || 'SN-9910'})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Purchase Date & Cost</span>
                <span className="font-semibold text-slate-800">
                  {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '2021-03-15'} (₹{(asset.purchaseCost || 4800000).toLocaleString()})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Expected Lifespan / EOL</span>
                <span className="font-semibold text-slate-800">{asset.expectedLifeYears} Years (EOL: 2036)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block mb-1">Asset Description</span>
              <p className="text-slate-600 leading-relaxed">
                {asset.description || 'Primary government building equipment monitored under GovBuild360 Risk-based lifecycle maintenance framework.'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Warranty & AMC Contracts</h3>
            {asset.warranties && asset.warranties.length > 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900 block">Active Warranty Coverage</span>
                <p className="text-emerald-700 mt-1">Provider: {asset.warranties[0].providerName}</p>
                <p className="text-slate-500 mt-0.5">Ends: {new Date(asset.warranties[0].endDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">No active warranty</div>
            )}

            {asset.amcContracts && asset.amcContracts.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-bold text-blue-900 block">Active AMC Contract ({asset.amcContracts[0].contractNumber})</span>
                <p className="text-blue-700 mt-1">Service: {asset.amcContracts[0].serviceFrequency}</p>
                <p className="text-slate-500 mt-0.5">Expires: {new Date(asset.amcContracts[0].endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'lifecycle' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-gov-700" />
            Asset Lifecycle History Timeline (Non-destructive Audit Trail)
          </h3>
          <div className="relative border-l-2 border-gov-200 ml-4 space-y-6 pl-6">
            {(asset.lifecycleEvents || []).map((evt: any, i: number) => (
              <div key={evt.id || i} className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-gov-700 border-4 border-white shadow" />
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gov-900 uppercase tracking-wider bg-gov-100 px-2 py-0.5 rounded">
                      {evt.eventType}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(evt.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium mt-1">{evt.description}</p>
                  {evt.performedBy && <p className="text-[10px] text-slate-400">Performed by: {evt.performedBy}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'health_risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Historical Asset Health Trend</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthHistoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Historical Risk Level Trend</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskHistoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="font-bold text-base text-slate-900">Asset QR Tag</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center">
              <img src={asset.qrCodeUrl} alt="QR" className="w-48 h-48 rounded" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                {asset.assetId}
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-1">{asset.name}</h4>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => window.print()} className="px-4 py-2 bg-gov-700 text-white rounded text-xs font-bold shadow">
                Print Tag
              </button>
              <button onClick={() => setShowQrModal(false)} className="px-4 py-2 border rounded text-xs font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explainable Risk Modal */}
      <ExplainableRiskModal assetId={showExplain ? asset.assetId : null} onClose={() => setShowExplain(false)} />
    </div>
  );
};
