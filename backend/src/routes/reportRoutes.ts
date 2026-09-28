import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Building Asset Register Report
router.get('/asset-register', authenticateToken, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        building: true,
        system: true,
        vendor: true,
        warranties: true,
        amcContracts: true
      },
      orderBy: { assetId: 'asc' }
    });
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Risk & Health Report
router.get('/risk-report', authenticateToken, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { currentRiskScore: { gte: 30 } },
      include: {
        building: true,
        maintenancePriorities: { orderBy: { generatedAt: 'desc' }, take: 1 },
        _count: { select: { failures: true, incomingDependencies: true } }
      },
      orderBy: { currentRiskScore: 'desc' }
    });
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Maintenance & Cost Report
router.get('/maintenance-cost', authenticateToken, async (req, res) => {
  try {
    const tickets = await prisma.maintenanceTicket.findMany({
      include: {
        asset: { include: { building: true } },
        parts: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalLabour = tickets.reduce((sum, t) => sum + (t.labourCost || 0), 0);
    const totalMaterial = tickets.reduce((sum, t) => sum + (t.materialCost || 0), 0);
    const grandTotal = totalLabour + totalMaterial;

    res.json({
      tickets,
      summary: {
        totalTickets: tickets.length,
        totalLabourCost: totalLabour,
        totalMaterialCost: totalMaterial,
        grandTotalCost: grandTotal
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
