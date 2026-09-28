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
 * Fetch full Graph data for visual dependency network graph (React Flow compatible format)
 */
export async function getBuildingDependencyGraph(buildingId?: string) {
  const whereClause = buildingId ? { buildingId } : {};

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      building: { select: { name: true } },
      system: { select: { name: true } }
    }
  });

  const assetIds = assets.map(a => a.id);

  const dependencies = await prisma.assetDependency.findMany({
    where: {
      OR: [
        { sourceAssetId: { in: assetIds } },
        { dependentAssetId: { in: assetIds } }
      ]
    }
  });

  const nodes = assets.map((asset, index) => ({
    id: asset.id,
    data: {
      label: asset.name,
      assetId: asset.assetId,
      category: asset.category,
      type: asset.type,
      status: asset.currentStatus,
      health: asset.currentHealthScore,
      risk: asset.currentRiskScore,
      building: asset.building.name,
      system: asset.system?.name || 'General'
    },
    position: { x: (index % 5) * 220 + 50, y: Math.floor(index / 5) * 160 + 50 }
  }));

  const edges = dependencies.map(dep => ({
    id: dep.id,
    source: dep.sourceAssetId,
    target: dep.dependentAssetId,
    label: `${dep.relationshipType} (${dep.criticality})`,
    animated: dep.criticality === 'CRITICAL' || dep.criticality === 'HIGH',
    style: { stroke: dep.criticality === 'CRITICAL' ? '#ef4444' : '#f59e0b', strokeWidth: 2 }
  }));

  return { nodes, edges };
}
