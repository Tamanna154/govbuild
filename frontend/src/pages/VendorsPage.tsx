import React, { useEffect, useState } from 'react';
import { Truck, Star } from 'lucide-react';
import api from '../api/client';

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendors')
      .then(res => setVendors(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-gov-700" />
          Approved Vendors & OEM Suppliers Registry
        </h2>
        <p className="text-xs text-slate-500">Directory of OEMs, suppliers, maintenance contractors, and SLA performance scores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map(v => (
          <div key={v.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">{v.vendorId}</span>
                <h3 className="font-bold text-base text-slate-900 mt-1">{v.companyName}</h3>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded text-amber-800 font-bold border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{v.performanceScore}/100</span>
              </div>
            </div>

            <div className="space-y-1 text-slate-600">
              <p><strong>Contact Person:</strong> {v.contactPerson} ({v.phone})</p>
              <p><strong>Email:</strong> {v.email}</p>
              <p><strong>Service Domain:</strong> {v.serviceTypes}</p>
              <p><strong>Address:</strong> {v.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
