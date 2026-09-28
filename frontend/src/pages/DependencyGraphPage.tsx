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
  X
} from 'lucide-react';
import api from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { HealthBar } from '../components/common/HealthBar';

const DEFAULT_NODES: Node[] = [
  {
    id: 'TRF-AHM-001',
    type: 'default',
    position: { x: 50, y: 150 },
    data: {
      label: 'Main HT Transformer 11kV',
      assetId: 'TRF-AHM-001',
      category: 'Power & Backup',
      healthScore: 92,
      riskScore: 24,
      status: 'OPERATIONAL'
    },
    style: { background: '#f8fafc', border: '2px solid #0284c7', borderRadius: '12px', padding: '12px', width: 190 }
  },
  {
    id: 'GEN-AHM-001',
    type: 'default',
    position: { x: 50, y: 300 },
    data: {
      label: 'Emergency Generator 750 kVA',
      assetId: 'GEN-AHM-001',
      category: 'Power & Backup',
      healthScore: 42,
      riskScore: 82,
      status: 'UNDER_MAINTENANCE'
    },
    style: { background: '#fff1f2', border: '2px solid #e11d48', borderRadius: '12px', padding: '12px', width: 190 }
  },
  {
    id: 'ATS-AHM-001',
    type: 'default',
    position: { x: 320, y: 220 },
    data: {
      label: 'Automatic Transfer Switch & LT Panel',
      assetId: 'ATS-AHM-001',
      category: 'Power & Backup',
      healthScore: 88,
      riskScore: 38,
      status: 'OPERATIONAL'
    },
    style: { background: '#f8fafc', border: '2px solid #0284c7', borderRadius: '12px', padding: '12px', width: 210 }
  },
  {
    id: 'UPS-AHM-001',
    type: 'default',
    position: { x: 600, y: 80 },
    data: {
      label: 'Central Online UPS 120 kVA',
      assetId: 'UPS-AHM-001',
      category: 'Power & Backup',
      healthScore: 90,
      riskScore: 30,
      status: 'OPERATIONAL'
    },
    style: { background: '#f8fafc', border: '2px solid #0284c7', borderRadius: '12px', padding: '12px', width: 190 }
  },
  {
    id: 'CHL-AHM-001',
    type: 'default',
    position: { x: 600, y: 200 },
    data: {
      label: 'Chilled Water HVAC 250 TR',
      assetId: 'CHL-AHM-001',
      category: 'HVAC',
      healthScore: 68,
      riskScore: 54,
      status: 'OPERATIONAL'
    },
    style: { background: '#f8fafc', border: '2px solid #0284c7', borderRadius: '12px', padding: '12px', width: 190 }
  },
  {
    id: 'LFT-AHM-001',
    type: 'default',
    position: { x: 600, y: 320 },
    data: {
      label: 'Passenger Lift #1 (Otis)',
      assetId: 'LFT-AHM-001',
      category: 'Vertical Transport',
      healthScore: 92,
      riskScore: 28,
      status: 'OPERATIONAL'
    },
    style: { background: '#f8fafc', border: '2px solid #0284c7', borderRadius: '12px', padding: '12px', width: 190 }
  },
  {
    id: 'PMP-AHM-001',
    type: 'default',
    position: { x: 600, y: 440 },
    data: {
      label: 'Hydrant Fire Water Pump 75 kW',
      assetId: 'PMP-AHM-001',
      category: 'Fire Protection',
      healthScore: 88,
      riskScore: 35,
      status: 'OPERATIONAL'
    },
    style: { background: '#f8fafc', border: '2px solid #0284c7', borderRadius: '12px', padding: '12px', width: 190 }
  },
  {
    id: 'SRV-AHM-001',
    type: 'default',
    position: { x: 880, y: 140 },
    data: {
      label: 'State Data Center Server Core',
      assetId: 'SRV-AHM-001',
      category: 'Critical Infrastructure',
      healthScore: 95,
      riskScore: 25,
      status: 'OPERATIONAL'
    },
    style: { background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: '12px', padding: '12px', width: 200 }
  }
];

const DEFAULT_EDGES: Edge[] = [
  {
    id: 'e-trf-ats',
    source: 'TRF-AHM-001',
    target: 'ATS-AHM-001',
    animated: true,
    label: 'Primary HT 11kV',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' },
    style: { stroke: '#0284c7', strokeWidth: 2 }
  },
  {
    id: 'e-gen-ats',
    source: 'GEN-AHM-001',
    target: 'ATS-AHM-001',
    animated: true,
    label: 'Emergency Standby',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' },
    style: { stroke: '#e11d48', strokeWidth: 2, strokeDasharray: '4 4' }
  },
  {
    id: 'e-ats-ups',
    source: 'ATS-AHM-001',
    target: 'UPS-AHM-001',
    animated: true,
    label: 'LT Busduct 415V',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' },
    style: { stroke: '#0284c7', strokeWidth: 2 }
  },
  {
    id: 'e-ats-chl',
    source: 'ATS-AHM-001',
    target: 'CHL-AHM-001',
    animated: true,
    label: 'Chiller Feed',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' },
    style: { stroke: '#0284c7', strokeWidth: 2 }
  },
  {
    id: 'e-ats-lft',
    source: 'ATS-AHM-001',
    target: 'LFT-AHM-001',
    animated: true,
    label: 'Elevator Feed',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' },
    style: { stroke: '#0284c7', strokeWidth: 2 }
  },
  {
    id: 'e-ats-pmp',
    source: 'ATS-AHM-001',
    target: 'PMP-AHM-001',
    animated: true,
    label: 'Life Safety Bus',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' },
    style: { stroke: '#0284c7', strokeWidth: 2 }
  },
  {
    id: 'e-ups-srv',
    source: 'UPS-AHM-001',
    target: 'SRV-AHM-001',
    animated: true,
    label: 'Clean Dual Power',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' },
    style: { stroke: '#16a34a', strokeWidth: 2 }
  },
  {
    id: 'e-chl-srv',
    source: 'CHL-AHM-001',
    target: 'SRV-AHM-001',
    animated: true,
    label: 'Cooling Airflow',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    style: { stroke: '#06b6d4', strokeWidth: 2 }
  }
];

