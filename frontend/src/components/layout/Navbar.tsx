import React, { useState, useEffect } from 'react';
import { Bell, Shield, AlertTriangle, Check, ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role, Alert } from '../../types';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const fetchAlerts = () => {
    api.get('/alerts')
      .then(res => {
        setAlerts(res.data.alerts || []);
        setUnreadCount(res.data.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = (id: string) => {
    api.put(`/alerts/${id}/read`).then(() => fetchAlerts());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rolesList: { role: Role; label: string; tag: string }[] = [
    { role: 'CITIZEN', label: 'Citizen / Civil Resident', tag: 'Public View' },
    { role: 'INSPECTOR', label: 'Field Safety Inspector', tag: 'Audit & QR' },
    { role: 'TECHNICIAN', label: 'Maintenance Contractor', tag: 'Work Orders' },
    { role: 'ENGINEER', label: 'Executive Engineer', tag: 'Assets & Risk' },
    { role: 'SUPER_ADMIN', label: 'Chief Engineer (Admin)', tag: 'Full Access' }
  ];

  const getRoleColor = (r?: Role) => {
    switch (r) {
      case 'CITIZEN': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'INSPECTOR': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'TECHNICIAN': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'ENGINEER':
      case 'DEPT_ADMIN': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'SUPER_ADMIN':
      default: return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      {/* Top Banner Notice - Clean, crisp government tag */}
      <div className="bg-slate-950 text-slate-400 text-[11px] px-4 py-1 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
            GovBuild360
          </span>
          <span className="hidden md:inline text-slate-300">
            Roads & Buildings Department • Government of Gujarat
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden sm:inline">Role-Based Access Control Active</span>
          <span className="text-slate-600">•</span>
          <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
            GB
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight text-white flex items-center gap-1.5">
              GovBuild360
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded border border-slate-700">v1.0</span>
            </h1>
            <p className="text-[11px] text-slate-400">Public Asset Lifecycle Platform</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Notifications Center (only for internal staff, not citizen) */}
          {user?.role !== 'CITIZEN' && (
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="System Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showAlerts && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Alert Center ({unreadCount} Unread)
                    </h3>
                    <button onClick={() => api.post('/alerts/read-all').then(() => fetchAlerts())} className="text-[11px] text-slate-600 hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No active alerts</div>
                    ) : (
                      alerts.map(a => (
                        <div key={a.id} className={`p-3 text-xs hover:bg-slate-50 flex items-start gap-2 ${!a.isRead ? 'bg-amber-50/50' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.priority === 'RED' ? 'bg-rose-500' : a.priority === 'ORANGE' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-xs">{a.title}</p>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{a.message}</p>
                          </div>
                          {!a.isRead && (
                            <button onClick={() => handleMarkRead(a.id)} className="text-slate-400 hover:text-slate-700">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Role Switcher (Persona Switcher for Demo) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${getRoleColor(user?.role)}`}
              title="Switch Role Persona"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{user?.role?.replace('_', ' ') || 'ROLE'}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Active Role Persona
                </div>
                {rolesList.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleMenu(false);
                      navigate('/');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      user?.role === r.role ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-[10px] text-slate-500">{r.tag}</div>
                    </div>
                    {user?.role === r.role && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs border border-slate-700">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-white leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-400">{user?.designation || 'Officer'}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log Out to Login Screen"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 transition flex items-center gap-1 text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
