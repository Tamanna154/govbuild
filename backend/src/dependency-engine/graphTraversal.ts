import { prisma } from '../config/prisma';

export interface DependencyNode {
  id: string;
  assetId: string;
  name: string;
  category: string;
  type: string;
  buildingId: string;
  buildingName?: string;
  currentStatus: string;
  currentHealthScore: number;
  currentRiskScore: number;
  relationshipType: string;
  criticality: string;
  depth: number;
}

export interface ImpactAnalysisResult {
  sourceAssetId: string;
  sourceAssetName: string;
  totalAffectedAssets: number;
  totalAffectedSystems: number;
  criticalDependenciesCount: number;
  directDependenciesCount: number;
  indirectDependenciesCount: number;
  affectedNodes: DependencyNode[];
  impactSummary: string;
  hasCriticalImpact: boolean;
}

/**
 * Traverse dependency graph downstream from a failed or target asset using BFS.
 */
export async function performFailureImpactAnalysis(sourceAssetId: string): Promise<ImpactAnalysisResult> {
  const sourceAsset = await prisma.asset.findUnique({
    where: { id: sourceAssetId },
    include: { building: true, system: true }
  });

  if (!sourceAsset) {
    throw new Error(`Asset not found: ${sourceAssetId}`);
  }

  const visitedAssetIds = new Set<string>([sourceAsset.id]);
  const queue: Array<{ id: string; depth: number }> = [{ id: sourceAsset.id, depth: 0 }];
  const affectedNodes: DependencyNode[] = [];
  const systemIds = new Set<string>();

  let directCount = 0;
  let indirectCount = 0;
  let criticalCount = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Find all assets that depend on current asset (incoming dependencies where current is sourceAssetId)
    const dependencies = await prisma.assetDependency.findMany({
      where: { sourceAssetId: current.id },
      include: {
        dependentAsset: {
          include: { building: true }
        }
      }
    });

    for (const dep of dependencies) {
      const depAsset = dep.dependentAsset;
      if (!visitedAssetIds.has(depAsset.id)) {
        visitedAssetIds.add(depAsset.id);

        const depth = current.depth + 1;
        if (depth === 1) directCount++;
        else indirectCount++;

        if (dep.criticality === 'CRITICAL' || dep.criticality === 'HIGH') {
          criticalCount++;
        }

        if (depAsset.systemId) {
          systemIds.add(depAsset.systemId);
        }

        affectedNodes.push({
          id: depAsset.id,
          assetId: depAsset.assetId,
          name: depAsset.name,
          category: depAsset.category,
          type: depAsset.type,
          buildingId: depAsset.buildingId,
          buildingName: depAsset.building.name,
          currentStatus: depAsset.currentStatus,
          currentHealthScore: depAsset.currentHealthScore,
          currentRiskScore: depAsset.currentRiskScore,
          relationshipType: dep.relationshipType,
          criticality: dep.criticality,
          depth
        });

        queue.push({ id: depAsset.id, depth });
      }
    }
  }

  const hasCriticalImpact = criticalCount > 0 || affectedNodes.length >= 3;

  let impactSummary = `Failure of ${sourceAsset.assetId} (${sourceAsset.name}) potentially affects ${affectedNodes.length} downstream asset(s) across ${systemIds.size} building system(s).`;
  if (hasCriticalImpact) {
    impactSummary += ` CRITICAL INFRASTRUCTURE CASCADE RISK: ${criticalCount} critical dependency links impacted.`;
  }

  return {
    sourceAssetId: sourceAsset.id,
    sourceAssetName: sourceAsset.name,
    totalAffectedAssets: affectedNodes.length,
    totalAffectedSystems: systemIds.size,
    criticalDependenciesCount: criticalCount,
    directDependenciesCount: directCount,
    indirectDependenciesCount: indirectCount,
    affectedNodes,
    impactSummary,
    hasCriticalImpact
  };
}

/**
 * Fetch Graph data for visual dependency network graph (React Flow compatible format)
 */
