import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// List Warranties
router.get('/warranties', authenticateToken, async (req, res) => {
  try {
    const warranties = await prisma.warranty.findMany({
      include: {
        asset: { include: { building: true } },
        vendor: true
      },
      orderBy: { endDate: 'asc' }
    });
    res.json(warranties);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Warranty
router.post('/warranties', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const warranty = await prisma.warranty.create({
      data: {
        assetId: data.assetId,
        vendorId: data.vendorId || null,
        providerName: data.providerName,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        terms: data.terms || null,
        coveredComponents: data.coveredComponents || null,
        status: data.status || 'ACTIVE'
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'CREATE', 'Warranty', warranty.id, null, warranty);
    res.status(201).json(warranty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List AMCs
router.get('/amc', authenticateToken, async (req, res) => {
  try {
    const contracts = await prisma.aMCContract.findMany({
      include: {
        asset: { include: { building: true } },
        vendor: true
      },
      orderBy: { endDate: 'asc' }
    });
    res.json(contracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create AMC
router.post('/amc', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const count = await prisma.aMCContract.count();
    const contractNumber = data.contractNumber || `AMC-2026-${(count + 1).toString().padStart(3, '0')}`;

    const amc = await prisma.aMCContract.create({
      data: {
        contractNumber,
        assetId: data.assetId,
        vendorId: data.vendorId || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        contractValue: data.contractValue ? parseFloat(data.contractValue) : null,
        serviceFrequency: data.serviceFrequency || 'Quarterly',
        slaDetails: data.slaDetails || '24h Emergency Onsite Response',
        status: data.status || 'ACTIVE'
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'CREATE', 'AMCContract', amc.id, null, amc);
    res.status(201).json(amc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
