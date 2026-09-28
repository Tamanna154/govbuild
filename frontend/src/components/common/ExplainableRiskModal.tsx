import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, X, Zap } from 'lucide-react';
import { ExplainRiskData } from '../../types';
import api from '../../api/client';
import { RiskBadge } from './RiskBadge';
import { HealthBar } from './HealthBar';

interface ExplainableRiskModalProps {
  assetId: string | null;
  onClose: () => void;
}

export const ExplainableRiskModal: React.FC<ExplainableRiskModalProps> = ({ assetId, onClose }) => {
  const [data, setData] = useState<ExplainRiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    api.get(`/risk/explain/${assetId}`)
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching explainable risk:', err))
      .finally(() => setLoading(false));
  }, [assetId]);

  if (!assetId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gov-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-300 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Why is this asset high risk?</h3>
              <p className="text-xs text-gov-200 font-mono">GovBuild360 Risk Methodology & Explainable AI Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gov-300 hover:text-white p-1 rounded-md hover:bg-gov-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Evaluating multi-factor risk parameters...</div>
          ) : data ? (
            <>
              {/* Asset Title Bar */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-gov-600 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                    {data.assetId}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-1">{data.name}</h4>
                  <p className="text-xs text-slate-500">{data.buildingName}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-slate-500">Risk Score</div>
                  <RiskBadge level={data.riskLevel} score={data.currentRiskScore} />
                </div>
              </div>

              {/* Core Metrics comparison */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Asset Health</span>
                  <HealthBar score={data.currentHealthScore} showText={false} />
                  <div className="text-xs font-bold text-slate-800 mt-1">{data.currentHealthScore}% Score</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Maintenance Priority</span>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${data.priorityLevel === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {data.priorityLevel} PRIORITY
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500">Dependencies</span>
                  <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    {data.dependentCount} System(s)
                  </div>
                </div>
              </div>

              {/* Explainable Reasons List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Risk Contributing Factors</h5>
                <div className="space-y-2">
                  {data.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-950 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{reason.startsWith('✓') ? reason : `✓ ${reason}`}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
                <strong>Dynamic Priority Guarantee:</strong> GovBuild360 prioritizes actual asset condition, telemetry anomalies, and failure impact over static calendar dates.
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-8">Failed to load risk factors.</div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gov-700 text-white rounded-lg text-sm font-medium hover:bg-gov-800 transition">
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
