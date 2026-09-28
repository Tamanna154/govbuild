import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Cpu,
  GitFork,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  History,
  ShieldCheck,
  Award,
  ShieldAlert,
  Activity,
  FileText,
  Users,
  Settings,
  Radio,
  PlayCircle,
  Truck
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
        isActive
          ? 'bg-gov-800 text-white font-semibold shadow-sm'
          : 'text-slate-300 hover:bg-gov-900/60 hover:text-white'
      }`
    }
  >
    <div className="flex items-center gap-2.5">
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
    {badge && (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        {badge}
      </span>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gov-950 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between border-r border-gov-900 shrink-0 select-none">
      <div className="space-y-6">
        {/* Main Dashboard */}
        <div>
          <SidebarItem to="/" icon={<LayoutDashboard className="w-4 h-4 text-sky-400" />} label="Global Dashboard" />
        </div>

        {/* Infrastructure Group */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Infrastructure Registry
          </div>
          <div className="space-y-1">
            <SidebarItem to="/buildings" icon={<Building2 className="w-4 h-4 text-emerald-400" />} label="Buildings Registry" />
            <SidebarItem to="/gis-map" icon={<MapPin className="w-4 h-4 text-emerald-400" />} label="GIS Infrastructure Map" />
            <SidebarItem to="/assets" icon={<Cpu className="w-4 h-4 text-emerald-400" />} label="Physical Assets" />
            <SidebarItem to="/dependencies" icon={<GitFork className="w-4 h-4 text-emerald-400" />} label="Dependency Network Map" />
          </div>
        </div>

        {/* Maintenance Group */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Maintenance & Inspection
          </div>
          <div className="space-y-1">
            <SidebarItem to="/maintenance" icon={<Wrench className="w-4 h-4 text-amber-400" />} label="Work Order Tickets" />
            <SidebarItem to="/inspections" icon={<ClipboardCheck className="w-4 h-4 text-amber-400" />} label="Inspections Log" />
            <SidebarItem to="/failures" icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} label="Failure & Root Cause" />
          </div>
        </div>

        {/* Lifecycle Group */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Lifecycle & Contracts
          </div>
          <div className="space-y-1">
            <SidebarItem to="/lifecycle" icon={<History className="w-4 h-4 text-cyan-400" />} label="Lifecycle Events Timeline" />
            <SidebarItem to="/warranties" icon={<ShieldCheck className="w-4 h-4 text-cyan-400" />} label="Warranty Management" />
            <SidebarItem to="/amc" icon={<Award className="w-4 h-4 text-cyan-400" />} label="AMC Contracts" />
          </div>
        </div>

        {/* Risk & Intelligence Group */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Risk & Intelligence
          </div>
          <div className="space-y-1">
            <SidebarItem to="/risk" icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} label="Risk Dashboard" badge="Engine" />
            <SidebarItem to="/sensor-simulator" icon={<Radio className="w-4 h-4 text-rose-400" />} label="IoT Telemetry Simulator" badge="Live" />
          </div>
        </div>

        {/* Reports & Demo Walkthrough */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Reports & Demo Scenarios
          </div>
          <div className="space-y-1">
            <SidebarItem to="/reports" icon={<FileText className="w-4 h-4 text-indigo-400" />} label="Export Reports Center" />
            <SidebarItem to="/demo-walkthrough" icon={<PlayCircle className="w-4 h-4 text-amber-400 animate-pulse" />} label="Demo Scenarios Hub" badge="Interactive" />
          </div>
        </div>

        {/* Administration Group */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Administration
          </div>
          <div className="space-y-1">
            <SidebarItem to="/vendors" icon={<Truck className="w-4 h-4 text-slate-400" />} label="Vendors Directory" />
            <SidebarItem to="/users" icon={<Users className="w-4 h-4 text-slate-400" />} label="User Management" />
            <SidebarItem to="/audit-logs" icon={<Activity className="w-4 h-4 text-slate-400" />} label="Audit Trail Logs" />
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-gov-900 text-[11px] text-slate-400 text-center">
        <p className="font-semibold text-slate-300">GovBuild360 R&B Platform</p>
        <p className="text-[10px] text-slate-400">Roads & Buildings Dept, Gujarat</p>
      </div>
    </aside>
  );
};
