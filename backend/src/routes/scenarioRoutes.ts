import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken } from '../middleware/auth';
import { performFailureImpactAnalysis } from '../dependency-engine/graphTraversal';
import { createAlert } from '../alert-engine/alertService';
import { calculateDynamicMaintenancePriority } from '../risk-engine/calculator';

const router = Router();

// Demo Scenario 1: Trigger High Risk & Deterioration on GEN-AHM-001
router.post('/demo-1/deteriorate', authenticateToken, async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { assetId: 'GEN-AHM-001' },
      include: { building: true, _count: { select: { incomingDependencies: true } } }
    });

    if (!asset) {
      return res.status(404).json({ error: 'GEN-AHM-001 not found. Please seed demo data first.' });
    }

    // Set Critical Health 42%, Risk 82
    const beforeHealth = 42;
    const beforeRisk = 82;

    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        currentHealthScore: beforeHealth,
        currentRiskScore: beforeRisk,
        riskLevel: 'CRITICAL',
        currentStatus: 'DEGRADED',
        nextScheduledMaintenance: new Date('2026-12-20')
      }
    });

    // Record Sensor Reading Anomaly
    await prisma.sensorReading.create({
      data: {
        assetId: asset.id,
        temperature: 88.5,
        vibration: 4.8,
        voltage: 415,
        current: 145,
        runtimeHours: 3420,
        fuelLevel: 65
      }
    });

    // Generate Deterioration Alert
    const alert = await createAlert({
      alertType: 'RISK_DETERIORATION',
      priority: 'RED',
      title: 'CRITICAL ALERT: GEN-AHM-001 Deterioration Detected',
      message: 'Generator GEN-AHM-001 health dropped to 42% and risk score increased to 82/100 due to abnormal vibration (4.8 mm/s) & temperature (88.5°C). Immediate inspection recommended.',
      buildingId: asset.buildingId,
      assetId: asset.id
    });

    // Priority Engine Shift to URGENT
    const priorityResult = calculateDynamicMaintenancePriority(
      beforeHealth,
      beforeRisk,
      'CRITICAL',
      [
        'Health score below 40% threshold (Current: 42%)',
        'Risk score 82/100 in CRITICAL zone',
        '3 previous failures recorded in past 12 months',
        'High vibration trend (4.8 mm/s vs 2.5 max)',
        'Critical building emergency power dependency'
      ],
      asset._count.incomingDependencies,
      83 // calendar days remaining to Dec 20
    );

    await prisma.maintenancePriority.create({
      data: {
        assetId: asset.id,
        priorityScore: priorityResult.priorityScore,
        priorityLevel: 'URGENT',
        reason: priorityResult.reasons.join(' | ')
      }
    });

    res.json({
      scenario: 'Demo Scenario 1 - Sensor Deterioration & Priority Escalation',
      assetId: asset.assetId,
      name: asset.name,
      calendarMaintenanceDate: '2026-12-20',
      currentHealthScore: beforeHealth,
      currentRiskScore: beforeRisk,
      priorityLevel: 'URGENT',
      explainableReasons: priorityResult.reasons,
      alertGenerated: alert
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo Scenario 1 Repair: Overhaul GEN-AHM-001 and restore Health 88%, Risk 25
router.post('/demo-1/repair', authenticateToken, async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { assetId: 'GEN-AHM-001' },
      include: { building: true, _count: { select: { incomingDependencies: true } } }
    });

    if (!asset) return res.status(404).json({ error: 'GEN-AHM-001 not found' });

    const beforeHealth = asset.currentHealthScore;
    const beforeRisk = asset.currentRiskScore;
    const afterHealth = 88;
    const afterRisk = 25;

    // Update Asset
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        currentStatus: 'OPERATIONAL',
        currentHealthScore: afterHealth,
        currentRiskScore: afterRisk,
        riskLevel: 'LOW',
        lastMaintenanceDate: new Date()
      }
    });

    // Record Health & Risk Histories
    await prisma.assetHealthHistory.create({
      data: {
        assetId: asset.id,
        healthScore: afterHealth,
        conditionRating: 'Good',
        factorsJson: JSON.stringify(['Post-overhaul servicing completed. New bearings & AVR calibrated.'])
      }
    });

    await prisma.assetRiskHistory.create({
      data: {
        assetId: asset.id,
        riskScore: afterRisk,
        riskLevel: 'LOW',
        healthScore: afterHealth,
        riskFactorsJson: JSON.stringify(['Risk mitigated post-maintenance'])
      }
    });

    // Dynamic Priority reset to LOW
    const priorityResult = calculateDynamicMaintenancePriority(
      afterHealth,
      afterRisk,
      'LOW',
      ['Optimal post-repair performance'],
      asset._count.incomingDependencies
    );

    await prisma.maintenancePriority.create({
      data: {
        assetId: asset.id,
        priorityScore: priorityResult.priorityScore,
        priorityLevel: 'LOW',
        reason: priorityResult.reasons.join(' | ')
      }
    });

    // Lifecycle Event
    await prisma.lifecycleEvent.create({
      data: {
        assetId: asset.id,
        eventType: 'REPAIR',
        description: `Comprehensive maintenance overhaul completed. Replaced vibration dampeners, main bearing, AVR circuit & engine oil. Total cost: ₹40,000. Health restored to ${afterHealth}%, Risk reduced to ${afterRisk}.`,
        performedBy: 'Senior Maintenance Technician'
      }
    });

    res.json({
      scenario: 'Demo Scenario 1 - Repair Completion & Risk Mitigation',
      assetId: asset.assetId,
      beforeVsAfter: {
        beforeHealthScore: beforeHealth,
        afterHealthScore: afterHealth,
        beforeRiskScore: beforeRisk,
        afterRiskScore: afterRisk,
        beforePriority: 'URGENT',
        afterPriority: 'LOW',
        healthImprovement: `+${afterHealth - beforeHealth}%`,
        riskReduction: `-${beforeRisk - afterRisk} pts`
      },
      priorityLevel: 'LOW'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo Scenario 2: Dependency Failure Cascade
router.post('/demo-2/fail-generator', authenticateToken, async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { assetId: 'GEN-AHM-001' }
    });

    if (!asset) return res.status(404).json({ error: 'GEN-AHM-001 not found' });

    // Mark as FAILED
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        currentStatus: 'FAILED',
        currentHealthScore: 10,
        currentRiskScore: 98,
        riskLevel: 'CRITICAL'
      }
    });

    // Perform Failure Impact Analysis
    const impactResult = await performFailureImpactAnalysis(asset.id);

    // Create Alert
    const alert = await createAlert({
      alertType: 'DEPENDENCY_CASCADE_FAILURE',
      priority: 'RED',
      title: 'CRITICAL INFRASTRUCTURE IMPACT DETECTED',
      message: `Generator GEN-AHM-001 HAS FAILED. ${impactResult.impactSummary} Affected assets: ${impactResult.affectedNodes.map(n => n.name).join(', ')}.`,
      buildingId: asset.buildingId,
      assetId: asset.id
    });

    res.json({
      scenario: 'Demo Scenario 2 - Dependency Failure Cascade',
      failedAsset: asset.assetId,
      impactResult,
      alertGenerated: alert
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo Scenario 3: Warranty Expiry Alert
router.post('/demo-3/warranty-expiry', authenticateToken, async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { assetId: 'LFT-AHM-001' },
      include: { building: true, warranties: true }
    });

    if (!asset) return res.status(404).json({ error: 'LFT-AHM-001 not found' });

    const tenDaysLater = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    // Update warranty end date
    if (asset.warranties.length > 0) {
      await prisma.warranty.update({
        where: { id: asset.warranties[0].id },
        data: { endDate: tenDaysLater, status: 'EXPIRING_SOON' }
      });
    }

    const alert = await createAlert({
      alertType: 'WARRANTY_EXPIRING',
      priority: 'ORANGE',
      title: 'Warranty Expiring Soon: LFT-AHM-001',
      message: `Warranty for Lift-001 (${asset.assetId}) at ${asset.building.name} expires in 10 days on ${tenDaysLater.toISOString().split('T')[0]}. Action required: Renew contract or submit AMC request.`,
      buildingId: asset.buildingId,
      assetId: asset.id
    });

    res.json({
      scenario: 'Demo Scenario 3 - Warranty Expiry Alert',
      assetId: asset.assetId,
      warrantyEndDate: tenDaysLater.toISOString().split('T')[0],
      daysRemaining: 10,
      alertGenerated: alert
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo Scenario 4: Risk-Based Priority vs Calendar Schedule Comparison
router.get('/demo-4/priority-comparison', authenticateToken, async (req, res) => {
  try {
    const assetA = await prisma.asset.findFirst({
      where: { assetId: 'PMP-AHM-001' },
      include: { building: true }
    });

    const assetB = await prisma.asset.findFirst({
      where: { assetId: 'GEN-AHM-001' },
      include: { building: true }
    });

    res.json({
      scenario: 'Demo Scenario 4 - Dynamic Risk Priority > Fixed Calendar Schedule',
      explanation: 'Demonstrates how GovBuild360 prioritizes Asset B (High Risk, 45d calendar remaining) ahead of Asset A (Low Risk, 7d calendar remaining).',
      comparison: [
        {
          assetId: assetA?.assetId || 'PMP-AHM-001',
          name: assetA?.name || 'Water Supply Pump 1',
          calendarDaysRemaining: 7,
          healthScore: 90,
          riskScore: 20,
          riskLevel: 'LOW',
          dynamicPriority: 'LOW',
          rankInQueue: 2
        },
        {
          assetId: assetB?.assetId || 'GEN-AHM-001',
          name: assetB?.name || 'Main Standby Diesel Generator',
          calendarDaysRemaining: 45,
          healthScore: 42,
          riskScore: 82,
          riskLevel: 'CRITICAL',
          dynamicPriority: 'URGENT',
          rankInQueue: 1,
          overrideReason: 'Risk-based priority escalated due to Health (42%) and Risk (82) despite 45 calendar days remaining!'
        }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
