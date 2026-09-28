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

    // Health Score breakdown with detailed assets for click drilldown
    const allAssetsForHealth = await prisma.asset.findMany({
      select: {
        id: true,
        assetId: true,
        name: true,
        currentHealthScore: true,
        currentRiskScore: true,
        currentStatus: true,
        category: true,
        building: { select: { name: true, district: true } }
      },
      orderBy: { currentHealthScore: 'asc' }
    });

    const healthBreakdownDetails = {
      excellent: allAssetsForHealth.filter(a => a.currentHealthScore >= 90),
      good: allAssetsForHealth.filter(a => a.currentHealthScore >= 75 && a.currentHealthScore < 90),
      moderate: allAssetsForHealth.filter(a => a.currentHealthScore >= 60 && a.currentHealthScore < 75),
      poor: allAssetsForHealth.filter(a => a.currentHealthScore >= 40 && a.currentHealthScore < 60),
      critical: allAssetsForHealth.filter(a => a.currentHealthScore < 40)
    };

    const healthDistribution = {
      excellent: healthBreakdownDetails.excellent.length,
      good: healthBreakdownDetails.good.length,
      moderate: healthBreakdownDetails.moderate.length,
      poor: healthBreakdownDetails.poor.length,
      critical: healthBreakdownDetails.critical.length
    };

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    allAssetsForHealth.forEach(a => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    // Recent Failures
    const recentFailures = await prisma.failureRecord.findMany({
      take: 5,
      orderBy: { failureDate: 'desc' },
      include: { asset: { include: { building: true } } }
    });

    // High Risk Priority Assets
    const priorityRiskAssets = await prisma.asset.findMany({
      where: { currentRiskScore: { gte: 50 } },
      orderBy: { currentRiskScore: 'desc' },
      take: 6,
      include: { building: true }
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
      healthBreakdownDetails,
      categoryCounts,
      recentFailures,
      priorityRiskAssets
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