export const DependencyGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<Edge[]>(DEFAULT_EDGES);
  const [selectedAsset, setSelectedAsset] = useState<any>(DEFAULT_NODES[1].data);
  const [simulatedFailureNodeId, setSimulatedFailureNodeId] = useState<string | null>('GEN-AHM-001');

  useEffect(() => {
    api.get('/dependencies/graph')
      .then(res => {
        if (Array.isArray(res.data?.nodes) && res.data.nodes.length > 0) {
          setNodes(res.data.nodes);
          if (Array.isArray(res.data?.edges) && res.data.edges.length > 0) {
            setEdges(res.data.edges);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedAsset(node.data);
    setSimulatedFailureNodeId(node.id);
  };

  const handleSimulateCascade = (nodeId: string) => {
    setSimulatedFailureNodeId(nodeId);
    // Highlight edges starting from this node in red
    setEdges(prevEdges =>
      prevEdges.map(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
          return {
            ...edge,
            animated: true,
            style: { stroke: '#dc2626', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
          };
        }
        return {
          ...edge,
          style: { stroke: '#0284c7', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' }
        };
      })
    );
  };

  const handleResetGraph = () => {
    setSimulatedFailureNodeId(null);
    setEdges(DEFAULT_EDGES);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-purple-700 uppercase tracking-wider">
            <span>Engineering Systems & Network Modeling</span>
            <span>•</span>
            <span>R&B Department</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-purple-600" />
            Infrastructure Asset Dependency Network
          </h1>
          <p className="text-xs text-slate-500">
            Interactive system topology mapping electrical, HVAC, and life-safety cascade interdependencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {simulatedFailureNodeId && (
            <button
              onClick={handleResetGraph}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Reset Graph
            </button>
          )}
          <button
            onClick={() => handleSimulateCascade('GEN-AHM-001')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <AlertTriangle className="w-4 h-4" />
            Simulate Generator Outage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden h-[540px] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="!bg-slate-800 !border-slate-700 !fill-white" />
            <MiniMap
              nodeColor={(node: any) => (node.data?.riskScore > 70 ? '#e11d48' : '#0284c7')}
              className="!bg-slate-950/80 !border-slate-800 !rounded-lg"
            />
          </ReactFlow>

          {/* Quick Legend Overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Topology Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Primary Power Bus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Emergency Standby</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Dual Protected Feed</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Node Impact Analysis (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {selectedAsset.assetId}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{selectedAsset.category}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">{selectedAsset.label || selectedAsset.name}</h3>
              </div>

              {/* Health & Risk */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Health Rating:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedAsset.healthScore}%</span>
                </div>
                <HealthBar score={selectedAsset.healthScore} showText={false} />
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Risk Score:</span>
                  <RiskBadge level={selectedAsset.riskScore > 70 ? 'CRITICAL' : 'LOW'} score={selectedAsset.riskScore} />
                </div>
              </div>

              {/* Cascade Impact Assessment */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Cascade Failure Impact:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  {selectedAsset.assetId === 'GEN-AHM-001' ? (
                    <>
                      <div className="font-semibold text-rose-700">Single Point of Failure for Standby Power:</div>
                      <div>• If grid power fails, automatic changeover to ATS panel will fail.</div>
                      <div>• Hospital Trauma Lifts & State Data Centre will trip onto 15-minute battery UPS.</div>
                      <div className="text-[11px] text-rose-600 font-bold mt-1">Severity: Level 4 Critical Life-Safety Alert</div>
                    </>
                  ) : selectedAsset.assetId === 'ATS-AHM-001' ? (
                    <>
                      <div className="font-semibold text-amber-700">Central Distribution Bus:</div>
                      <div>• Direct impact on 4 downstream branches: UPS, Chiller, Lift #1, and Fire Pump.</div>
                      <div className="text-[11px] text-amber-800 font-bold mt-1">Severity: High Infrastructure Broad Impact</div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-emerald-700">Subsystem Endpoint:</div>
                      <div>• Upstream power feed received normally from ATS-AHM-001 panel.</div>
                      <div>• Zero cascading failure propagation to sibling subsystems.</div>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateCascade(selectedAsset.assetId)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Simulate Failure on this Asset
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click any node in the dependency network to inspect its cascade failure paths.
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            GovBuild360 Dependency Engine • Roads & Buildings Dept
          </div>
        </div>
      </div>
    </div>
  );
};
