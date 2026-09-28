import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  Shield,
  Loader2
} from 'lucide-react';
import { Building, Department } from '../types';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { HealthBar } from '../components/common/HealthBar';
import { getBuildingImage } from '../utils/buildingImages';

export const BuildingsPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const initialFormData = {
    name: '',
    type: 'Government Office',
    departmentId: '',
    district: 'Gandhinagar',
    taluka: 'Gandhinagar',
    address: '',
    latitude: '23.2156',
    longitude: '72.6369',
    builtUpArea: '28000',
    totalFloors: '5',
    contractor: 'Gujarat State Construction Corporation Ltd',
    description: '',
    imageUrl: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchBuildings = () => {
    setLoading(true);
    api.get('/buildings', { params: { search, district: districtFilter, type: typeFilter } })
      .then(res => setBuildings(res.data))
      .catch(err => {
        console.error('Error fetching buildings:', err);
      })
      .finally(() => setLoading(false));
  };

  const fetchDepartments = () => {
    api.get('/buildings/departments')
      .then(res => {
        setDepartments(res.data || []);
        if (res.data?.length > 0 && !formData.departmentId) {
          setFormData(prev => ({ ...prev, departmentId: res.data[0].id }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBuildings();
  }, [search, districtFilter, typeFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Please enter the official building name.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/buildings', {
        ...formData,
        builtUpArea: parseFloat(formData.builtUpArea) || 25000,
        totalFloors: parseInt(formData.totalFloors) || 4,
        latitude: parseFloat(formData.latitude) || 23.2156,
        longitude: parseFloat(formData.longitude) || 72.6369
      });

      setSuccessMessage(`Building "${formData.name}" has been registered successfully.`);
      setShowAddModal(false);
      setFormData(initialFormData);
      fetchBuildings();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error('Failed to create building:', err);
      setErrorMessage(
        err.response?.data?.error || 'Failed to register building. Please check the provided information.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Roads & Buildings Department</span>
            <span>•</span>
            <span>Government of Gujarat</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            Public Infrastructure Building Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official repository of Secretariats, District Collectorates, Civil Hospitals, and Judicial Complexes.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMessage(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Building
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by building name, ID, or district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 outline-none"
          />
        </div>
        <select
          value={districtFilter}
          onChange={e => setDistrictFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-700 outline-none"
        >
          <option value="">All Districts</option>
          <option value="Gandhinagar">Gandhinagar</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Vadodara">Vadodara</option>
          <option value="Surat">Surat</option>
          <option value="Rajkot">Rajkot</option>
          <option value="Bhavnagar">Bhavnagar</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-700 outline-none"
        >
          <option value="">All Facility Types</option>
          <option value="Government Office">Government Office / Secretariat</option>
          <option value="Collector Office">District Collectorate</option>
          <option value="Government Hospital">Government Civil Hospital</option>
          <option value="Court Building">High Court & District Court</option>
          <option value="Training Centre">Training Centre & Polytechnic</option>
        </select>
      </div>

      {/* Building Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          Loading Official Building Registry...
        </div>
      ) : buildings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-500 text-xs">
          No government buildings found matching the current search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buildings.map(b => (
            <div
              key={b.id}
              onClick={() => navigate(`/buildings/${b.id}`)}
              className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition cursor-pointer overflow-hidden flex flex-col justify-between group"
            >
              {/* Photo Thumbnail */}
              <div className="relative h-40 bg-slate-100 overflow-hidden border-b border-slate-100">
                <img
                  src={getBuildingImage(b)}
                  alt={b.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
                  {b.buildingId}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                  {b.type}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-900 transition leading-snug">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {b.district}, {b.taluka}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-500 font-medium">Health Condition</span>
                    <span className="font-semibold text-slate-800">{Math.round(b.currentHealthScore)}%</span>
                  </div>
                  <HealthBar score={b.currentHealthScore} showText={false} />
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600">
                <span className="font-medium">{b._count?.assets || 5} Tracked Assets</span>
                <span className="text-slate-800 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Profile <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Building Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-700" />
                  Register Public Government Building
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter official Gujarat civil structure details into the statewide infrastructure registry.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs text-slate-700">
              {/* Building Name */}
              <div>
                <label className="font-semibold block text-slate-800 mb-1">
                  Official Building Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Swarnim Sankul-3 State Secretariat Annex"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                />
              </div>

              {/* Department & Facility Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">
                    Governing Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none bg-white"
                  >
                    {departments.length > 0 ? (
                      departments.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))
                    ) : (
                      <option value="DEPT-RNB">Roads & Buildings Department (R&B)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">
                    Building Category / Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none bg-white"
                  >
                    <option value="Government Office">Government Office / Secretariat</option>
                    <option value="Collector Office">District Collectorate</option>
                    <option value="Government Hospital">Government Civil Hospital</option>
                    <option value="Court Building">High Court & District Court</option>
                    <option value="Training Centre">Training Centre & Polytechnic</option>
                  </select>
                </div>
              </div>

              {/* District & Taluka */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        district: e.target.value,
                        taluka: formData.taluka || e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none bg-white"
                  >
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Surat">Surat</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Bhavnagar">Bhavnagar</option>
                    <option value="Jamnagar">Jamnagar</option>
                    <option value="Junagadh">Junagadh</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">Taluka / Sub-district</label>
                  <input
                    type="text"
                    value={formData.taluka}
                    onChange={e => setFormData({ ...formData, taluka: e.target.value })}
                    placeholder="e.g. Gandhinagar City"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="font-semibold block text-slate-800 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Sector 10, Near Mahatma Mandir, Gandhinagar - 382010"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                />
              </div>

              {/* Built-up area, Floors, Contractor */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">Built-up Area (sq.m)</label>
                  <input
                    type="number"
                    value={formData.builtUpArea}
                    onChange={e => setFormData({ ...formData, builtUpArea: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">Total Floors</label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={e => setFormData({ ...formData, totalFloors: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">Primary Contractor</label>
                  <input
                    type="text"
                    value={formData.contractor}
                    onChange={e => setFormData({ ...formData, contractor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Coordinates (GIS) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="23.2156"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-800 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="72.6369"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:border-slate-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 font-medium transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? 'Registering...' : 'Save & Register Building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
