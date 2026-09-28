import React, { useEffect, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GitFork, ShieldAlert, Zap, AlertTriangle, PlayCircle } from 'lucide-react';
import api from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';

export const DependencyGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  useEffect(() => {
    api.get('/dependencies/graph')
      .then(res => {
        setNodes(res.data.nodes || []);
        setEdges(res.data.edges || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedAsset(node.data);
    api.get(`/dependencies/impact-analysis/${node.id}`)
      .then(res => setImpactData(res.data))
      .catch(err => console.error(err));
  };

  const handleSimulateFailGenerator = () => {
    api.post('/scenarios/demo-2/fail-generator')
      .then(res => {
        setImpactData(res.data.impactResult);
        setSelectedAsset({ label: 'Main Emergency Diesel Generator 750 kVA', assetId: 'GEN-AHM-001' });
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-gov-700" />
            Infrastructure Asset Dependency Network & Cascade Engine
          </h2>
          <p className="text-xs text-slate-500">Interactive dependency graph traversal. Click any asset to analyze downstream failure cascade impact.</p>
        </div>
        <button
          onClick={handleSimulateFailGenerator}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow transition animate-pulse"
        >
          <PlayCircle className="w-4 h-4" />
          Simulate Generator Failure (Demo 2)
        </button>
      </div>

      {/* Main Diagram & Impact Analysis split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* React Flow Canvas */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[550px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500">Loading Dependency Graph...</div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              fitView
            >
              <Background color="#cbd5e1" gap={16} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          )}
        </div>

        {/* Failure Impact Analysis Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Failure Impact Analysis Inspector
          </h3>

          {selectedAsset ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono text-[10px] font-bold text-gov-700 bg-gov-50 px-1.5 py-0.5 rounded border border-gov-200">
                  {selectedAsset.assetId}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedAsset.label || selectedAsset.name}</h4>
                <p className="text-[11px] text-slate-500">{selectedAsset.building}</p>
              </div>

              {impactData ? (
                <div className="space-y-3">
                  {impactData.hasCriticalImpact && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-950 font-medium">
                      <div className="font-bold text-xs flex items-center gap-1.5 text-rose-700">
                        <AlertTriangle className="w-4 h-4" />
                        CRITICAL INFRASTRUCTURE CASCADE ALERT
                      </div>
                      <p className="mt-1 leading-relaxed text-[11px]">{impactData.impactSummary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Affected Assets</span>
                      <span className="font-bold text-lg text-slate-900">{impactData.totalAffectedAssets}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Affected Systems</span>
                      <span className="font-bold text-lg text-slate-900">{impactData.totalAffectedSystems}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-700 mb-2">Downstream Impacted Node Cascade</h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {impactData.affectedNodes?.map((n: any) => (
                        <div key={n.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900">{n.name}</span>
                            <div className="text-[10px] text-slate-500">{n.relationshipType} ({n.criticality})</div>
                          </div>
                          <RiskBadge level={n.criticality} showScore={false} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 py-4 text-center">Calculating graph traversal...</div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Click any node in the graph diagram to analyze failure propagation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
