import React, { useState } from 'react';
import { FileText, Download, Printer, ShieldAlert, Wrench, Building2 } from 'lucide-react';
import api from '../api/client';

export const ReportsPage: React.FC = () => {
  const [exporting, setExporting] = useState(false);

  const handleDownloadCsv = (endpoint: string, filename: string) => {
    setExporting(true);
    api.get(`/reports/${endpoint}`)
      .then(res => {
        const data = res.data.tickets || res.data;
        if (!Array.isArray(data)) return;
        const keys = Object.keys(data[0] || {});
        const csvRows = [
          keys.join(','),
          ...data.map(row => keys.map(k => JSON.stringify(row[k] || '')).join(','))
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      })
      .catch(err => console.error(err))
      .finally(() => setExporting(false));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-gov-700" />
          Government Infrastructure Reports & Export Center
        </h2>
        <p className="text-xs text-slate-500">Generate and export downloadable CSV/Excel audit reports for Roads & Buildings Department authorities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="p-3 bg-gov-50 text-gov-700 rounded-lg w-fit">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Master Building Asset Register Report</h3>
          <p className="text-xs text-slate-500">Complete inventory list of all registered government buildings, assets, purchase specs, and warranties.</p>
          <button
            onClick={() => handleDownloadCsv('asset-register', 'GovBuild360_Asset_Register')}
            className="w-full py-2 bg-gov-700 hover:bg-gov-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg w-fit">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Risk & Reliability Analysis Report</h3>
          <p className="text-xs text-slate-500">List of high-risk and critical infrastructure assets with explainable risk scores and deterioration trends.</p>
          <button
            onClick={() => handleDownloadCsv('risk-report', 'GovBuild360_Risk_Report')}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg w-fit">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Maintenance & Repair Cost Audit Report</h3>
          <p className="text-xs text-slate-500">Complete record of work orders, parts replaced, labor cost, material cost, and post-repair health recovery.</p>
          <button
            onClick={() => handleDownloadCsv('maintenance-cost', 'GovBuild360_Maintenance_Cost')}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};
