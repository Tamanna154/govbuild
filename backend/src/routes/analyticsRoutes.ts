import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalBuildings = await prisma.building.count();
    const totalAssets = await prisma.asset.count();
    const operationalAssets = await prisma.asset.count({ where: { currentStatus: 'OPERATIONAL' } });
    const underMaintenance = await prisma.asset.count({ where: { currentStatus: 'UNDER_MAINTENANCE' } });
    const failedAssets = await prisma.asset.count({ where: { currentStatus: 'FAILED' } });
    const criticalAssets = await prisma.asset.count({ where: { OR: [{ currentHealthScore: { lte: 40 } }, { currentRiskScore: { gte: 80 } }] } });
    const highRiskAssets = await prisma.asset.count({ where: { currentRiskScore: { gte: 60 } } });

    const openTickets = await prisma.maintenanceTicket.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PARTS'] } } });

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringWarranties = await prisma.warranty.count({ where: { endDate: { lte: thirtyDaysLater, gte: now } } });
    const expiringAMCs = await prisma.aMCContract.count({ where: { endDate: { lte: thirtyDaysLater, gte: now } } });

    // Health Score breakdown
    const assets = await prisma.asset.findMany({ select: { currentHealthScore: true, currentRiskScore: true, category: true, purchaseCost: true } });
    const healthDistribution = {
      excellent: assets.filter(a => a.currentHealthScore >= 90).length,
      good: assets.filter(a => a.currentHealthScore >= 75 && a.currentHealthScore < 90).length,
      moderate: assets.filter(a => a.currentHealthScore >= 60 && a.currentHealthScore < 75).length,
      poor: assets.filter(a => a.currentHealthScore >= 40 && a.currentHealthScore < 60).length,
      critical: assets.filter(a => a.currentHealthScore < 40).length
    };

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    assets.forEach(a => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    // Recent Failures
    const recentFailures = await prisma.failureRecord.findMany({
      take: 5,
      orderBy: { failureDate: 'desc' },
      include: { asset: { include: { building: true } } }
    });

    res.json({
      metrics: {
        totalBuildings,
        totalAssets,
        operationalAssets,
        underMaintenance,
        failedAssets,
        criticalAssets,
        highRiskAssets,
        openTickets,
        expiringWarranties,
        expiringAMCs
      },
      healthDistribution,
      categoryCounts,
      recentFailures
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
