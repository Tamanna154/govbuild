import { Role } from '../types';

export interface NavItemConfig {
  to: string;
  label: string;
  iconName: string;
  badge?: string;
  badgeColor?: string;
  allowedRoles: Role[];
}

export interface NavGroupConfig {
  title: string;
  allowedRoles: Role[];
  items: NavItemConfig[];
}

export const ROLE_PERMISSIONS: Record<Role, {
  title: string;
  shortDesc: string;
  color: string;
  badgeBg: string;
  landingPath: string;
  features: string[];
}> = {
  CITIZEN: {
    title: 'Citizen / Civil Resident',
    shortDesc: 'Public building directory, GIS map & civic grievance reporting',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    landingPath: '/',
    features: ['Public Facilities Map', 'Building Health Overview', 'Civic Grievance / Defect Reporting']
  },
  INSPECTOR: {
    title: 'Field Safety Inspector',
    shortDesc: 'On-site inspections, asset QR verification & defect logging',
    color: 'blue',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    landingPath: '/',
    features: ['Inspection Audits', 'Mobile QR Scanner', 'Defect & Breakdown Logging', 'Building Directory']
  },
  TECHNICIAN: {
    title: 'Maintenance Contractor',
    shortDesc: 'Work order execution, repair logging & AMC warranty coverage',
    color: 'amber',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    landingPath: '/',
    features: ['Work Orders', 'Parts & Cost Logging', 'Asset Technical Specs', 'Warranty & AMC Coverage']
  },
  ENGINEER: {
    title: 'Executive Engineer',
    shortDesc: 'System health, dependency networks, GIS and predictive risk',
    color: 'purple',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    landingPath: '/',
    features: ['Asset Health Analytics', 'GIS Infrastructure Map', 'Dependency Networks', 'Risk Scoring Engine', 'Failure Root Cause']
  },
  DEPT_ADMIN: {
    title: 'Superintending Engineer',
    shortDesc: 'Division oversight, asset registries, maintenance approval & risk control',
    color: 'indigo',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    landingPath: '/',
    features: ['Division Asset Oversight', 'Work Orders & Approvals', 'Risk Intelligence', 'GIS Infrastructure Map']
  },
  SUPER_ADMIN: {
    title: 'Chief Engineer (Super Admin)',
    shortDesc: 'Statewide command center, audit logs, system administration & scenarios',
    color: 'rose',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    landingPath: '/',
    features: ['Complete Statewide Command', 'System Audit Trails', 'User Management', 'IoT Telemetry Simulator', 'Demo Scenarios Hub']
  },
  VIEWER: {
    title: 'State Oversight Viewer',
    shortDesc: 'High-level executive monitoring & statewide infrastructure reports',
    color: 'slate',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    landingPath: '/',
    features: ['Executive Infrastructure Summary', 'GIS Map', 'Statewide Building Status']
  }
};

/**
 * Checks whether a given role is allowed to access a route path
 */
export const isRouteAllowed = (role: Role | undefined, path: string): boolean => {
  if (!role) return false;
  if (role === 'SUPER_ADMIN') return true;

  const routeRules: { prefix: string; roles: Role[] }[] = [
    { prefix: '/login', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'ENGINEER', 'INSPECTOR', 'TECHNICIAN', 'VIEWER', 'CITIZEN'] },
    { prefix: '/citizen-grievance', roles: ['CITIZEN', 'VIEWER', 'SUPER_ADMIN'] },
    { prefix: '/gis-map', roles: ['CITIZEN', 'VIEWER', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/buildings', roles: ['CITIZEN', 'VIEWER', 'INSPECTOR', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/assets', roles: ['INSPECTOR', 'TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/scan-qr', roles: ['INSPECTOR', 'TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/inspections', roles: ['INSPECTOR', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/maintenance', roles: ['TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/failures', roles: ['INSPECTOR', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/warranties', roles: ['TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/amc', roles: ['TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/dependencies', roles: ['ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/risk', roles: ['ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN'] },
    { prefix: '/reports', roles: ['ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN', 'VIEWER'] },
    { prefix: '/sensor-simulator', roles: ['SUPER_ADMIN'] },
    { prefix: '/vendors', roles: ['SUPER_ADMIN', 'DEPT_ADMIN'] },
    { prefix: '/users', roles: ['SUPER_ADMIN'] },
    { prefix: '/audit-logs', roles: ['SUPER_ADMIN'] },
    { prefix: '/demo-walkthrough', roles: ['SUPER_ADMIN', 'DEPT_ADMIN', 'ENGINEER'] }
  ];

  const matched = routeRules.find(r => path.startsWith(r.prefix));
  if (!matched) return true; // root dashboard '/' allowed for all
  return matched.roles.includes(role);
};
