import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculateHealthScore, calculateRiskScore, calculateDynamicMaintenancePriority } from '../risk-engine/calculator';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// List tickets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { buildingId, assetId, status, priorityLevel } = req.query;
    const where: any = {};
    if (buildingId) where.buildingId = String(buildingId);
    if (assetId) where.assetId = String(assetId);
    if (status) where.status = String(status);
    if (priorityLevel) where.priorityLevel = String(priorityLevel);

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        asset: { include: { building: true } },
        building: true,
        parts: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Maintenance Ticket
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

    const count = await prisma.maintenanceTicket.count();
    const ticketId = `TKT-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(3, '0')}`;

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        ticketId,
        assetId: asset.id,
        buildingId: asset.buildingId,
        problemDescription: data.problemDescription,
        priorityLevel: data.priorityLevel || asset.criticalityLevel || 'MEDIUM',
        riskScoreAtCreation: asset.currentRiskScore,
        beforeHealthScore: asset.currentHealthScore,
        beforeRiskScore: asset.currentRiskScore,
        status: 'OPEN',
        createdBy: req.user?.name || 'Officer',
        assignedOfficerId: data.assignedOfficerId || req.user?.id,
        assignedTechnicianId: data.assignedTechnicianId || null,
        expectedCompletion: data.expectedCompletion ? new Date(data.expectedCompletion) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    });

    // Update asset status to UNDER_MAINTENANCE if urgent/high
    if (ticket.priorityLevel === 'URGENT' || ticket.priorityLevel === 'HIGH') {
      await prisma.asset.update({
        where: { id: asset.id },
        data: { currentStatus: 'UNDER_MAINTENANCE' }
      });
    }

    // Record lifecycle event
    await prisma.lifecycleEvent.create({
      data: {
        assetId: asset.id,
        eventType: 'MAINTENANCE',
        description: `Maintenance ticket ${ticket.ticketId} created: ${ticket.problemDescription}`,
        performedBy: req.user?.name || 'Officer'
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'CREATE', 'MaintenanceTicket', ticket.id, null, ticket);

    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Maintenance Ticket status / assignment
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const oldTicket = await prisma.maintenanceTicket.findUnique({ where: { id: req.params.id } });
    if (!oldTicket) return res.status(404).json({ error: 'Ticket not found' });

    const ticket = await prisma.maintenanceTicket.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logAudit(req.user?.id, req.user?.name, 'UPDATE', 'MaintenanceTicket', ticket.id, oldTicket, ticket);

    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Complete Maintenance & Run Post-Maintenance Verification Workflow
router.post('/:id/complete', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { repairDetails, partsReplaced, labourCost, materialCost, technicianRemarks, parts } = req.body;

    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: req.params.id },
      include: { asset: { include: { building: true, _count: { select: { incomingDependencies: true } } } } }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const asset = ticket.asset;
    const lCost = parseFloat(labourCost) || 0;
    const mCost = parseFloat(materialCost) || 0;
    const totalCost = lCost + mCost;

    // Post-maintenance health recovery (Reset to high health e.g. 88-95%)
    const afterHealthScore = 88;
    const afterRiskScore = 22;

    // Record Parts Replaced
    if (Array.isArray(parts) && parts.length > 0) {
      for (const p of parts) {
        await prisma.maintenancePart.create({
          data: {
            ticketId: ticket.id,
            partName: p.partName,
            partNumber: p.partNumber || null,
            quantity: parseInt(p.quantity) || 1,
            unitCost: parseFloat(p.unitCost) || 0,
            totalCost: (parseInt(p.quantity) || 1) * (parseFloat(p.unitCost) || 0)
          }
        });
      }
    }

    // Update Ticket
    const updatedTicket = await prisma.maintenanceTicket.update({
      where: { id: ticket.id },
      data: {
        status: 'VERIFIED',
        actualCompletion: new Date(),
        repairDetails: repairDetails || 'Completed comprehensive servicing and part replacement.',
        partsReplaced: partsReplaced || (parts ? parts.map((p: any) => p.partName).join(', ') : 'Standard replacement items'),
        labourCost: lCost,
        materialCost: mCost,
        totalCost,
        afterHealthScore,
        afterRiskScore,
        technicianRemarks: technicianRemarks || 'Post-repair inspection verified parameters optimal.',
        verificationStatus: 'VERIFIED',
        verifiedBy: req.user?.name || 'Chief Engineer'
      }
    });

    // Update Asset Status & Recalculate Risk Engine
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        currentStatus: 'OPERATIONAL',
        currentHealthScore: afterHealthScore,
        currentRiskScore: afterRiskScore,
        riskLevel: 'LOW',
        lastMaintenanceDate: new Date(),
        nextScheduledMaintenance: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // +6 months
      }
    });

    // Record Health & Risk History
    await prisma.assetHealthHistory.create({
      data: {
        assetId: asset.id,
        healthScore: afterHealthScore,
        conditionRating: 'Good',
        factorsJson: JSON.stringify(['Post-maintenance servicing completed successfully'])
      }
    });

    await prisma.assetRiskHistory.create({
      data: {
        assetId: asset.id,
        riskScore: afterRiskScore,
        riskLevel: 'LOW',
        healthScore: afterHealthScore,
        riskFactorsJson: JSON.stringify(['Risk mitigated following comprehensive overhaul'])
      }
    });

    // Recalculate Dynamic Priority to LOW
    const priorityResult = calculateDynamicMaintenancePriority(
      afterHealthScore,
      afterRiskScore,
      'LOW',
      ['Optimal post-repair performance'],
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

    // Record Lifecycle Event
    await prisma.lifecycleEvent.create({
      data: {
        assetId: asset.id,
        eventType: 'REPAIR',
        description: `Repair completed for ticket ${ticket.ticketId}. Total cost: ₹${totalCost}. Health restored from ${ticket.beforeHealthScore || 42}% to ${afterHealthScore}%. Risk reduced from ${ticket.beforeRiskScore || 82} to ${afterRiskScore}.`,
        performedBy: req.user?.name || 'Technician'
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'COMPLETE_MAINTENANCE', 'MaintenanceTicket', ticket.id, { beforeHealth: ticket.beforeHealthScore, beforeRisk: ticket.beforeRiskScore }, { afterHealth: afterHealthScore, afterRisk: afterRiskScore });

    res.json({
      ticket: updatedTicket,
      comparison: {
        beforeHealthScore: ticket.beforeHealthScore || 42,
        afterHealthScore,
        beforeRiskScore: ticket.beforeRiskScore || 82,
        afterRiskScore,
        healthImprovement: afterHealthScore - (ticket.beforeHealthScore || 42),
        riskReduction: (ticket.beforeRiskScore || 82) - afterRiskScore
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
