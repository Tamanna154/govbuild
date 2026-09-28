import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get asset lifecycle timeline history
router.get('/:assetId', authenticateToken, async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: assetId }, { assetId }] }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const events = await prisma.lifecycleEvent.findMany({
      where: { assetId: asset.id },
      orderBy: { eventDate: 'desc' }
    });

    res.json({
      assetId: asset.assetId,
      name: asset.name,
      currentStatus: asset.currentStatus,
      events
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
