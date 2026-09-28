import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Search,
  Cpu,
  ArrowRight,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { HealthBar } from '../components/common/HealthBar';
import { RiskBadge } from '../components/common/RiskBadge';

interface QuickAsset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  type: string;
  buildingName: string;
  healthScore: number;
  riskScore: number;
  status: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  telemetry: {
    voltage: number;
    current: number;
    temperature: number;
    vibration: number;
    oilLevel?: number;
  };
}

const PRESET_ASSETS: QuickAsset[] = [
  {
    id: 'ast-gen-001',
    assetId: 'GEN-AHM-001',
    name: 'Main Emergency Diesel Generator 750 kVA',
    category: 'Power & Backup',
    type: 'Diesel Generator',
    buildingName: 'Gujarat Swarnim Sankul 1, Gandhinagar',
    healthScore: 42,
    riskScore: 82,
    status: 'UNDER_MAINTENANCE',
    location: 'Basement Electrical Substation B-02',
    manufacturer: 'Cummins India Ltd',
    model: 'QSK23-G3 (750 kVA / 600 kWe)',
    serialNumber: 'SN-CUM-2024-8891',
    telemetry: { voltage: 395, current: 110, temperature: 84.5, vibration: 4.8, oilLevel: 45 }
  },
  {
    id: 'ast-ats-001',
    assetId: 'ATS-AHM-001',
    name: 'Automatic Transfer Switch & Main LT Panel',
    category: 'Power & Backup',
    type: 'Transfer Switch',
    buildingName: 'Gujarat Swarnim Sankul 1, Gandhinagar',
    healthScore: 88,
    riskScore: 38,
    status: 'OPERATIONAL',
    location: 'Ground Floor Main Switchgear Room',
    manufacturer: 'Schneider Electric',
    model: 'MasterPact MTZ2 1600A',
    serialNumber: 'SN-SCH-2023-1102',
    telemetry: { voltage: 415, current: 240, temperature: 48.0, vibration: 0.6 }
  },
  {
    id: 'ast-lft-001',
    assetId: 'LFT-AHM-001',
    name: 'Executive Passenger Lift No. 1 (Otis)',
    category: 'Vertical Transport',
    type: 'Traction Elevator',
    buildingName: 'Gujarat Swarnim Sankul 1, Gandhinagar',
    healthScore: 92,
    riskScore: 28,
    status: 'OPERATIONAL',
    location: 'Central Atrium Shaft A',
    manufacturer: 'Otis Elevator Company India',
    model: 'Gen2-Regen (13 Persons / 1000 kg)',
    serialNumber: 'SN-OTIS-2022-4412',
    telemetry: { voltage: 415, current: 42, temperature: 36.5, vibration: 0.4 }
  },
  {
    id: 'ast-chl-001',
    assetId: 'CHL-AHM-001',
    name: 'Central Chilled Water HVAC Plant 250 TR',
    category: 'HVAC',
    type: 'Water-Cooled Chiller',
    buildingName: 'New Civil Hospital, Ahmedabad',
    healthScore: 68,
    riskScore: 54,
    status: 'OPERATIONAL',
    location: 'Utility Block Ground Plant',
    manufacturer: 'Voltas Limited (Tata)',
    model: 'VWC-250-Centrifugal',
    serialNumber: 'SN-VOL-2021-9981',
    telemetry: { voltage: 415, current: 185, temperature: 52.0, vibration: 1.8 }
  },
  {
    id: 'ast-pmp-001',
    assetId: 'PMP-AHM-001',
    name: 'Main Hydrant Fire Water Pump 75 kW',
    category: 'Fire Protection',
    type: 'Centrifugal Fire Pump',
    buildingName: 'Gujarat Swarnim Sankul 1, Gandhinagar',
    healthScore: 88,
    riskScore: 35,
    status: 'OPERATIONAL',
    location: 'Fire Pump Room Yard 1',
    manufacturer: 'Kirloskar Brothers Ltd',
    model: 'DB 100/26 Fire Spec',
    serialNumber: 'SN-KBL-2023-3341',
    telemetry: { voltage: 415, current: 85, temperature: 42.0, vibration: 1.1 }
  }
];

