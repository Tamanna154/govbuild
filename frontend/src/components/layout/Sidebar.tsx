import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Cpu,
  GitFork,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  Award,
  ShieldAlert,
  Activity,
  FileText,
  Users,
  Radio,
  PlayCircle,
  Truck,
  QrCode,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, badge, badgeColor }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
        isActive
          ? 'bg-slate-800 text-white font-semibold shadow-sm'
          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
      }`
    }
  >
    <div className="flex items-center gap-2.5">
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
    {badge && (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor || 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
        {badge}
      </span>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role: Role = user?.role || 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (r: Role) => {
    switch (r) {
      case 'CITIZEN':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'INSPECTOR':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'TECHNICIAN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'ENGINEER':
      case 'DEPT_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'SUPER_ADMIN':
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      <div className="space-y-5">
        {/* Role Scope Notice */}
        <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Scope</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getRoleBadgeStyle(role)}`}>
              {role.replace('_', ' ')}
            </span>
          </div>
          <div className="text-[11px] font-semibold text-slate-200 mt-1 truncate">
            {user?.name || 'Authorized Official'}
          </div>
        </div>

        {/* 1. CITIZEN / VIEWER ROLE NAVIGATION */}
        {(role === 'CITIZEN' || role === 'VIEWER') && (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Citizen Portal
              </div>
              <div className="space-y-1">
                <SidebarItem to="/" icon={<LayoutDashboard className="w-4 h-4 text-emerald-400" />} label="Public Overview" />
                <SidebarItem to="/gis-map" icon={<MapPin className="w-4 h-4 text-emerald-400" />} label="GIS Public Map" />
                <SidebarItem to="/buildings" icon={<Building2 className="w-4 h-4 text-emerald-400" />} label="Public Facilities" />
                <SidebarItem
                  to="/citizen-grievance"
                  icon={<AlertCircle className="w-4 h-4 text-emerald-400" />}
                  label="Report Civic Grievance"
                  badge="Lodge"
                  badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. FIELD INSPECTOR NAVIGATION */}
        {role === 'INSPECTOR' && (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Field Inspection Hub
              </div>
              <div className="space-y-1">
                <SidebarItem to="/" icon={<LayoutDashboard className="w-4 h-4 text-sky-400" />} label="Inspector Command" />
                <SidebarItem
                  to="/scan-qr"
                  icon={<QrCode className="w-4 h-4 text-sky-400" />}
                  label="Scan Equipment QR"
                  badge="On-Site"
                  badgeColor="bg-sky-500/20 text-sky-300 border-sky-500/30"
                />
                <SidebarItem to="/inspections" icon={<ClipboardCheck className="w-4 h-4 text-sky-400" />} label="Safety Inspections" />
                <SidebarItem to="/failures" icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} label="Log Breakdown / Defect" />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Asset References
              </div>
              <div className="space-y-1">
                <SidebarItem to="/buildings" icon={<Building2 className="w-4 h-4 text-slate-300" />} label="Buildings Directory" />
                <SidebarItem to="/assets" icon={<Cpu className="w-4 h-4 text-slate-300" />} label="Physical Assets" />
              </div>
            </div>
          </div>
        )}

        {/* 3. CONTRACTOR / TECHNICIAN NAVIGATION */}
        {role === 'TECHNICIAN' && (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Maintenance Execution
              </div>
              <div className="space-y-1">
                <SidebarItem to="/" icon={<LayoutDashboard className="w-4 h-4 text-amber-400" />} label="Contractor Overview" />
                <SidebarItem
                  to="/maintenance"
                  icon={<Wrench className="w-4 h-4 text-amber-400" />}
                  label="Work Order Tickets"
                  badge="Active"
                  badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
                />
                <SidebarItem to="/scan-qr" icon={<QrCode className="w-4 h-4 text-amber-400" />} label="Scan Equipment QR" />
                <SidebarItem to="/assets" icon={<Cpu className="w-4 h-4 text-amber-400" />} label="Asset Technical Specs" />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Contract & Warranty
              </div>
              <div className="space-y-1">
                <SidebarItem to="/warranties" icon={<ShieldCheck className="w-4 h-4 text-cyan-400" />} label="Equipment Warranties" />
                <SidebarItem to="/amc" icon={<Award className="w-4 h-4 text-cyan-400" />} label="AMC SLA Coverage" />
              </div>
            </div>
          </div>
        )}

        {/* 4. EXECUTIVE ENGINEER / DEPT ADMIN NAVIGATION */}
        {(role === 'ENGINEER' || role === 'DEPT_ADMIN') && (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Operations Command
              </div>
              <div className="space-y-1">
                <SidebarItem to="/" icon={<LayoutDashboard className="w-4 h-4 text-sky-400" />} label="Executive Command" />
                <SidebarItem to="/buildings" icon={<Building2 className="w-4 h-4 text-emerald-400" />} label="Buildings Registry" />
                <SidebarItem to="/gis-map" icon={<MapPin className="w-4 h-4 text-emerald-400" />} label="GIS Infrastructure Map" />
                <SidebarItem to="/assets" icon={<Cpu className="w-4 h-4 text-emerald-400" />} label="Physical Assets" />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Systems & Risk Engine
              </div>
              <div className="space-y-1">
                <SidebarItem
                  to="/dependencies"
                  icon={<GitFork className="w-4 h-4 text-purple-400" />}
                  label="Dependency Networks"
                  badge="Graph"
                  badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
                />
                <SidebarItem
                  to="/risk"
                  icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
                  label="Predictive Risk Engine"
                  badge="Analytics"
                  badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
                />
                <SidebarItem to="/failures" icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} label="Failure & Root Cause" />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Oversight & Reports
              </div>
              <div className="space-y-1">
                <SidebarItem to="/maintenance" icon={<Wrench className="w-4 h-4 text-amber-400" />} label="Work Order Tickets" />
                <SidebarItem to="/inspections" icon={<ClipboardCheck className="w-4 h-4 text-amber-400" />} label="Inspections Log" />
                <SidebarItem to="/reports" icon={<FileText className="w-4 h-4 text-indigo-400" />} label="Statewide Reports" />
              </div>
            </div>
          </div>
        )}

        {/* 5. SUPER ADMIN (FULL ACCESS) */}
        {role === 'SUPER_ADMIN' && (
          <div className="space-y-4">
            <div>
              <SidebarItem to="/" icon={<LayoutDashboard className="w-4 h-4 text-sky-400" />} label="State Command Center" />
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Infrastructure
              </div>
              <div className="space-y-1">
                <SidebarItem to="/buildings" icon={<Building2 className="w-4 h-4 text-emerald-400" />} label="Buildings Registry" />
                <SidebarItem to="/gis-map" icon={<MapPin className="w-4 h-4 text-emerald-400" />} label="GIS Infrastructure Map" />
                <SidebarItem to="/assets" icon={<Cpu className="w-4 h-4 text-emerald-400" />} label="Physical Assets" />
                <SidebarItem to="/dependencies" icon={<GitFork className="w-4 h-4 text-purple-400" />} label="Dependency Networks" />
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Maintenance & Risk
              </div>
              <div className="space-y-1">
                <SidebarItem to="/maintenance" icon={<Wrench className="w-4 h-4 text-amber-400" />} label="Work Order Tickets" />
                <SidebarItem to="/inspections" icon={<ClipboardCheck className="w-4 h-4 text-amber-400" />} label="Inspections Log" />
                <SidebarItem to="/risk" icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} label="Risk Engine" badge="Engine" />
                <SidebarItem to="/sensor-simulator" icon={<Radio className="w-4 h-4 text-rose-400" />} label="IoT Telemetry Simulator" badge="Live" />
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Administration & Demos
              </div>
              <div className="space-y-1">
                <SidebarItem to="/reports" icon={<FileText className="w-4 h-4 text-indigo-400" />} label="Export Reports Center" />
                <SidebarItem to="/demo-walkthrough" icon={<PlayCircle className="w-4 h-4 text-amber-400" />} label="Demo Scenarios Hub" />
                <SidebarItem to="/users" icon={<Users className="w-4 h-4 text-slate-400" />} label="User Management" />
                <SidebarItem to="/audit-logs" icon={<Activity className="w-4 h-4 text-slate-400" />} label="Audit Trail Logs" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer User Profile & Instant Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Official'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.designation || role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out / Switch Persona"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-800 flex items-center justify-center gap-1.5 transition"
        >
          <LogOut className="w-3 h-3 text-slate-400" />
          Switch Role / Sign Out
        </button>
      </div>
    </aside>
  );
};
