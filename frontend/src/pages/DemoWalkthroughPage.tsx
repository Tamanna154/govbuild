import React, { useState } from 'react';
import { PlayCircle, CheckCircle, ShieldAlert, GitFork, ShieldCheck, Clock, Zap, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export const DemoWalkthroughPage: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [scenarioOutput, setScenarioOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const runDemoScenario = (scenarioNum: number) => {
    setActiveScenario(scenarioNum);
    setLoading(true);
    setScenarioOutput(null);

    let endpoint = '';
    if (scenarioNum === 1) endpoint = '/scenarios/demo-1/deteriorate';
    else if (scenarioNum === 12) endpoint = '/scenarios/demo-1/repair';
    else if (scenarioNum === 2) endpoint = '/scenarios/demo-2/fail-generator';
    else if (scenarioNum === 3) endpoint = '/scenarios/demo-3/warranty-expiry';
    else if (scenarioNum === 4) endpoint = '/scenarios/demo-4/priority-comparison';

    api.post(endpoint)
      .then(res => setScenarioOutput(res.data))
      .catch(err => {
        // Fallback for GET request on Demo 4
        if (scenarioNum === 4) {
          api.get(endpoint).then(r => setScenarioOutput(r.data));
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-900 to-gov-950 text-white p-6 rounded-xl border border-gov-800 shadow-lg">
        <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
          GovBuild360 Demonstration Suite
        </span>
        <h2 className="text-2xl font-black tracking-tight mt-1">Interactive Demo Scenarios Walkthrough Hub</h2>
        <p className="text-xs text-gov-200 mt-0.5">Test and demonstrate the core intelligent engines specified in the Master Project Prompt.</p>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Scenario 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">1</span>
              <h3 className="font-bold text-sm text-slate-900">Critical Asset Deterioration & Repair Cycle</h3>
            </div>
            <span className="text-[10px] font-mono bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded">GEN-AHM-001</span>
          </div>
          <p className="text-xs text-slate-600">
            Simulates Generator telemetry anomaly (Temp 88.5°C, Vib 4.8 mm/s), drops Health to 42%, escalates Risk to 82, shifts priority to <strong>URGENT</strong>, then runs repair cycle restoring Health to 88% and Risk to 25.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => runDemoScenario(1)}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow"
            >
              Step 1: Trigger High Risk (42% Health)
            </button>
            <button
              onClick={() => runDemoScenario(12)}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow"
            >
              Step 2: Complete Repair (88% Health)
            </button>
          </div>
        </div>

        {/* Scenario 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">2</span>
              <h3 className="font-bold text-sm text-slate-900">Dependency Cascade Failure Simulation</h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">Graph Traversal</span>
          </div>
          <p className="text-xs text-slate-600">
            Marks Generator as FAILED, traverses dependency graph, identifies affected ATS, Emergency Panel, Emergency Lighting, and dispatches Infrastructure Impact Alert.
          </p>
          <button
            onClick={() => runDemoScenario(2)}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow pt-2"
          >
            Run Dependency Failure Simulation
          </button>
        </div>

        {/* Scenario 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">3</span>
              <h3 className="font-bold text-sm text-slate-900">Warranty Expiry Alert & Action</h3>
            </div>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">LFT-AHM-001</span>
          </div>
          <p className="text-xs text-slate-600">
            Sets Executive Lift warranty end date to 10 days from today, triggers "Warranty Expiring Soon" alert, and allows AMC contract renewal.
          </p>
          <button
            onClick={() => runDemoScenario(3)}
            className="w-full py-2 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow"
          >
            Trigger 10-Day Warranty Expiry Alert
          </button>
        </div>

        {/* Scenario 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs">4</span>
              <h3 className="font-bold text-sm text-slate-900">Risk Priority vs Fixed Calendar Schedule</h3>
            </div>
            <span className="text-[10px] font-mono bg-cyan-100 text-cyan-900 font-bold px-2 py-0.5 rounded">Core Innovation</span>
          </div>
          <p className="text-xs text-slate-600">
            Demonstrates how Asset B (45 days calendar remaining but High Risk 82) is prioritized ahead of Asset A (7 days calendar remaining but Low Risk 20).
          </p>
          <button
            onClick={() => runDemoScenario(4)}
            className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow"
          >
            Compare Dynamic Risk Priority Queue
          </button>
        </div>
      </div>

      {/* Output Console Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          Live Scenario Execution Output & Result Log
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Executing Scenario Logic across Business Logic Services...</div>
        ) : scenarioOutput ? (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-3 bg-gov-50 border border-gov-200 rounded-lg">
              <span className="font-bold text-gov-900 text-sm">{scenarioOutput.scenario}</span>
              {scenarioOutput.explanation && <p className="text-slate-600 mt-1 leading-relaxed">{scenarioOutput.explanation}</p>}
            </div>

            {/* Render Output Details */}
            {scenarioOutput.beforeVsAfter && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1">
                  <span className="font-bold text-rose-800 uppercase">BEFORE REPAIR</span>
                  <div className="text-sm">Health: <strong className="text-rose-700">{scenarioOutput.beforeVsAfter.beforeHealthScore}%</strong></div>
                  <div className="text-sm">Risk Score: <strong className="text-rose-700">{scenarioOutput.beforeVsAfter.beforeRiskScore}</strong></div>
                  <div className="text-xs font-bold text-rose-800 mt-1">URGENT PRIORITY</div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                  <span className="font-bold text-emerald-800 uppercase">AFTER REPAIR</span>
                  <div className="text-sm">Health: <strong className="text-emerald-700">{scenarioOutput.beforeVsAfter.afterHealthScore}%</strong></div>
                  <div className="text-sm">Risk Score: <strong className="text-emerald-700">{scenarioOutput.beforeVsAfter.afterRiskScore}</strong></div>
                  <div className="text-xs font-bold text-emerald-800 mt-1">LOW PRIORITY</div>
                </div>
              </div>
            )}

            {scenarioOutput.impactResult && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-900">Cascade Impact Traversal Summary:</h4>
                <p className="text-amber-800 leading-snug">{scenarioOutput.impactResult.impactSummary}</p>
                <div className="text-slate-600">
                  Total Affected Assets: <strong>{scenarioOutput.impactResult.totalAffectedAssets}</strong> | Systems Affected: <strong>{scenarioOutput.impactResult.totalAffectedSystems}</strong>
                </div>
              </div>
            )}

            {scenarioOutput.comparison && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800">Priority Queue Ranking Result:</h4>
                {scenarioOutput.comparison.map((c: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${c.rankInQueue === 1 ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border mr-2">Queue Rank #{c.rankInQueue}</span>
                      <strong className="text-slate-900">{c.assetId} - {c.name}</strong>
                      <div className="text-[11px] text-slate-500 mt-0.5">Calendar Due: {c.calendarDaysRemaining} days away | Health: {c.healthScore}% | Risk: {c.riskScore}</div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded ${c.dynamicPriority === 'URGENT' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {c.dynamicPriority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">
            Click any scenario button above to trigger automated business logic and view real-time engine execution logs.
          </div>
        )}
      </div>
    </div>
  );
};
