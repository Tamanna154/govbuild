import React, { useEffect, useState } from 'react';
import { Activity, Shield } from 'lucide-react';
import api from '../api/client';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs')
      .then(res => setLogs(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-gov-700" />
          System Audit Trail & Security Logs
        </h2>
        <p className="text-xs text-slate-500">Immutable audit log recording user actions, entity updates, timestamps, and IP addresses.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Entity ID</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-slate-500">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-900">{l.userName || 'System'}</td>
                  <td className="p-3 font-mono font-bold text-gov-800">{l.action}</td>
                  <td className="p-3">{l.entity}</td>
                  <td className="p-3 font-mono text-slate-600">{l.entityId || 'N/A'}</td>
                  <td className="p-3 font-mono text-slate-400">{l.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
