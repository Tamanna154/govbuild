import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculateHealthScore, calculateRiskScore, calculateDynamicMaintenancePriority, PriorityLevel, RiskLevel } from '../risk-engine/calculator';
import { createAlert } from '../alert-engine/alertService';
import { logAudit } from '../utils/auditLogger';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { assetId, buildingId } = req.query;
    const where: any = {};
    if (assetId) where.assetId = String(assetId);
    if (buildingId) {
      where.asset = { buildingId: String(buildingId) };
    }

    const inspections = await prisma.inspection.findMany({
      where,
      include: {
        asset: { include: { building: true } },
        measurements: true
      },
      orderBy: { inspectionDate: 'desc' }
    });

    res.json(inspections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
      include: {
        building: true,
        failures: true,
        warranties: { where: { status: 'ACTIVE' } },
        amcContracts: { where: { status: 'ACTIVE' } },
        _count: { select: { incomingDependencies: true } }
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const count = await prisma.inspection.count();
    const inspectionId = `INSP-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(3, '0')}`;

    const inspection = await prisma.inspection.create({
      data: {
        inspectionId,
        assetId: asset.id,
        inspectorId: req.user?.id || 'demo-inspector-id',
        inspectionDate: new Date(),
        physicalCondition: data.physicalCondition || 'Good',
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        vibration: data.vibration ? parseFloat(data.vibration) : null,
        noise: data.noise ? parseFloat(data.noise) : null,
        oilLevel: data.oilLevel ? parseFloat(data.oilLevel) : null,
        voltage: data.voltage ? parseFloat(data.voltage) : null,
        current: data.current ? parseFloat(data.current) : null,
        operatingHours: data.operatingHours ? parseFloat(data.operatingHours) : null,
        leakage: Boolean(data.leakage),
        corrosion: Boolean(data.corrosion),
        damage: Boolean(data.damage),
        safetyStatus: data.safetyStatus || 'PASS',
        photos: data.photos || null,
        remarks: data.remarks || null,
        recommendedAction: data.recommendedAction || null
      }
    });

    const ageYears = asset.installationDate
      ? (new Date().getTime() - new Date(asset.installationDate).getTime()) / (1000 * 3600 * 24 * 365.25)
      : 2.5;

    const healthResult = calculateHealthScore({
      physicalCondition: data.physicalCondition,
      temperature: data.temperature ? parseFloat(data.temperature) : null,
      vibration: data.vibration ? parseFloat(data.vibration) : null,
      voltage: data.voltage ? parseFloat(data.voltage) : null,
      leakage: Boolean(data.leakage),
      corrosion: Boolean(data.corrosion),
      damage: Boolean(data.damage),
      recentFailuresCount: asset.failures.length,
      ageYears,
      expectedLifeYears: asset.expectedLifeYears
    });

    const warrantyExpiredNoAMC = (asset.warranties.length === 0 || asset.warranties[0].endDate < new Date()) && asset.amcContracts.length === 0;

    const riskResult = calculateRiskScore({
      healthScore: healthResult.healthScore,
      ageYears,
      expectedLifeYears: asset.expectedLifeYears,
      failureCount: asset.failures.length,
      criticality: (asset.criticalityLevel || 'MEDIUM') as PriorityLevel,
      warrantyExpiredWithoutAMC: warrantyExpiredNoAMC,
      dependentCount: asset._count.incomingDependencies,
      hasAbnormalTelemetry: (data.temperature && parseFloat(data.temperature) > 75) || (data.vibration && parseFloat(data.vibration) > 3.0)
    });

    const previousRisk = asset.currentRiskScore;
    if (riskResult.riskScore - previousRisk >= 20 || riskResult.riskScore >= 75) {
      await createAlert({
        alertType: 'RISK_DETERIORATION',
        priority: 'RED',
        title: `RISK DETERIORATION ALERT: ${asset.assetId}`,
        message: `${asset.name} at ${asset.building.name} risk score increased rapidly from ${Math.round(previousRisk)} to ${riskResult.riskScore} following recent inspection. Immediate inspection/maintenance recommended.`,
        buildingId: asset.buildingId,
        assetId: asset.id
      });
    }

    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        currentHealthScore: healthResult.healthScore,
        currentRiskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        lastInspectionDate: new Date(),
        currentStatus: healthResult.healthScore < 40 ? 'DEGRADED' : asset.currentStatus
      }
    });

    await prisma.assetHealthHistory.create({
      data: {
        assetId: asset.id,
        healthScore: healthResult.healthScore,
        conditionRating: healthResult.conditionRating,
        factorsJson: JSON.stringify(healthResult.factors)
      }
    });

    await prisma.assetRiskHistory.create({
      data: {
        assetId: asset.id,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        healthScore: healthResult.healthScore,
        failureFrequency: asset.failures.length,
        ageYears,
        dependencyImpact: asset._count.incomingDependencies * 5,
        riskFactorsJson: JSON.stringify(riskResult.factors)
      }
    });

    const priorityResult = calculateDynamicMaintenancePriority(
      healthResult.healthScore,
      riskResult.riskScore,
      riskResult.riskLevel,
      riskResult.factors,
      asset._count.incomingDependencies
    );

    await prisma.maintenancePriority.create({
      data: {
        assetId: asset.id,
        priorityScore: priorityResult.priorityScore,
        priorityLevel: priorityResult.priorityLevel,
        reason: priorityResult.reasons.join(' | ')
      }
    });

    await prisma.lifecycleEvent.create({
      data: {
        assetId: asset.id,
        eventType: 'INSPECTION',
        description: `Inspection completed by ${req.user?.name || 'Inspector'}. Health: ${healthResult.healthScore}%, Risk: ${riskResult.riskScore}/100. Priority: ${priorityResult.priorityLevel}`,
        performedBy: req.user?.name || 'Inspector'
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'INSPECT', 'Asset', asset.id, { oldHealth: asset.currentHealthScore, oldRisk: asset.currentRiskScore }, { newHealth: healthResult.healthScore, newRisk: riskResult.riskScore });

    res.status(201).json({
      inspection,
      healthResult,
      riskResult,
      priorityResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
