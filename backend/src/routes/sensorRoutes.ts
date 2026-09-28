import { Router } from 'express';
import { prisma } from '../config/prisma';
import { calculateHealthScore, calculateRiskScore, calculateDynamicMaintenancePriority, PriorityLevel } from '../risk-engine/calculator';
import { createAlert } from '../alert-engine/alertService';
import { logAudit } from '../utils/auditLogger';

const router = Router();

router.post('/readings', async (req, res) => {
  try {
    const { asset_id, assetId, temperature, vibration, voltage, current, runtime, runtimeHours, fuel_level, fuelLevel } = req.body;
    const targetAssetId = asset_id || assetId;

    if (!targetAssetId) {
      return res.status(400).json({ error: 'asset_id is required' });
    }

    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: targetAssetId }, { assetId: targetAssetId }] },
      include: {
        building: true,
        failures: true,
        _count: { select: { incomingDependencies: true } }
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const tempVal = temperature !== undefined ? parseFloat(temperature) : null;
    const vibVal = vibration !== undefined ? parseFloat(vibration) : null;
    const voltVal = voltage !== undefined ? parseFloat(voltage) : null;
    const currVal = current !== undefined ? parseFloat(current) : null;
    const runVal = (runtime || runtimeHours) !== undefined ? parseFloat(runtime || runtimeHours) : null;
    const fuelVal = (fuel_level || fuelLevel) !== undefined ? parseFloat(fuel_level || fuelLevel) : null;

    const sensorReading = await prisma.sensorReading.create({
      data: {
        assetId: asset.id,
        temperature: tempVal,
        vibration: vibVal,
        voltage: voltVal,
        current: currVal,
        runtimeHours: runVal,
        fuelLevel: fuelVal
      }
    });

    const ageYears = asset.installationDate
      ? (new Date().getTime() - new Date(asset.installationDate).getTime()) / (1000 * 3600 * 24 * 365.25)
      : 3.0;

    const healthResult = calculateHealthScore({
      physicalCondition: asset.currentHealthScore < 50 ? 'Poor' : 'Good',
      temperature: tempVal,
      vibration: vibVal,
      voltage: voltVal,
      recentFailuresCount: asset.failures.length,
      ageYears,
      expectedLifeYears: asset.expectedLifeYears
    });

    const isAnomaly = (tempVal && tempVal > 80) || (vibVal && vibVal > 3.2);

    const riskResult = calculateRiskScore({
      healthScore: healthResult.healthScore,
      ageYears,
      expectedLifeYears: asset.expectedLifeYears,
      failureCount: asset.failures.length,
      criticality: (asset.criticalityLevel || 'MEDIUM') as PriorityLevel,
      dependentCount: asset._count.incomingDependencies,
      hasAbnormalTelemetry: Boolean(isAnomaly)
    });

    let alertGenerated = null;
    if (riskResult.riskScore - asset.currentRiskScore >= 15 || riskResult.riskScore >= 75 || healthResult.healthScore <= 45) {
      alertGenerated = await createAlert({
        alertType: 'SENSOR_ANOMALY',
        priority: 'RED',
        title: `TELEMETRY ALERT: ${asset.assetId} Telemetry Spiked`,
        message: `${asset.name} at ${asset.building.name} reported abnormal telemetry (Temp: ${tempVal || 'N/A'}°C, Vibration: ${vibVal || 'N/A'} mm/s). Health dropped to ${healthResult.healthScore}%, Risk escalated to ${riskResult.riskScore}/100.`,
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
        currentStatus: healthResult.healthScore < 45 ? 'DEGRADED' : asset.currentStatus
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

    res.status(200).json({
      status: 'success',
      sensorReading,
      assetId: asset.assetId,
      name: asset.name,
      updatedHealthScore: healthResult.healthScore,
      updatedRiskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      priorityLevel: priorityResult.priorityLevel,
      explainableReasons: priorityResult.reasons,
      alertGenerated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
