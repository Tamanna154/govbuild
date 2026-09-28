import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken } from '../middleware/auth';
import { calculateDynamicMaintenancePriority, RiskLevel } from '../risk-engine/calculator';

const router = Router();

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { building: true }
    });

    const totalAssets = assets.length;
    const criticalRiskCount = assets.filter(a => a.riskLevel === 'CRITICAL' || a.currentRiskScore >= 80).length;
    const highRiskCount = assets.filter(a => a.riskLevel === 'HIGH' || (a.currentRiskScore >= 60 && a.currentRiskScore < 80)).length;
    const mediumRiskCount = assets.filter(a => a.riskLevel === 'MEDIUM' || (a.currentRiskScore >= 31 && a.currentRiskScore < 60)).length;
    const lowRiskCount = assets.filter(a => a.riskLevel === 'LOW' && a.currentRiskScore < 31).length;

    const topHighRiskAssets = await prisma.asset.findMany({
      where: { currentRiskScore: { gte: 50 } },
      include: {
        building: { select: { name: true, district: true } },
        maintenancePriorities: { orderBy: { generatedAt: 'desc' }, take: 1 },
        _count: { select: { incomingDependencies: true, failures: true } }
      },
      orderBy: { currentRiskScore: 'desc' },
      take: 10
    });

    res.json({
      totalAssets,
      criticalRiskCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      topHighRiskAssets
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/explain/:assetId', authenticateToken, async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: assetId }, { assetId }] },
      include: {
        building: true,
        failures: true,
        inspections: { orderBy: { inspectionDate: 'desc' }, take: 1 },
        riskHistory: { orderBy: { recordedAt: 'desc' }, take: 5 },
        outgoingDependencies: true,
        incomingDependencies: true
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const latestRiskRecord = asset.riskHistory[0];
    let factors: string[] = [];
    if (latestRiskRecord && latestRiskRecord.riskFactorsJson) {
      try {
        factors = JSON.parse(latestRiskRecord.riskFactorsJson);
      } catch (e) {
        factors = [];
      }
    }

    const priorityResult = calculateDynamicMaintenancePriority(
      asset.currentHealthScore,
      asset.currentRiskScore,
      (asset.riskLevel || 'LOW') as RiskLevel,
      factors,
      asset.incomingDependencies.length
    );

    res.json({
      assetId: asset.assetId,
      name: asset.name,
      buildingName: asset.building.name,
      currentRiskScore: asset.currentRiskScore,
      riskLevel: asset.riskLevel,
      currentHealthScore: asset.currentHealthScore,
      priorityLevel: priorityResult.priorityLevel,
      priorityScore: priorityResult.priorityScore,
      reasons: priorityResult.reasons,
      factors,
      failureCount: asset.failures.length,
      dependentCount: asset.incomingDependencies.length,
      lastInspectionDate: asset.lastInspectionDate
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { assetId } = req.query;
    const where = assetId ? { assetId: String(assetId) } : {};

    const history = await prisma.assetRiskHistory.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      take: 50
    });

    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