export const ScanQrPage: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(PRESET_ASSETS[0].assetId);
  const [currentAsset, setCurrentAsset] = useState<QuickAsset>(PRESET_ASSETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const navigate = useNavigate();

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    const found = PRESET_ASSETS.find(a => a.assetId === assetId || a.id === assetId);
    if (found) {
      setCurrentAsset(found);
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanSuccess(false);

    // Pick next asset or random
    const randomIndex = Math.floor(Math.random() * PRESET_ASSETS.length);
    const assetToScan = PRESET_ASSETS[randomIndex];

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setSelectedAssetId(assetToScan.assetId);
      setCurrentAsset(assetToScan);
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const found = PRESET_ASSETS.find(a => a.assetId.toLowerCase() === manualInput.trim().toLowerCase());
    if (found) {
      setCurrentAsset(found);
      setSelectedAssetId(found.assetId);
    } else {
      navigate(`/assets/${manualInput.trim()}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-sky-700 uppercase tracking-wider">
            <span>Field Mobile Verification</span>
            <span>•</span>
            <span>R&B Department</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-600" />
            Equipment QR Scanner & System Diagnostics
          </h1>
          <p className="text-xs text-slate-500">Scan QR codes or select equipment to access real-time telemetry and service history.</p>
        </div>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Camera className="w-4 h-4" />
          {isScanning ? 'Scanning Asset QR...' : 'Simulate Camera Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Scan Controls & Dropdown Selection */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scanner Box */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
            {isScanning ? (
              <div className="space-y-3 text-center">
                <div className="w-24 h-24 border-2 border-dashed border-amber-400 rounded-xl relative mx-auto flex items-center justify-center animate-pulse">
                  <div className="w-full h-0.5 bg-amber-400 absolute top-1/2 left-0 -translate-y-1/2 shadow-lg shadow-amber-400/80 animate-bounce"></div>
                  <QrCode className="w-10 h-10 text-amber-400/50" />
                </div>
                <div className="text-xs text-amber-300 font-mono animate-pulse">Reading QR Barcode...</div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  <QrCode className="w-10 h-10 text-sky-400" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-200">Mobile Camera Scanner Active</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Align equipment QR tag inside viewfinder</div>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Trigger Scan
                </button>
              </div>
            )}

            {scanSuccess && (
              <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 p-2 rounded-lg text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified: <strong>{currentAsset.assetId}</strong></span>
              </div>
            )}
          </div>

          {/* Asset Selection Dropdown Menu */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <label className="text-xs font-bold text-slate-800 block">
              Select Equipment from Registry Dropdown:
            </label>
            <select
              value={selectedAssetId}
              onChange={e => handleSelectAsset(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-sky-500"
            >
              {PRESET_ASSETS.map(a => (
                <option key={a.assetId} value={a.assetId}>
                  {a.assetId} — {a.name} ({a.category})
                </option>
              ))}
            </select>

            {/* Quick Demo Tags */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                One-Click Equipment Select:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ASSETS.map(a => (
                  <button
                    key={a.assetId}
                    type="button"
                    onClick={() => handleSelectAsset(a.assetId)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition border ${
                      selectedAssetId === a.assetId
                        ? 'bg-sky-50 border-sky-300 text-sky-700 ring-1 ring-sky-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {a.assetId}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Asset ID Search */}
            <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Or type Asset ID (e.g. GEN-AHM-001)..."
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Lookup
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live System Details */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                  {currentAsset.assetId}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {currentAsset.category} • {currentAsset.type}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  currentAsset.status === 'OPERATIONAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {currentAsset.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{currentAsset.name}</h2>
              <div className="text-xs text-slate-500 mt-0.5">{currentAsset.buildingName} • {currentAsset.location}</div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Risk Rating</span>
              <RiskBadge level={currentAsset.riskScore > 70 ? 'CRITICAL' : currentAsset.riskScore > 40 ? 'MEDIUM' : 'LOW'} score={currentAsset.riskScore} />
            </div>
          </div>

          {/* Health Bar */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Equipment Condition Health Score</span>
              <span className="font-mono font-bold">{currentAsset.healthScore}%</span>
            </div>
            <HealthBar score={currentAsset.healthScore} showText={false} />
          </div>

          {/* Real-Time Telemetry Diagnostic Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              Live Telemetry Readings (IoT Sensor Diagnostic)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase">Operating Voltage</span>
                <div className="font-mono font-bold text-sm text-slate-900 mt-0.5">{currentAsset.telemetry.voltage} V</div>
                <span className="text-[10px] text-emerald-700 font-medium">Nominal ±2%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase">Load Current</span>
                <div className="font-mono font-bold text-sm text-slate-900 mt-0.5">{currentAsset.telemetry.current} A</div>
                <span className="text-[10px] text-slate-500">Under Load</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase">Bearing Temp</span>
                <div className={`font-mono font-bold text-sm mt-0.5 ${currentAsset.telemetry.temperature > 80 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentAsset.telemetry.temperature}°C
                </div>
                <span className={`text-[10px] font-medium ${currentAsset.telemetry.temperature > 80 ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                  {currentAsset.telemetry.temperature > 80 ? 'High Temp Alarm' : 'Normal'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase">Vibration Velocity</span>
                <div className={`font-mono font-bold text-sm mt-0.5 ${currentAsset.telemetry.vibration > 3 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentAsset.telemetry.vibration} mm/s
                </div>
                <span className={`text-[10px] font-medium ${currentAsset.telemetry.vibration > 3 ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                  {currentAsset.telemetry.vibration > 3 ? 'Dampener Fault' : 'Within ISO 10816'}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              OEM Equipment Specification
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Manufacturer: <strong className="text-slate-900">{currentAsset.manufacturer}</strong></div>
              <div>Model: <strong className="text-slate-900">{currentAsset.model}</strong></div>
              <div>Serial Number: <strong className="text-slate-900 font-mono">{currentAsset.serialNumber}</strong></div>
              <div>Maintenance SLA: <strong className="text-emerald-700">Active AMC Contract</strong></div>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => navigate('/inspections')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <ClipboardCheck className="w-4 h-4" />
              Conduct Inspection on this Asset
            </button>
            <button
              onClick={() => navigate('/maintenance')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Wrench className="w-4 h-4" />
              Open Work Orders
            </button>
            <button
              onClick={() => navigate('/assets')}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ml-auto"
            >
              View in Asset Registry <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
