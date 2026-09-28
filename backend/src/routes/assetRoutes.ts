import { Router } from 'express';
import { prisma } from '../config/prisma';
import QRCode from 'qrcode';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculateHealthScore, calculateRiskScore, calculateDynamicMaintenancePriority } from '../risk-engine/calculator';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// List assets with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { buildingId, category, riskLevel, status, search } = req.query;

    const where: any = {};
    if (buildingId) where.buildingId = String(buildingId);
    if (category) where.category = String(category);
    if (riskLevel) where.riskLevel = String(riskLevel);
    if (status) where.currentStatus = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { assetId: { contains: String(search) } },
        { serialNumber: { contains: String(search) } },
        { manufacturer: { contains: String(search) } },
        { model: { contains: String(search) } }
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        building: { select: { id: true, buildingId: true, name: true, district: true } },
        system: { select: { id: true, name: true } },
        vendor: { select: { id: true, companyName: true } },
        warranties: { where: { status: 'ACTIVE' } },
        amcContracts: { where: { status: 'ACTIVE' } },
        _count: { select: { incomingDependencies: true, outgoingDependencies: true, failures: true } }
      },
      orderBy: { currentRiskScore: 'desc' }
    });

    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get asset by ID or assetId code
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findFirst({
      where: {
        OR: [{ id }, { assetId: id }]
      },
      include: {
        building: true,
        system: true,
        vendor: true,
        warranties: true,
        amcContracts: true,
        lifecycleEvents: { orderBy: { eventDate: 'desc' } },
        inspections: { orderBy: { inspectionDate: 'desc' }, take: 10 },
        healthHistory: { orderBy: { recordedAt: 'desc' }, take: 20 },
        riskHistory: { orderBy: { recordedAt: 'desc' }, take: 20 },
        maintenancePriorities: { orderBy: { generatedAt: 'desc' }, take: 1 },
        outgoingDependencies: { include: { dependentAsset: true } },
        incomingDependencies: { include: { sourceAsset: true } },
        tickets: { orderBy: { createdAt: 'desc' } },
        failures: { orderBy: { failureDate: 'desc' } },
        documents: true,
        alerts: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Generate QR code data URL if not present
    if (!asset.qrCodeUrl) {
      const qrData = JSON.stringify({
        assetId: asset.assetId,
        name: asset.name,
        building: asset.building.name,
        url: `/assets/${asset.assetId}`
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      await prisma.asset.update({
        where: { id: asset.id },
        data: { qrCodeUrl }
      });
      asset.qrCodeUrl = qrCodeUrl;
    }

    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new asset
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const categoryPrefix = data.category ? data.category.substring(0, 3).toUpperCase() : 'AST';
    const count = await prisma.asset.count();
    const assetId = data.assetId || `${categoryPrefix}-AHM-${(count + 1).toString().padStart(3, '0')}`;

    // QR Code generation
    const qrData = JSON.stringify({
      assetId,
      name: data.name,
      url: `/assets/${assetId}`
    });
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const asset = await prisma.asset.create({
      data: {
        assetId,
        name: data.name,
        category: data.category,
        type: data.type,
        buildingId: data.buildingId,
        systemId: data.systemId || null,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        serialNumber: data.serialNumber || null,
        vendorId: data.vendorId || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        installationDate: data.installationDate ? new Date(data.installationDate) : null,
        commissioningDate: data.commissioningDate ? new Date(data.commissioningDate) : null,
        purchaseCost: data.purchaseCost ? parseFloat(data.purchaseCost) : null,
        installationCost: data.installationCost ? parseFloat(data.installationCost) : null,
        warrantyStartDate: data.warrantyStartDate ? new Date(data.warrantyStartDate) : null,
        warrantyEndDate: data.warrantyEndDate ? new Date(data.warrantyEndDate) : null,
        amcStartDate: data.amcStartDate ? new Date(data.amcStartDate) : null,
        amcEndDate: data.amcEndDate ? new Date(data.amcEndDate) : null,
        expectedLifeYears: parseInt(data.expectedLifeYears) || 10,
        expectedEolDate: data.purchaseDate ? new Date(new Date(data.purchaseDate).setFullYear(new Date(data.purchaseDate).getFullYear() + (parseInt(data.expectedLifeYears) || 10))) : null,
        currentStatus: data.currentStatus || 'OPERATIONAL',
        currentHealthScore: parseFloat(data.currentHealthScore) || 100,
        currentRiskScore: parseFloat(data.currentRiskScore) || 0,
        riskLevel: data.currentRiskScore >= 80 ? 'CRITICAL' : data.currentRiskScore >= 60 ? 'HIGH' : data.currentRiskScore >= 31 ? 'MEDIUM' : 'LOW',
        criticalityLevel: data.criticalityLevel || 'MEDIUM',
        responsiblePerson: data.responsiblePerson || null,
        locationInBuilding: data.locationInBuilding || null,
        description: data.description || null,
        qrCodeUrl
      }
    });

    // Record initial Lifecycle Events
    await prisma.lifecycleEvent.createMany({
      data: [
        {
          assetId: asset.id,
          eventType: 'PURCHASED',
          eventDate: asset.purchaseDate || new Date(),
          description: `Procured from vendor/supplier`,
          performedBy: req.user?.name || 'System Admin',
          newStatus: 'PURCHASED'
        },
        {
          assetId: asset.id,
          eventType: 'INSTALLED',
          eventDate: asset.installationDate || new Date(),
          description: `Installed at ${asset.locationInBuilding || 'building location'}`,
          performedBy: req.user?.name || 'System Admin',
          newStatus: 'INSTALLED'
        },
        {
          assetId: asset.id,
          eventType: 'COMMISSIONED',
          eventDate: asset.commissioningDate || new Date(),
          description: `Commissioned and operational`,
          performedBy: req.user?.name || 'System Admin',
          newStatus: 'OPERATIONAL'
        }
      ]
    });

    // Initial Health & Risk History recording
    await prisma.assetHealthHistory.create({
      data: {
        assetId: asset.id,
        healthScore: asset.currentHealthScore,
        conditionRating: 'Good',
        factorsJson: JSON.stringify(['Asset registered & commissioned into service'])
      }
    });

    await prisma.assetRiskHistory.create({
      data: {
        assetId: asset.id,
        riskScore: asset.currentRiskScore,
        riskLevel: asset.riskLevel,
        healthScore: asset.currentHealthScore,
        riskFactorsJson: JSON.stringify(['Initial commissioning risk evaluation'])
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'CREATE', 'Asset', asset.id, null, asset);

    res.status(201).json(asset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update asset
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const oldAsset = await prisma.asset.findUnique({ where: { id: req.params.id } });
    if (!oldAsset) return res.status(404).json({ error: 'Asset not found' });

    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logAudit(req.user?.id, req.user?.name, 'UPDATE', 'Asset', asset.id, oldAsset, asset);

    res.json(asset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
