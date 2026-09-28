import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitFork,
  ShieldAlert,
  Zap,
  AlertTriangle,
  PlayCircle,
  Building2,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  Filter
} from 'lucide-react';
import api from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';

export const DependencyGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dependenciesList, setDependenciesList] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedEdgeData, setSelectedEdgeData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'directory'>('map');

  const fetchGraph = (bId?: string) => {
    setLoading(true);
    const params = bId ? { buildingId: bId } : {};
    api.get('/dependencies/graph', { params })
      .then(res => {
        setNodes(res.data.nodes || []);
        // Format edges with clean styling and markers
        const formattedEdges = (res.data.edges || []).map((e: any) => ({
          ...e,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: e.style?.stroke || '#2563eb'
          },
          labelStyle: {
            fill: '#1e293b',
            fontWeight: 600,
            fontSize: 11,
            backgroundColor: '#ffffff'
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.95,
            stroke: '#cbd5e1',
            strokeWidth: 1,
            rx: 4,
            ry: 4
          }
        }));
        setEdges(formattedEdges);
        setDependenciesList(res.data.dependenciesList || []);
      })
      .catch(err => console.error('Failed to load dependency graph:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/buildings')
      .then(res => setBuildings(res.data || []))
      .catch(() => {});
    fetchGraph();
  }, []);

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedBuildingId(val);
    setSelectedAsset(null);
    setSelectedEdgeData(null);
    setImpactData(null);
    fetchGraph(val || undefined);
  };

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedEdgeData(null);
    setSelectedAsset(node.data);
    api.get(`/dependencies/impact-analysis/${node.id}`)
      .then(res => setImpactData(res.data))
      .catch(err => console.error('Error fetching impact analysis:', err));
  };

  const handleEdgeClick = (_: any, edge: Edge) => {
    setSelectedEdgeData(edge.data || { label: edge.label });
  };

  const handleSimulateFailGenerator = () => {
    api.post('/scenarios/demo-2/fail-generator')
      .then(res => {
        setImpactData(res.data.impactResult);
        setSelectedAsset({
          label: 'Main Emergency Diesel Generator 750 kVA',
          assetId: 'GEN-AHM-001',
          building: 'Gujarat Swarnim Sankul 1',
          health: 42,
          risk: 82,
          category: 'Electrical & Power'
        });
        fetchGraph(selectedBuildingId || undefined);
      })
      .catch(err => console.error('Error simulating failure:', err));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Critical Infrastructure Cascade Engine</span>
            <span>•</span>
            <span>R&B Department, Gujarat</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-slate-700" />
            Infrastructure Asset Dependency Network & Cascading Risk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear visual topology of electrical, HVAC, backup power, and life-safety systems with named dependency links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Building Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedBuildingId}
              onChange={handleBuildingChange}
              className="bg-transparent text-xs text-slate-800 font-medium outline-none cursor-pointer"
            >
              <option value="">All Gujarat Facilities</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.district})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSimulateFailGenerator}
            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-md text-xs flex items-center gap-2 shadow-sm transition"
          >
            <PlayCircle className="w-4 h-4" />
            Simulate Generator Failure (Demo)
          </button>
        </div>
      </div>

      {/* View Switcher: Graph Canvas vs Tabular Directory */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('map')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 -mb-[2px] ${
            activeTab === 'map'
              ? 'border-slate-800 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitFork className="w-4 h-4" />
          Interactive Topological Network Map
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 -mb-[2px] ${
            activeTab === 'directory'
              ? 'border-slate-800 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Named Dependency Directory ({dependenciesList.length} Links)
        </button>
      </div>

      {activeTab === 'map' ? (
        /* Main Diagram & Impact Analysis Split View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* React Flow Canvas */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <span>Tier 1: Primary Power/Sources</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>Tier 2: Distribution Panels</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>Tier 3: Mission-Critical Services</span>
              </span>
              <span className="text-slate-500 text-[11px]">Click nodes or links to inspect</span>
            </div>

            <div className="flex-1 relative">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading Structured Infrastructure Network...
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                  fitView
                >
                  <Background color="#cbd5e1" gap={16} />
                  <Controls />
                  <MiniMap nodeStrokeWidth={3} />
                </ReactFlow>
              )}
            </div>
          </div>

          {/* Side Inspector Panel */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 flex flex-col h-[600px] overflow-y-auto">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              Dependency & Impact Analysis Inspector
            </h3>

            {/* Edge details when a link is clicked */}
            {selectedEdgeData && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-md space-y-2 text-xs text-blue-950">
                <div className="font-bold text-xs flex items-center justify-between text-blue-900 border-b border-blue-200 pb-1.5">
                  <span>Selected Dependency Connection</span>
                  <span className="font-mono text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">
                    {selectedEdgeData.criticality || 'HIGH'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 block font-semibold">Dependency Name:</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {selectedEdgeData.dependencyName || selectedEdgeData.description || 'Power Supply Connection'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">From (Source):</span>
                    <span className="font-semibold text-slate-800">{selectedEdgeData.sourceAssetName || 'Primary Supply'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">To (Dependent):</span>
                    <span className="font-semibold text-slate-800">{selectedEdgeData.dependentAssetName || 'Downstream Load'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Node details when an asset is clicked */}
            {selectedAsset ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedAsset.assetId}
                    </span>
                    <span className="text-[10px] text-slate-500">{selectedAsset.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedAsset.label || selectedAsset.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedAsset.building}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span>Health Score: <strong>{selectedAsset.health}%</strong></span>
                    <span>Risk Score: <strong>{selectedAsset.risk}/100</strong></span>
                  </div>
                </div>

                {impactData ? (
                  <div className="space-y-3">
                    {impactData.hasCriticalImpact && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-950 font-medium">
                        <div className="font-bold text-xs flex items-center gap-1.5 text-rose-700">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>HIGH CASCADE IMPACT DETECTED</span>
                        </div>
                        <p className="mt-1 leading-relaxed text-[11px] text-rose-900">{impactData.impactSummary}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Downstream Assets</span>
                        <span className="font-bold text-base text-slate-900">{impactData.totalAffectedAssets}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Affected Systems</span>
                        <span className="font-bold text-base text-slate-900">{impactData.totalAffectedSystems}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-slate-800 mb-1.5 text-xs">
                        Downstream Impacted Assets ({impactData.affectedNodes?.length || 0})
                      </h5>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {impactData.affectedNodes?.map((n: any) => (
                          <div
                            key={n.id}
                            className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between items-center"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 block truncate">{n.name}</span>
                              <div className="text-[10px] text-slate-500">
                                {n.relationshipType} Feed • {n.buildingName}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                n.criticality === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {n.criticality}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 py-6 text-center text-xs">Computing failure propagation...</div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs my-auto">
                <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-600">Select Any Asset Node or Connection</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click on an asset to view its upstream/downstream cascading failure dependencies.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tabular Directory View showing full Dependency Names */
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                Official Infrastructure Dependency Links Directory
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Full list of mapped functional, electrical, hydraulic, and environmental dependencies across government buildings.
              </p>
            </div>
            <span className="text-xs text-slate-600 font-mono font-semibold">
              {dependenciesList.length} Registered Links
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Dependency Name / Purpose</th>
                  <th className="p-3">Source Asset (Provider)</th>
                  <th className="p-3">Relationship Type</th>
                  <th className="p-3">Dependent Asset (Consumer)</th>
                  <th className="p-3">Criticality</th>
                  <th className="p-3">Location / Facility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dependenciesList.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-900">
                      {dep.dependencyName}
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mr-1.5">
                        {dep.sourceAssetId}
                      </span>
                      <span>{dep.sourceAssetName}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">
                        {dep.relationshipType}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mr-1.5">
                        {dep.targetAssetId}
                      </span>
                      <span>{dep.targetAssetName}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dep.criticality === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : dep.criticality === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {dep.criticality}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {dep.sourceBuilding || 'Gujarat Swarnim Sankul'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
