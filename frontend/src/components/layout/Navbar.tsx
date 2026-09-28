import React, { useState, useEffect } from 'react';
import { Bell, Shield, User as UserIcon, AlertTriangle, Check, Layers, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role, Alert } from '../../types';
import api from '../../api/client';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
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

  const rolesList: Role[] = ['SUPER_ADMIN', 'DEPT_ADMIN', 'ENGINEER', 'INSPECTOR', 'TECHNICIAN', 'VIEWER'];

  return (
    <header className="bg-gov-900 text-white sticky top-0 z-40 shadow-md">
      {/* Top Banner Notice - Mandatory Prompt Label */}
      <div className="bg-gov-950 text-amber-300 text-xs px-4 py-1 flex justify-between items-center border-b border-gov-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
            GovBuild360 — Prototype / Demonstration System
          </span>
          <span className="hidden md:inline text-slate-300">
            Gujarat Roads & Buildings (R&B) Department Infrastructure Management Digital Platform
          </span>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          System Time: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-gov-500 flex items-center justify-center shadow-inner font-black text-white text-lg">
            GB
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              GovBuild360
              <span className="text-[10px] bg-gov-700 text-gov-100 font-mono px-1.5 py-0.5 rounded border border-gov-600">v1.0</span>
            </h1>
            <p className="text-xs text-gov-200">Asset Lifecycle & Risk Maintenance</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 rounded-lg bg-gov-800 hover:bg-gov-700 text-slate-200 transition"
              title="System Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gov-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Alert Center ({unreadCount} Unread)
                  </h3>
                  <button onClick={() => api.post('/alerts/read-all').then(() => fetchAlerts())} className="text-xs text-gov-600 hover:underline">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No active alerts</div>
                  ) : (
                    alerts.map(a => (
                      <div key={a.id} className={`p-3 text-xs hover:bg-slate-50 flex items-start gap-2 ${!a.isRead ? 'bg-amber-50/50' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.priority === 'RED' ? 'bg-rose-500' : a.priority === 'ORANGE' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{a.title}</p>
                          <p className="text-slate-600 mt-0.5 leading-snug">{a.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{new Date(a.createdAt).toLocaleTimeString()}</span>
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

          {/* Role Switcher Demo Control */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gov-800 hover:bg-gov-700 rounded-lg text-xs font-medium text-slate-200 border border-gov-700 transition"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-amber-300">{user?.role}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Demo Persona Role
                </div>
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => { switchRole(r); setShowRoleMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-100 ${user?.role === r ? 'font-bold bg-gov-50 text-gov-800' : 'text-slate-700'}`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <Check className="w-3.5 h-3.5 text-gov-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 border-l border-gov-800 pl-4">
            <div className="w-8 h-8 rounded-full bg-gov-700 text-amber-300 font-bold flex items-center justify-center text-sm border border-gov-600">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-bold text-white">{user?.name}</div>
              <div className="text-[11px] text-gov-300">{user?.designation || 'Officer'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
