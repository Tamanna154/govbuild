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
  ChevronRight,
  Activity,
  QrCode,
  ClipboardCheck,
  MapPin,
  Send,
  PhoneCall,
  X,
  FileText
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';
import { ExplainableRiskModal } from '../components/common/ExplainableRiskModal';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [explainAssetId, setExplainAssetId] = useState<string | null>(null);
  const [selectedHealthTier, setSelectedHealthTier] = useState<string>('critical');
  const [showTechnicianTicketModal, setShowTechnicianTicketModal] = useState(false);
  const navigate = useNavigate();

  const activeRoleView: Role = user?.role || 'ENGINEER';

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  const m = {
    totalBuildings: data?.metrics?.totalBuildings || 10,
    totalAssets: data?.metrics?.totalAssets || 55,
    operationalAssets: data?.metrics?.operationalAssets || 51,
    highRiskAssets: data?.metrics?.highRiskAssets || 2,
    criticalAssets: data?.metrics?.criticalAssets || 1,
    openTickets: data?.metrics?.openTickets || 1,
    expiringAMCs: data?.metrics?.expiringAMCs || 2
  };

  const hd = {
    excellent: data?.healthDistribution?.excellent ?? 28,
    good: data?.healthDistribution?.good ?? 16,
    moderate: data?.healthDistribution?.moderate ?? 7,
    poor: data?.healthDistribution?.poor ?? 3,
    critical: data?.healthDistribution?.critical ?? 1
  };

  const defaultTierAssets: Record<string, any[]> = {
    critical: [
      {
        id: 'ast-gen-001',
        assetId: 'GEN-AHM-001',
        name: 'Emergency Diesel Generator 750 kVA',
        building: { name: 'Gujarat Swarnim Sankul 1' },
        category: 'Power & Backup',
        currentHealthScore: 42,
        currentRiskScore: 82
      }
    ],
    poor: [
      {
        id: 'ast-chl-001',
        assetId: 'CHL-AHM-001',
        name: 'Central Chilled Water HVAC Plant 250 TR',
        building: { name: 'New Civil Hospital' },
        category: 'HVAC',
        currentHealthScore: 58,
        currentRiskScore: 64
      }
    ],
    moderate: [
      {
        id: 'ast-lft-002',
        assetId: 'LFT-AHM-002',
        name: 'Trauma Emergency Stretcher Lift #2',
        building: { name: 'New Civil Hospital' },
        category: 'Vertical Transport',
        currentHealthScore: 68,
        currentRiskScore: 48
      }
    ],
    good: [
      {
        id: 'ast-pmp-001',
        assetId: 'PMP-AHM-001',
        name: 'Main Hydrant Fire Water Pump 75 kW',
        building: { name: 'Gujarat Swarnim Sankul 1' },
        category: 'Fire Protection',
        currentHealthScore: 88,
        currentRiskScore: 35
      }
    ],
    excellent: [
      {
        id: 'ast-lft-001',
        assetId: 'LFT-AHM-001',
        name: 'Executive Passenger Lift No. 1 (Otis)',
        building: { name: 'Gujarat Swarnim Sankul 1' },
        category: 'Vertical Transport',
        currentHealthScore: 92,
        currentRiskScore: 28
      },
      {
        id: 'ast-ats-001',
        assetId: 'ATS-AHM-001',
        name: 'Automatic Transfer Switch & LT Panel',
        building: { name: 'Gujarat Swarnim Sankul 1' },
        category: 'Power & Backup',
        currentHealthScore: 94,
        currentRiskScore: 22
      }
    ]
  };

  const breakdown = data?.healthBreakdownDetails || defaultTierAssets;
  const currentTierAssets: any[] = breakdown[selectedHealthTier] || defaultTierAssets[selectedHealthTier] || [];

  const healthChartData = [
    { key: 'excellent', name: 'Excellent (90-100%)', value: hd.excellent, color: '#059669' },
    { key: 'good', name: 'Good (75-89%)', value: hd.good, color: '#2563eb' },
    { key: 'moderate', name: 'Moderate (60-74%)', value: hd.moderate, color: '#d97706' },
    { key: 'poor', name: 'Poor (40-59%)', value: hd.poor, color: '#ea580c' },
    { key: 'critical', name: 'Critical (<40%)', value: hd.critical, color: '#dc2626' }
  ];

  const categoryBreakdown = data?.categoryCounts || {
    'Power & Electrical': 18,
    'HVAC & Air Handling': 12,
    'Vertical Transport (Lifts)': 10,
    'Fire & Safety Protection': 9,
    'Civil & Water Systems': 6
  };

  return (
    <div className="space-y-6">
      {/* Sleek Government Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="text-amber-400 font-bold">Government of Gujarat</span>
            <span>•</span>
            <span>Roads & Buildings Department</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            {activeRoleView === 'CITIZEN' || activeRoleView === 'VIEWER'
              ? 'Gujarat Citizen Public Infrastructure Portal'
              : activeRoleView === 'INSPECTOR'
              ? 'Field Safety & Quality Audit Command'
              : activeRoleView === 'TECHNICIAN'
              ? 'Maintenance Contractor Operations Desk'
              : 'State Infrastructure Asset & Risk Command Center'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeRoleView === 'CITIZEN' || activeRoleView === 'VIEWER'
              ? 'Real-time public facility condition monitoring, GIS explorer, and civic grievance resolution.'
              : activeRoleView === 'INSPECTOR'
              ? 'On-site inspections, asset QR verification, defect reporting, and compliance auditing.'
              : activeRoleView === 'TECHNICIAN'
              ? 'Assigned repair work orders, parts requisition, and OEM maintenance contracts.'
              : 'Condition monitoring, lifecycle registry, dependency networks, and predictive risk management.'}
          </p>
        </div>

        {/* Action Shortcuts for Engineers & Admins */}
        {(activeRoleView === 'SUPER_ADMIN' || activeRoleView === 'ENGINEER' || activeRoleView === 'DEPT_ADMIN') && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/demo-walkthrough')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <PlayCircle className="w-4 h-4" />
              Demo Scenarios
            </button>
            <button
              onClick={() => navigate('/gis-map')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              GIS Map
            </button>
          </div>
        )}

        {/* Citizen Quick Action */}
        {(activeRoleView === 'CITIZEN' || activeRoleView === 'VIEWER') && (
          <button
            onClick={() => navigate('/citizen-grievance')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            Lodge Civic Grievance
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CITIZEN DASHBOARD PERSPECTIVE                                          */}
      {/* ========================================================================= */}
      {(activeRoleView === 'CITIZEN' || activeRoleView === 'VIEWER') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/buildings')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Public Complexes</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.totalBuildings} Facilities</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Civil hospitals, courts, collectorates</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Operational Health Index</span>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">98.2%</h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Essential public services online</p>
            </div>

            <div
              onClick={() => navigate('/citizen-grievance')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Citizen Grievances</span>
              <h3 className="text-2xl font-bold text-indigo-700 mt-1">24 Lodged</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">22 Resolved • Average SLA: 36 hrs</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Toll-Free Helpline</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">1800-233-5500</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">R&B 24x7 Control Room</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700">
                <PhoneCall className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/gis-map')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">GIS Public Facilities Map</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore government buildings, hospitals, and civil complexes across Gujarat on the map.
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-3">
                Open GIS Map <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => navigate('/citizen-grievance')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-500 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Report a Civic Grievance</h3>
              <p className="text-xs text-slate-500 mt-1">
                Report broken elevators, water seepage, or power faults directly to R&B engineers.
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700 mt-3">
                Lodge Grievance <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => navigate('/buildings')}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-sky-500 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mb-3 group-hover:bg-sky-600 group-hover:text-white transition">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Public Facilities Directory</h3>
              <p className="text-xs text-slate-500 mt-1">
                View building addresses, accessibility ramps, health ratings, and responsible officers.
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-sky-700 mt-3">
                Browse Directory <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INSPECTOR DASHBOARD PERSPECTIVE                                        */}
      {/* ========================================================================= */}
      {activeRoleView === 'INSPECTOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/inspections')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Scheduled Audits</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">3 Facilities</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Gandhinagar Secretariat & Civil Hospital</p>
            </div>

            <div
              onClick={() => navigate('/failures')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-rose-700 uppercase">Critical Flagged Defects</span>
              <h3 className="text-2xl font-bold text-rose-700 mt-1">1 Critical Item</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">GEN-AHM-001 (Oil Pressure Drop)</p>
            </div>

            <div
              onClick={() => navigate('/scan-qr')}
              className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm hover:bg-slate-800 transition cursor-pointer flex justify-between items-center"
            >
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase">Field Mobile Tool</span>
                <h3 className="text-lg font-bold text-white mt-1">Scan Equipment QR</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Scan asset tag for instant verification</p>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => navigate('/inspections')}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-sky-500 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-sky-50 text-sky-700">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Conduct Safety Inspection</h4>
                  <p className="text-xs text-slate-500">Record physical condition, vibration, leakage, and photos</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => navigate('/failures')}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-500 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-50 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Log Breakdown / Defect</h4>
                  <p className="text-xs text-slate-500">Document root symptoms and mark asset severity rating</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TECHNICIAN / CONTRACTOR DASHBOARD PERSPECTIVE                          */}
      {/* ========================================================================= */}
      {activeRoleView === 'TECHNICIAN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Clickable Active Ticket Card */}
            <div
              onClick={() => setShowTechnicianTicketModal(true)}
              className="bg-white p-4 rounded-xl border-2 border-amber-300 bg-amber-50/30 shadow-sm hover:border-amber-500 hover:shadow transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Assigned Work Orders (Click to View)
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">1 Active Ticket</h3>
                  <p className="text-xs font-semibold text-amber-700 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Diesel Generator Oil Pressure Fault
                  </p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Click to view parts & repair specs</span>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/warranties')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">AMC SLA Contracts</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.expiringAMCs} Due Renewal</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">L&T Infrastructure & Voltas HVAC</p>
            </div>

            <div
              onClick={() => navigate('/scan-qr')}
              className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm hover:bg-slate-800 transition cursor-pointer flex justify-between items-center"
            >
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase">Field Diagnostic</span>
                <h3 className="text-lg font-bold text-white mt-1">Scan Asset QR</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">View service manual & wiring diagram</p>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setShowTechnicianTicketModal(true)}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-500 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-50 text-amber-700">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Ticket Details: GEN-AHM-001 Fault</h4>
                  <p className="text-xs text-slate-500">View diagnostic data, parts required, and log resolution</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => navigate('/assets')}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-500 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Asset Technical Specifications</h4>
                  <p className="text-xs text-slate-500">Access OEM manuals, capacity ratings, and warranty certificates</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ENGINEER / DEPT ADMIN / SUPER ADMIN DASHBOARD PERSPECTIVE              */}
      {/* ========================================================================= */}
      {(activeRoleView === 'ENGINEER' || activeRoleView === 'DEPT_ADMIN' || activeRoleView === 'SUPER_ADMIN') && (
        <div className="space-y-6">
          {/* Executive KPI Stats - All Clickable with proper redirection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/buildings')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">State Building Registry</span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.totalBuildings}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Click to view civil complexes</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/assets')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Tracked Assets</span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.totalAssets}</h3>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{m.operationalAssets} Operational</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/risk')}
              className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm hover:border-rose-400 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold text-rose-700 uppercase">High Risk Assets</span>
                  <h3 className="text-2xl font-bold text-rose-900 mt-1">{m.highRiskAssets}</h3>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">{m.criticalAssets} Critical Action Required</p>
                </div>
                <div className="p-2 bg-rose-100 rounded-lg border border-rose-200 text-rose-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/maintenance')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Work Orders</span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{m.openTickets}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.expiringAMCs} AMC Renewals Due</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Health Score Distribution (Interactive Donut) + Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Infrastructure Health Score Distribution
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click any band below to view corresponding assets.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  0–100 Scale
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
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
                        onClick={(entry) => setSelectedHealthTier(entry.key)}
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

                  <div className="absolute text-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-900 block">{m.totalAssets}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Assets</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {healthChartData.map((item) => {
                    const isSelected = selectedHealthTier === item.key;
                    return (
                      <div
                        key={item.key}
                        onClick={() => setSelectedHealthTier(item.key)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
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
                        <span className="font-mono text-xs">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drilldown Asset Detail Panel */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-600" />
                    Assets in "{selectedHealthTier.toUpperCase()}" Range ({currentTierAssets.length})
                  </span>
                  <button
                    onClick={() => navigate('/assets')}
                    className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold"
                  >
                    View in Registry →
                  </button>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {currentTierAssets.map((asset: any) => (
                    <div
                      key={asset.id}
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex justify-between items-center text-xs cursor-pointer transition"
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
                            {Math.round(asset.currentHealthScore)}%
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            Risk: {Math.round(asset.currentRiskScore || 0)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clickable Category Breakdown with proper redirection */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assets by Infrastructure Discipline
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click any discipline to filter and inspect assets.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Statewide
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {Object.entries(categoryBreakdown).map(([cat, count]: any) => {
                  const total = m.totalAssets;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div
                      key={cat}
                      onClick={() => navigate(`/assets?category=${encodeURIComponent(cat)}`)}
                      className="p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <div className="flex justify-between text-xs font-semibold text-slate-700 group-hover:text-sky-700">
                        <span>{cat}</span>
                        <span className="font-mono text-slate-900 font-bold flex items-center gap-1">
                          {count} Units ({pct}%)
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-slate-700 group-hover:bg-sky-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fast Module Shortcuts for Engineers */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/dependencies')}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition"
                >
                  <div className="text-[11px] font-bold text-purple-700">Dependency Networks</div>
                  <div className="text-[10px] text-slate-500">Cascade failure analysis →</div>
                </button>
                <button
                  onClick={() => navigate('/citizen-grievance')}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition"
                >
                  <div className="text-[11px] font-bold text-emerald-700">Citizen Grievances</div>
                  <div className="text-[10px] text-slate-500">Public reported issues →</div>
                </button>
              </div>
            </div>
          </div>

          {/* High-Risk Priority Action Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Critical Risk Assets Requiring Immediate Attention
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic evaluation incorporating age degradation, cascade dependencies, and telemetry alarms.
                </p>
              </div>
              <button
                onClick={() => navigate('/risk')}
                className="text-xs text-slate-800 hover:text-slate-950 font-semibold flex items-center gap-1 transition"
              >
                View Risk Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">Asset ID</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Health Score</th>
                    <th className="p-3">Risk Rating</th>
                    <th className="p-3">Level</th>
                    <th className="p-3 text-right">Root Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
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
                      <span className="text-[10px] text-rose-700 font-bold">42% (Critical)</span>
                    </td>
                    <td className="p-3 font-mono font-black text-rose-700 text-sm">82 / 100</td>
                    <td className="p-3">
                      <RiskBadge level="CRITICAL" score={82} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setExplainAssetId('GEN-AHM-001')}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold text-[11px] shadow-sm flex items-center gap-1.5 ml-auto transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Explain Risk
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
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-[11px] flex items-center gap-1.5 ml-auto transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Explain Risk
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Technician Active Ticket Details Modal */}
      {showTechnicianTicketModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  TKT-2026-001
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  Diesel Generator Oil Pressure Fault
                </h3>
                <p className="text-xs text-slate-500">Gujarat Swarnim Sankul 1 • Substation Basement</p>
              </div>
              <button onClick={() => setShowTechnicianTicketModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Problem Diagnostic & Symptom:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  Low lubricating oil pressure alarm tripped (1.8 bar detected vs 4.5 bar nominal). Engine emergency shut-off triggered to prevent crankshaft bearing seizure.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Target Asset:</span>
                  <strong className="text-slate-900">GEN-AHM-001 (Cummins 750 kVA)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority & SLA:</span>
                  <strong className="text-rose-600 font-bold">URGENT (24h SLA)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Contractor:</span>
                  <strong className="text-slate-900">Mahesh Solanki (L&T Power)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">IN PROGRESS</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block">Required Spares & Cost Estimate:</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>• 15W-40 Premium Engine Oil (50 Litres)</span><strong>₹8,500</strong></div>
                  <div className="flex justify-between"><span>• OEM Cartridge Oil Filter (#OF-750)</span><strong>₹4,300</strong></div>
                  <div className="flex justify-between"><span>• Certified Electrical Technician Labor (4 hrs)</span><strong>₹4,500</strong></div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                    <span>Total Estimated Repair Cost</span><strong>₹17,300</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTechnicianTicketModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTechnicianTicketModal(false);
                  navigate('/maintenance');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                Open in Maintenance Work Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explainable AI Risk Root Cause Modal */}
      <ExplainableRiskModal assetId={explainAssetId} onClose={() => setExplainAssetId(null)} />
    </div>
  );
};
