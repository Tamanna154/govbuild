import React, { useState } from 'react';
import { QrCode, Search, Cpu, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ScanQrPage: React.FC = () => {
  const [assetIdInput, setAssetIdInput] = useState('');
  const navigate = useNavigate();

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetIdInput.trim()) {
      navigate(`/assets/${assetIdInput.trim()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6 text-center">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
        <div className="w-16 h-16 bg-gov-50 text-gov-700 rounded-2xl flex items-center justify-center mx-auto border border-gov-200">
          <QrCode className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">QR Asset Identification</h2>
          <p className="text-xs text-slate-500 mt-1">Scan or enter QR Asset Tag ID for mobile field inspection.</p>
        </div>

        <form onSubmit={handleLookup} className="space-y-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Enter Asset ID (e.g. GEN-AHM-001)..."
              value={assetIdInput}
              onChange={e => setAssetIdInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-gov-500 outline-none text-center"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
          >
            Lookup Asset <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-2">
          <span className="font-semibold text-slate-400 uppercase text-[10px]">Quick Demo Scans:</span>
          <div className="flex flex-wrap gap-2">
            {['GEN-AHM-001', 'ATS-AHM-001', 'LFT-AHM-001', 'PMP-AHM-001'].map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/assets/${tag}`)}
                className="px-2.5 py-1 bg-gov-50 hover:bg-gov-100 text-gov-800 font-mono font-bold rounded border border-gov-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