export async function getBuildingDependencyGraph(buildingId?: string) {
  const whereClause = buildingId ? { buildingId } : {};

  // Fetch all dependencies with their source and dependent asset details
  const allDependencies = await prisma.assetDependency.findMany({
    where: buildingId
      ? {
          OR: [
            { sourceAsset: { buildingId } },
            { dependentAsset: { buildingId } }
          ]
        }
      : {},
    include: {
      sourceAsset: {
        include: {
          building: { select: { id: true, name: true } },
          system: { select: { id: true, name: true } }
        }
      },
      dependentAsset: {
        include: {
          building: { select: { id: true, name: true } },
          system: { select: { id: true, name: true } }
        }
      }
    }
  });

  // Collect unique asset IDs that are actually part of the dependency network
  const connectedAssetMap = new Map<string, any>();

  for (const dep of allDependencies) {
    if (dep.sourceAsset && !connectedAssetMap.has(dep.sourceAsset.id)) {
      connectedAssetMap.set(dep.sourceAsset.id, dep.sourceAsset);
    }
    if (dep.dependentAsset && !connectedAssetMap.has(dep.dependentAsset.id)) {
      connectedAssetMap.set(dep.dependentAsset.id, dep.dependentAsset);
    }
  }

  // If no dependencies found for specific filter, fallback to all assets
  if (connectedAssetMap.size === 0) {
    const fallbackAssets = await prisma.asset.findMany({
      where: whereClause,
      take: 15,
      include: {
        building: { select: { id: true, name: true } },
        system: { select: { id: true, name: true } }
      }
    });
    for (const a of fallbackAssets) {
      connectedAssetMap.set(a.id, a);
    }
  }

  // Calculate dependency depths / layers (Topological tiering)
  // Assets that only act as sources -> Tier 0 (Leftmost)
  // Assets that have incoming dependencies -> Tier 1, 2, etc.
  const inDegreeMap = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();

  connectedAssetMap.forEach((_, id) => {
    inDegreeMap.set(id, 0);
    childrenMap.set(id, []);
  });

  for (const dep of allDependencies) {
    if (connectedAssetMap.has(dep.sourceAssetId) && connectedAssetMap.has(dep.dependentAssetId)) {
      const curIn = inDegreeMap.get(dep.dependentAssetId) || 0;
      inDegreeMap.set(dep.dependentAssetId, curIn + 1);

      const curChildren = childrenMap.get(dep.sourceAssetId) || [];
      curChildren.push(dep.dependentAssetId);
      childrenMap.set(dep.sourceAssetId, curChildren);
    }
  }

  // Assign layers: 0 for root providers, 1 for distribution, 2 for mission critical end nodes
  const layerMap = new Map<string, number>();
  connectedAssetMap.forEach((_, id) => {
    if ((inDegreeMap.get(id) || 0) === 0) {
      layerMap.set(id, 0);
    }
  });

  // Propagate layers
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    for (const [parent, children] of childrenMap.entries()) {
      const parentLayer = layerMap.get(parent) ?? 0;
      for (const child of children) {
        const curLayer = layerMap.get(child) ?? 0;
        if (curLayer <= parentLayer) {
          layerMap.set(child, parentLayer + 1);
          changed = true;
        }
      }
    }
  }

  // Group by layer for clean vertical spacing
  const layerBuckets = new Map<number, any[]>();
  connectedAssetMap.forEach((asset, id) => {
    const layer = layerMap.get(id) ?? 0;
    if (!layerBuckets.has(layer)) layerBuckets.set(layer, []);
    layerBuckets.get(layer)!.push(asset);
  });

  const nodes: any[] = [];
  const X_SPACING = 340;
  const Y_SPACING = 150;

  layerBuckets.forEach((assetsInLayer, layer) => {
    assetsInLayer.forEach((asset, idx) => {
      nodes.push({
        id: asset.id,
        type: 'default',
        data: {
          label: asset.name,
          assetId: asset.assetId,
          category: asset.category,
          type: asset.type,
          status: asset.currentStatus,
          health: asset.currentHealthScore,
          risk: asset.currentRiskScore,
          building: asset.building?.name || 'Main Facility',
          system: asset.system?.name || 'General Utilities',
          tier: layer === 0 ? 'Primary Source' : layer === 1 ? 'Distribution' : 'Mission-Critical End Service'
        },
        position: {
          x: layer * X_SPACING + 40,
          y: idx * Y_SPACING + 40
        }
      });
    });
  });

  // Human-readable formatted edges with full dependency names
  const edges = allDependencies.map(dep => {
    const depName = dep.description || `${dep.relationshipType} Link`;
    const isCritical = dep.criticality === 'CRITICAL';
    const isHigh = dep.criticality === 'HIGH';

    return {
      id: dep.id,
      source: dep.sourceAssetId,
      target: dep.dependentAssetId,
      label: `${depName} [${dep.criticality}]`,
      animated: isCritical || isHigh,
      style: {
        stroke: isCritical ? '#dc2626' : isHigh ? '#d97706' : '#2563eb',
        strokeWidth: isCritical ? 2.5 : 2
      },
      data: {
        dependencyName: depName,
        sourceAssetName: dep.sourceAsset?.name,
        sourceAssetId: dep.sourceAsset?.assetId,
        dependentAssetName: dep.dependentAsset?.name,
        dependentAssetId: dep.dependentAsset?.assetId,
        relationshipType: dep.relationshipType,
        criticality: dep.criticality,
        description: dep.description
      }
    };
  });

  // Full dependency registry table payload
  const dependenciesList = allDependencies.map(dep => ({
    id: dep.id,
    dependencyName: dep.description || `${dep.relationshipType} Power & Utility Feed`,
    sourceAssetId: dep.sourceAsset?.assetId,
    sourceAssetName: dep.sourceAsset?.name,
    sourceBuilding: dep.sourceAsset?.building?.name,
    targetAssetId: dep.dependentAsset?.assetId,
    targetAssetName: dep.dependentAsset?.name,
    targetBuilding: dep.dependentAsset?.building?.name,
    relationshipType: dep.relationshipType,
    criticality: dep.criticality,
    description: dep.description
  }));

  return { nodes, edges, dependenciesList };
}
