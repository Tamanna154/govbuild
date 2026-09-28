import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Building2,
  HardHat,
  Wrench,
  Search,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Role } from '../types';

interface PersonaCard {
  role: Role;
  title: string;
  name: string;
  designation: string;
  department: string;
  tagline: string;
  color: string;
  borderColor: string;
  bgLight: string;
  icon: React.ReactNode;
  highlights: string[];
}

export const LoginPage: React.FC = () => {
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role>('ENGINEER');
  const [useManualCredentials, setUseManualCredentials] = useState(false);
  const [email, setEmail] = useState('engineer@rnb.gujarat.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personas: PersonaCard[] = [
    {
      role: 'CITIZEN',
      title: 'Citizen / Civil Resident',
      name: 'Aarav Mehta',
      designation: 'Citizen User',
      department: 'Public Citizen Portal',
      tagline: 'Public Facilities & Civic Issue Reporting',
      color: 'emerald',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500',
      bgLight: 'from-emerald-500/10 to-transparent',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      highlights: ['Public Infrastructure GIS Map', 'Building Health & Safety', 'Report Civic Grievance / Defect']
    },
    {
      role: 'INSPECTOR',
      title: 'Field Safety Inspector',
      name: 'Dipak Parmar',
      designation: 'Senior Quality Inspector',
      department: 'Quality & Safety Audit Wing',
      tagline: 'On-site Audits & QR Inspection',
      color: 'sky',
      borderColor: 'border-sky-500/30 hover:border-sky-500',
      bgLight: 'from-sky-500/10 to-transparent',
      icon: <Search className="w-5 h-5 text-sky-400" />,
      highlights: ['Conduct Field Inspections', 'Mobile Asset QR Scanner', 'Defect & Breakdown Logging']
    },
    {
      role: 'TECHNICIAN',
      title: 'Maintenance Contractor',
      name: 'Mahesh Solanki',
      designation: 'Lead Maintenance Contractor',
      department: 'Electrical & Mechanical Maintenance',
      tagline: 'Work Orders & Field Repairs',
      color: 'amber',
      borderColor: 'border-amber-500/30 hover:border-amber-500',
      bgLight: 'from-amber-500/10 to-transparent',
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
      highlights: ['Assigned Work Order Tickets', 'Parts Replaced & Cost Log', 'AMC & Warranty SLA Coverage']
    },
    {
      role: 'ENGINEER',
      title: 'Executive Engineer',
      name: 'Er. Vikram Shah',
      designation: 'Executive Engineer (Mechanical & Civil)',
      department: 'Roads & Buildings Department',
      tagline: 'Asset Health, Dependency & Risk Control',
      color: 'violet',
      borderColor: 'border-violet-500/30 hover:border-violet-500',
      bgLight: 'from-violet-500/10 to-transparent',
      icon: <HardHat className="w-5 h-5 text-violet-400" />,
      highlights: ['Statewide Asset Registry', 'GIS Infrastructure Layer', 'Dependency Network & Risk Engine']
    },
    {
      role: 'SUPER_ADMIN',
      title: 'Chief Engineer (Super Admin)',
      name: 'Shri Rajesh Patel',
      designation: 'Chief Engineer & Technical Secretary',
      department: 'Roads & Buildings Department, Gujarat',
      tagline: 'Statewide Command & Administration',
      color: 'rose',
      borderColor: 'border-rose-500/30 hover:border-rose-500',
      bgLight: 'from-rose-500/10 to-transparent',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      highlights: ['Executive Command Dashboard', 'System Audit Trails & Users', 'Interactive Demo Scenarios']
    }
  ];

  const handleSelectRole = (r: Role) => {
    setSelectedRole(r);
    const p = DEMO_PERSONAS[r];
    if (p) {
      setEmail(p.email);
      setPassword('admin123');
    }
  };

  const handleQuickLogin = (roleToLogin: Role) => {
    setLoading(true);
    setError(null);
    try {
      loginAsRole(roleToLogin);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const currentPersona = personas.find(p => p.role === selectedRole) || personas[3];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Bar with official credentials */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
            GJ
          </div>
          <div>
            <div className="font-semibold text-slate-200">Government of Gujarat</div>
            <div className="text-[11px] text-slate-400">Roads & Buildings (R&B) Department</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Portal Online • Gandhinagar Secure Gateway
          </span>
          <span className="text-slate-600">|</span>
          <span>ISO 55000 Asset Standard</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        {/* Title area */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Based Public Infrastructure Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            GovBuild<span className="text-amber-400">360</span>
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to access your role-specific dashboard, tools, and operational authorizations.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center">
            {error}
          </div>
        )}

        {/* Authentication Options Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Role Selector Grid (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Role Persona
                </span>
                <span className="text-[11px] text-slate-500">
                  Role-specific access control active
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {personas.map(p => {
                  const isSelected = selectedRole === p.role;
                  return (
                    <div
                      key={p.role}
                      onClick={() => handleSelectRole(p.role)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg bg-slate-900 border ${isSelected ? 'border-amber-400/40' : 'border-slate-800'}`}>
                          {p.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{p.title}</span>
                            {isSelected && (
                              <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                                Active Selection
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {p.name} • <span className="text-slate-500">{p.designation}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(p.role);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          isSelected
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Enter
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Each role only sees its permitted features & views.</span>
              <button
                type="button"
                onClick={() => setUseManualCredentials(!useManualCredentials)}
                className="text-amber-400 hover:text-amber-300 font-medium underline-offset-2 hover:underline"
              >
                {useManualCredentials ? 'Hide Custom Credentials' : 'Login with Custom Credentials'}
              </button>
            </div>
          </div>

          {/* Right Column: Selected Role Preview & Direct Action (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            {!useManualCredentials ? (
              <div className="space-y-6">
                <div>
                  <div className="inline-block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Role Summary & Scope
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {currentPersona.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentPersona.tagline}
                  </p>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Authorized User:</span>
                    <span className="font-semibold text-slate-200">{currentPersona.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Designation:</span>
                    <span className="text-slate-300">{currentPersona.designation}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-300">{currentPersona.department}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Permitted Features for this role:
                  </span>
                  <div className="space-y-1.5">
                    {currentPersona.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(selectedRole)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  {loading ? 'Entering Portal...' : `Sign In as ${currentPersona.title}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Official Credentials Sign In</h3>
                  <p className="text-xs text-slate-400">Enter your designated government email address</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Government Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Default prototype password: admin123</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  {loading ? 'Authenticating...' : 'Sign In with Password'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setUseManualCredentials(false)}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel and use Quick Role Sign In
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              Gujarat State Infrastructure Command • Roads & Buildings Dept
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 px-6 py-3 text-center text-xs text-slate-500">
        Roads & Buildings Department, Block 14, New Sachivalaya, Gandhinagar - 382010 • GovBuild360 v1.0
      </footer>
    </div>
  );
};
