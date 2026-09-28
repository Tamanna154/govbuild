import React, { useEffect, useState } from 'react';
import { Building2, Search, Filter, Plus, MapPin, Layers, ChevronRight } from 'lucide-react';
import { Building } from '../types';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { HealthBar } from '../components/common/HealthBar';

export const BuildingsPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Government Office',
    district: 'Ahmedabad',
    taluka: 'Ahmedabad City',
    address: '',
    latitude: '23.0225',
    longitude: '72.5714',
    builtUpArea: '25000',
    totalFloors: '4',
    contractor: 'L&T Infrastructure',
    description: ''
  });

  const fetchBuildings = () => {
    setLoading(true);
    api.get('/buildings', { params: { search, district: districtFilter, type: typeFilter } })
      .then(res => setBuildings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBuildings();
  }, [search, districtFilter, typeFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    api.post('/buildings', {
      ...formData,
      departmentId: 'DEPT-RNB'
    }).then(() => {
      setShowAddModal(false);
      fetchBuildings();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gov-700" />
            Government Building Registry
          </h2>
          <p className="text-xs text-slate-500">Official registry of government offices, Secretariat, hospitals, and civil structures.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          Register New Building
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by building name, ID, district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-gov-500 outline-none"
          />
        </div>
        <select
          value={districtFilter}
          onChange={e => setDistrictFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
        >
          <option value="">All Districts</option>
          <option value="Gandhinagar">Gandhinagar</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Vadodara">Vadodara</option>
          <option value="Surat">Surat</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
        >
          <option value="">All Building Types</option>
          <option value="Government Office">Government Office</option>
          <option value="Collector Office">Collector Office</option>
          <option value="Government Hospital">Government Hospital</option>
          <option value="Court Building">Court Building</option>
          <option value="Training Centre">Training Centre</option>
        </select>
      </div>

      {/* Building Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading Building Registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buildings.map(b => (
            <div
              key={b.id}
              onClick={() => navigate(`/buildings/${b.id}`)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[11px] font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                    {b.buildingId}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {b.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-gov-700 transition leading-snug">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {b.district}, {b.taluka}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <HealthBar score={b.currentHealthScore} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>{b._count?.assets || 5} Registered Assets</span>
                <span className="text-gov-700 font-semibold flex items-center gap-0.5">
                  View Details <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Building Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Register New Government Building</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Building Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. New Collectorate Annexe"
                  className="w-full p-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Building Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none"
                  >
                    <option value="Government Office">Government Office</option>
                    <option value="Collector Office">Collector Office</option>
                    <option value="Government Hospital">Government Hospital</option>
                    <option value="Court Building">Court Building</option>
                    <option value="Training Centre">Training Centre</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">District</label>
                  <input
                    required
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded outline-none h-16"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gov-700 text-white rounded font-bold">
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
