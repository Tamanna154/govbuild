import React, { useEffect, useState } from 'react';
import { Radio, Send, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { HealthBar } from '../components/common/HealthBar';
import { RiskBadge } from '../components/common/RiskBadge';

export const SensorSimulatorPage: React.FC = () => {
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [sensorData, setSensorData] = useState({
    temperature: '88.5',
    vibration: '4.8',
    voltage: '415',
    current: '145',
    runtimeHours: '3420',
    fuelLevel: '65'
  });
  const [result, setResult] = useState<any>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/assets').then(res => {
      setAssetsList(res.data);
      if (res.data.length > 0) {
        // Default to GEN-AHM-001 if present
        const gen = res.data.find((a: any) => a.assetId === 'GEN-AHM-001');
        setSelectedAssetId(gen ? gen.assetId : res.data[0].assetId);
      }
    });
  }, []);

  const handleSendReading = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    api.post('/sensors/readings', {
      asset_id: selectedAssetId,
      ...sensorData
    })
      .then(res => setResult(res.data))
      .catch(err => console.error(err))
      .finally(() => setSending(false));
  };

  const applyPreset = (preset: 'normal' | 'vibration' | 'overheat') => {
    if (preset === 'normal') {
      setSensorData({ temperature: '42.0', vibration: '1.2', voltage: '415', current: '110', runtimeHours: '3100', fuelLevel: '90' });
    } else if (preset === 'vibration') {
      setSensorData({ temperature: '68.0', vibration: '4.8', voltage: '410', current: '135', runtimeHours: '3420', fuelLevel: '65' });
    } else if (preset === 'overheat') {
      setSensorData({ temperature: '92.5', vibration: '3.6', voltage: '395', current: '155', runtimeHours: '3500', fuelLevel: '40' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-900 to-gov-950 text-white p-6 rounded-xl border border-gov-800 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
            IoT Sensor & Telemetry Integration Engine
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-1">IoT Live Telemetry Simulator</h2>
          <p className="text-xs text-gov-200 mt-0.5">Simulate IoT machine readings to test real-time Health recalculation, Risk escalation, and Alert generation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator Input Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
            Send IoT Sensor Reading Payload
          </h3>

          {/* Presets Bar */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-slate-500 font-semibold my-auto">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('normal')}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded text-xs font-semibold"
            >
              Normal Telemetry
            </button>
            <button
              type="button"
              onClick={() => applyPreset('vibration')}
              className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded text-xs font-semibold"
            >
              High Vibration (4.8 mm/s)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('overheat')}
              className="px-2.5 py-1 bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 rounded text-xs font-semibold"
            >
              Critical Over-Temp (92.5°C)
            </button>
          </div>

          <form onSubmit={handleSendReading} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block text-slate-700 mb-1">Target Asset ID</label>
              <select
                value={selectedAssetId}
                onChange={e => setSelectedAssetId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono font-bold text-gov-800"
              >
                {assetsList.map(a => (
                  <option key={a.id} value={a.assetId}>{a.assetId} - {a.name} ({a.building?.name})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sensorData.temperature}
                  onChange={e => setSensorData({ ...sensorData, temperature: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Vibration (mm/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sensorData.vibration}
                  onChange={e => setSensorData({ ...sensorData, vibration: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Voltage (V)</label>
                <input
                  type="number"
                  value={sensorData.voltage}
                  onChange={e => setSensorData({ ...sensorData, voltage: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Current (A)</label>
                <input
                  type="number"
                  value={sensorData.current}
                  onChange={e => setSensorData({ ...sensorData, current: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Runtime (Hours)</label>
                <input
                  type="number"
                  value={sensorData.runtimeHours}
                  onChange={e => setSensorData({ ...sensorData, runtimeHours: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Fuel Level (%)</label>
                <input
                  type="number"
                  value={sensorData.fuelLevel}
                  onChange={e => setSensorData({ ...sensorData, fuelLevel: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Telemetry Payload to POST /api/sensors/readings
            </button>
          </form>
        </div>

        {/* Live Calculation Output Result */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            Live Engine Computation Output
          </h3>

          {result ? (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono text-xs font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                  {result.assetId}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{result.name}</h4>
              </div>

              {/* Recalculated Health & Risk */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block mb-1">Updated Health Score</span>
                  <HealthBar score={result.updatedHealthScore} />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block mb-1">Updated Risk Score</span>
                  <RiskBadge level={result.riskLevel} score={result.updatedRiskScore} />
                </div>
              </div>

              {/* Dynamic Maintenance Priority */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700 block">
                  Dynamic Maintenance Priority Result
                </span>
                <div className="text-sm font-black text-rose-900">{result.priorityLevel} PRIORITY</div>
                <div className="space-y-1 pt-1 text-[11px]">
                  {result.explainableReasons?.map((r: string, idx: number) => (
                    <p key={idx}>{r}</p>
                  ))}
                </div>
              </div>

              {/* Alert status */}
              {result.alertGenerated && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Alert Triggered & Dispatched</span>
                    <p className="text-[11px] mt-0.5">{result.alertGenerated.message}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs">
              Select an asset, enter readings or choose a preset, and click "Send Telemetry Payload" to test real-time risk engine calculations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
