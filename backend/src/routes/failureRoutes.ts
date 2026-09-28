import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { performFailureImpactAnalysis } from '../dependency-engine/graphTraversal';
import { createAlert } from '../alert-engine/alertService';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// List Failure Records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { assetId, buildingId } = req.query;
    const where: any = {};
    if (assetId) where.assetId = String(assetId);
    if (buildingId) where.asset = { buildingId: String(buildingId) };

    const failures = await prisma.failureRecord.findMany({
      where,
      include: {
        asset: { include: { building: true } }
      },
      orderBy: { failureDate: 'desc' }
    });
    res.json(failures);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record Asset Failure & Run Cascade Impact Alert
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
      include: { building: true }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // 1. Create Failure Record
    const failure = await prisma.failureRecord.create({
      data: {
        assetId: asset.id,
        failureDate: new Date(),
        failureType: data.failureType || 'Electrical Breakdown',
        symptoms: data.symptoms || 'Loss of operational output / tripped circuit',
        rootCause: data.rootCause || 'Component breakdown or overload',
        downtimeHours: data.downtimeHours ? parseFloat(data.downtimeHours) : 0,
        repairCost: data.repairCost ? parseFloat(data.repairCost) : 0,
        severity: data.severity || 'CRITICAL',
        resolution: data.resolution || 'Work order created for urgent replacement',
        technicianId: req.user?.id || null
      }
    });

    // 2. Set Asset status to FAILED & Health to Critical
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        currentStatus: 'FAILED',
        currentHealthScore: 15,
        currentRiskScore: 95,
        riskLevel: 'CRITICAL'
      }
    });

    // 3. Dependency Impact Analysis
    const impactResult = await performFailureImpactAnalysis(asset.id);

    // 4. Generate Infrastructure Impact Alert
    if (impactResult.totalAffectedAssets > 0) {
      await createAlert({
        alertType: 'DEPENDENCY_CASCADE_FAILURE',
        priority: 'RED',
        title: `CRITICAL INFRASTRUCTURE CASCADE: ${asset.assetId} FAILED`,
        message: `${asset.name} at ${asset.building.name} HAS FAILED. ${impactResult.impactSummary}`,
        buildingId: asset.buildingId,
        assetId: asset.id
      });
    }

    // 5. Lifecycle Event
    await prisma.lifecycleEvent.create({
      data: {
        assetId: asset.id,
        eventType: 'REPAIR',
        description: `CRITICAL FAILURE RECORDED: ${failure.failureType}. ${impactResult.impactSummary}`,
        performedBy: req.user?.name || 'Engineer'
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'RECORD_FAILURE', 'FailureRecord', failure.id, null, failure);

    res.status(201).json({
      failure,
      impactResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
