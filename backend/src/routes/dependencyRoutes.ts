import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getBuildingDependencyGraph, performFailureImpactAnalysis } from '../dependency-engine/graphTraversal';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// Get graph for visual network (React Flow format)
router.get('/graph', authenticateToken, async (req, res) => {
  try {
    const { buildingId } = req.query;
    const graphData = await getBuildingDependencyGraph(buildingId ? String(buildingId) : undefined);
    res.json(graphData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Run Failure Impact Analysis for a target asset
router.get('/impact-analysis/:assetId', authenticateToken, async (req, res) => {
  try {
    const { assetId } = req.params;
    const impactResult = await performFailureImpactAnalysis(assetId);
    res.json(impactResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create dependency link
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sourceAssetId, dependentAssetId, relationshipType, criticality, description } = req.body;

    if (sourceAssetId === dependentAssetId) {
      return res.status(400).json({ error: 'An asset cannot depend on itself' });
    }

    const dependency = await prisma.assetDependency.create({
      data: {
        sourceAssetId,
        dependentAssetId,
        relationshipType: relationshipType || 'POWER',
        criticality: criticality || 'HIGH',
        description: description || null
      },
      include: {
        sourceAsset: true,
        dependentAsset: true
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'CREATE_DEPENDENCY', 'AssetDependency', dependency.id, null, dependency);

    res.status(201).json(dependency);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete dependency link
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const dependency = await prisma.assetDependency.delete({
      where: { id: req.params.id }
    });

    await logAudit(req.user?.id, req.user?.name, 'DELETE_DEPENDENCY', 'AssetDependency', req.params.id, dependency, null);

    res.json({ message: 'Dependency link removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
