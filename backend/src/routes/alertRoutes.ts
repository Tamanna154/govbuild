import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// List Alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { priority, isRead, buildingId } = req.query;
    const where: any = {};
    if (priority) where.priority = String(priority);
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (buildingId) where.buildingId = String(buildingId);

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        building: { select: { name: true, district: true } },
        asset: { select: { assetId: true, name: true, currentRiskScore: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.alert.count({ where: { isRead: false } });

    res.json({ alerts, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark alert as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(alert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
