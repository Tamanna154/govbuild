import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// List Vendors
router.get('/', authenticateToken, async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: { select: { assets: true, warranties: true, amcContracts: true } }
      },
      orderBy: { companyName: 'asc' }
    });
    res.json(vendors);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Vendor Details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
      include: {
        assets: { include: { building: true } },
        warranties: true,
        amcContracts: true
      }
    });

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Vendor
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const count = await prisma.vendor.count();
    const vendorId = data.vendorId || `VND-${(count + 1).toString().padStart(3, '0')}`;

    const vendor = await prisma.vendor.create({
      data: {
        vendorId,
        companyName: data.companyName,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        serviceTypes: data.serviceTypes || null,
        performanceScore: data.performanceScore ? parseFloat(data.performanceScore) : 100,
        notes: data.notes || null
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'CREATE', 'Vendor', vendor.id, null, vendor);
    res.status(201).json(vendor);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
