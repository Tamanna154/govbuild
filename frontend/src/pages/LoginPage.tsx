import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@rnb.gujarat.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (eEmail: string) => {
    setEmail(eEmail);
    setPassword('admin123');
    login(eEmail, 'admin123').then(() => navigate('/'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gov-950 via-gov-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gov-900 text-white p-6 text-center space-y-2 border-b border-gov-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-gov-500 flex items-center justify-center mx-auto shadow-inner font-black text-white text-xl">
            GB
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GovBuild360</h1>
          <p className="text-xs text-gov-200">Government Building Asset Lifecycle, Dependency & Risk-Based Maintenance Management System</p>
          <span className="inline-block text-[10px] font-semibold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 mt-1">
            "GovBuild360 — Prototype / Demonstration System"
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold block text-slate-700 mb-1">Government Official Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-gov-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block text-slate-700 mb-1">Secure Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-gov-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            {loading ? 'Authenticating Official...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Fill Demo Roles */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Sign-In Demo Personas:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickLogin('admin@rnb.gujarat.gov.in')}
                className="p-2 bg-gov-50 hover:bg-gov-100 text-gov-900 font-bold rounded-lg border border-gov-200 text-left"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('engineer@rnb.gujarat.gov.in')}
                className="p-2 bg-gov-50 hover:bg-gov-100 text-gov-900 font-bold rounded-lg border border-gov-200 text-left"
              >
                Chief Engineer
              </button>
              <button
                type="button"
                onClick={() => quickLogin('inspector@rnb.gujarat.gov.in')}
                className="p-2 bg-gov-50 hover:bg-gov-100 text-gov-900 font-bold rounded-lg border border-gov-200 text-left"
              >
                Inspector
              </button>
              <button
                type="button"
                onClick={() => quickLogin('technician@rnb.gujarat.gov.in')}
                className="p-2 bg-gov-50 hover:bg-gov-100 text-gov-900 font-bold rounded-lg border border-gov-200 text-left"
              >
                Technician
              </button>
            </div>
          </div>
        </form>

        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Roads & Buildings Department, Government of Gujarat
        </div>
      </div>
    </div>
  );
};
