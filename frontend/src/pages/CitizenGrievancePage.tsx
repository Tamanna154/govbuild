import React, { useState, useEffect } from 'react';
import {
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Grievance {
  id: string;
  referenceNumber: string;
  buildingName: string;
  district: string;
  category: string;
  description: string;
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const DEFAULT_FACILITIES = [
  { id: 'bld-gnd-001', name: 'Gujarat Swarnim Sankul 1 (Cabinet Secretariat)', district: 'Gandhinagar' },
  { id: 'bld-gnd-002', name: 'Gujarat Swarnim Sankul 2 (State Administrative Block)', district: 'Gandhinagar' },
  { id: 'bld-gnd-003', name: 'Dr. Jivraj Mehta Bhavan (Old Sachivalaya)', district: 'Gandhinagar' },
  { id: 'bld-ahm-001', name: 'New Civil Hospital & Asarwa Trauma Center', district: 'Ahmedabad' },
  { id: 'bld-ahm-002', name: 'Gujarat High Court Complex, Sola', district: 'Ahmedabad' },
  { id: 'bld-ahm-003', name: 'District Collectorate & Magistrate Office', district: 'Ahmedabad' },
  { id: 'bld-gnd-004', name: 'Gujarat State Data Center & Command Facility', district: 'Gandhinagar' },
  { id: 'bld-gnd-005', name: 'Government Engineering College (GEC) Complex', district: 'Gandhinagar' },
  { id: 'bld-ahm-004', name: 'Multi-Storey Civil Office Towers (Bahumali Bhavan)', district: 'Ahmedabad' }
];

export const CitizenGrievancePage: React.FC = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<any[]>(DEFAULT_FACILITIES);
  const [selectedBuildingId, setSelectedBuildingId] = useState(DEFAULT_FACILITIES[3].id);
  const [category, setCategory] = useState('Elevator / Lift Problem');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [grievances, setGrievances] = useState<Grievance[]>([
    {
      id: 'GRV-001',
      referenceNumber: 'GRV-2026-8819',
      buildingName: 'New Civil Hospital (Trauma Center), Ahmedabad',
      district: 'Ahmedabad',
      category: 'Elevator / Lift Problem',
      description: 'Patient stretcher lift #2 stuck between 3rd and 4th floors with intermittent display flickering.',
      status: 'IN_PROGRESS',
      createdAt: '2026-09-27T10:30:00Z',
      priority: 'HIGH'
    },
    {
      id: 'GRV-002',
      referenceNumber: 'GRV-2026-8824',
      buildingName: 'Dr. Jivraj Mehta Bhavan (Old Sachivalaya), Gandhinagar',
      district: 'Gandhinagar',
      category: 'Water Leakage / Plumbing',
      description: 'Overhead tank valve seepage causing moisture in east wing corridor ground floor.',
      status: 'RESOLVED',
      createdAt: '2026-09-25T14:15:00Z',
      priority: 'MEDIUM'
    },
    {
      id: 'GRV-003',
      referenceNumber: 'GRV-2026-8831',
      buildingName: 'Gujarat High Court Complex, Sola, Ahmedabad',
      district: 'Ahmedabad',
      category: 'Air Conditioning / HVAC',
      description: 'Courtroom #4 central chilled water unit blowing ambient warm air during afternoon session.',
      status: 'ASSIGNED',
      createdAt: '2026-09-28T09:00:00Z',
      priority: 'HIGH'
    }
  ]);

  useEffect(() => {
    api.get('/buildings')
      .then(res => {
        const bList = res.data?.buildings || res.data || [];
        if (Array.isArray(bList) && bList.length > 0) {
          setBuildings(bList);
          setSelectedBuildingId(bList[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    const chosenBuilding = buildings.find(b => b.id === selectedBuildingId) || DEFAULT_FACILITIES[0];
    const buildingName = chosenBuilding.name;
    const district = chosenBuilding.district;
    const refNo = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newGrievance: Grievance = {
      id: `GRV-${Date.now()}`,
      referenceNumber: refNo,
      buildingName,
      district,
      category,
      description,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      priority
    };

    setTimeout(() => {
      setGrievances([newGrievance, ...grievances]);
      setSubmittedMessage(`Grievance submitted successfully. Tracking Reference: ${refNo}`);
      setDescription('');
      setLoading(false);
    }, 400);
  };

  const getStatusBadge = (status: Grievance['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800">Submitted</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800">Assigned</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Resolved</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            <span>Public Civic Portal</span>
            <span>•</span>
            <span>R&B Department, Gujarat</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Citizen Grievance & Issue Reporting
          </h1>
          <p className="text-xs text-slate-500">Report public facility maintenance issues for rapid R&B resolution.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SLA Target: 24–48 Hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: Report Issue */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Lodge Facility Issue
          </h2>

          {submittedMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submittedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold block text-slate-700 mb-1">Select Public Facility *</label>
              <select
                required
                value={selectedBuildingId}
                onChange={e => setSelectedBuildingId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-xs text-slate-900 font-medium"
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-xs text-slate-900"
              >
                <option>Elevator / Lift Problem</option>
                <option>Water Leakage / Plumbing</option>
                <option>Air Conditioning / HVAC</option>
                <option>Electrical Sparks / Power Outage</option>
                <option>Structural Crack / Concrete Spalling</option>
                <option>Fire Safety / Extinguisher Missing</option>
                <option>Sanitation / Washroom Fixtures</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1">Urgency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 rounded-lg font-bold text-xs border transition ${
                      priority === p
                        ? p === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1">Specific Location & Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="E.g., Floor 3, East Wing corridor elevator is jammed and not responding to call button."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Submit Grievance Report'}
            </button>
          </form>
        </div>

        {/* List of Grievances */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Lodged Reports</h2>
              <p className="text-[11px] text-slate-500">Real-time status updates from R&B Field Engineers</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
              {grievances.length} Reports
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {grievances.map(g => (
              <div key={g.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-mono font-bold text-slate-800 text-xs">{g.referenceNumber}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{g.buildingName}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{g.district}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{g.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(g.status)}
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 text-xs leading-relaxed">
                  {g.description}
                </p>

                <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Priority: <strong className={g.priority === 'HIGH' ? 'text-rose-600' : 'text-slate-700'}>{g.priority}</strong>
                  </span>
                  <span className="text-emerald-700 font-medium">Tracking via R&B Maintenance Network</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
