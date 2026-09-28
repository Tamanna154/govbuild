import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// List buildings with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { district, type, status, search } = req.query;

    const where: any = {};
    if (district) where.district = String(district);
    if (type) where.type = String(type);
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { buildingId: { contains: String(search) } },
        { district: { contains: String(search) } },
        { taluka: { contains: String(search) } }
      ];
    }

    const buildings = await prisma.building.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: { assets: true, tickets: true, alerts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(buildings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Hierarchy tree
router.get('/hierarchy/tree', authenticateToken, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        regions: {
          include: {
            circles: {
              include: {
                divisions: {
                  include: {
                    subDivisions: {
                      include: {
                        buildings: {
                          select: { id: true, buildingId: true, name: true, type: true, currentHealthScore: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    res.json(departments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get building details by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const building = await prisma.building.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        region: true,
        circle: true,
        division: true,
        subDivision: true,
        systems: { include: { assets: true } },
        assets: {
          include: {
            warranties: true,
            amcContracts: true,
            _count: { select: { failures: true, tickets: true } }
          }
        },
        documents: true,
        tickets: { orderBy: { createdAt: 'desc' }, take: 10 },
        alerts: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.json(building);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List departments for dropdowns
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create building
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.name.trim()) {
      return res.status(400).json({ error: 'Building Name is required.' });
    }

    // Resolve departmentId (support UUID or code like 'DEPT-RNB')
    let deptId = data.departmentId;
    if (deptId) {
      const dept = await prisma.department.findFirst({
        where: {
          OR: [
            { id: deptId },
            { code: deptId }
          ]
        }
      });
      if (dept) {
        deptId = dept.id;
      } else {
        const firstDept = await prisma.department.findFirst();
        deptId = firstDept ? firstDept.id : undefined;
      }
    } else {
      const firstDept = await prisma.department.findFirst();
      deptId = firstDept ? firstDept.id : undefined;
    }

    // Fallback: If no department exists at all, create one
    if (!deptId) {
      const createdDept = await prisma.department.create({
        data: {
          code: 'DEPT-RNB',
          name: 'Roads & Buildings Department (R&B)',
          description: 'Government of Gujarat'
        }
      });
      deptId = createdDept.id;
    }

    const count = await prisma.building.count();
    const districtPrefix = (data.district || 'GUJ').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const buildingId = data.buildingId || `BLD-${districtPrefix}-${(count + 1).toString().padStart(3, '0')}`;

    const building = await prisma.building.create({
      data: {
        buildingId,
        name: data.name.trim(),
        type: data.type || 'Government Office',
        departmentId: deptId,
        regionId: data.regionId || null,
        circleId: data.circleId || null,
        divisionId: data.divisionId || null,
        subDivisionId: data.subDivisionId || null,
        district: data.district || 'Gandhinagar',
        taluka: data.taluka || data.district || 'Gandhinagar',
        address: data.address || `${data.name}, ${data.district || 'Gandhinagar'}, Gujarat`,
        latitude: parseFloat(data.latitude) || 23.0225,
        longitude: parseFloat(data.longitude) || 72.5714,
        constructionDate: data.constructionDate ? new Date(data.constructionDate) : null,
        constructionCost: data.constructionCost ? parseFloat(data.constructionCost) : null,
        builtUpArea: data.builtUpArea ? parseFloat(data.builtUpArea) : 25000,
        totalFloors: parseInt(data.totalFloors) || 4,
        contractor: data.contractor || 'Gujarat State Construction Corporation',
        architect: data.architect || null,
        structuralEngineer: data.structuralEngineer || null,
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
        responsibleOfficer: data.responsibleOfficer || 'Executive Engineer (R&B)',
        contactInfo: data.contactInfo || null,
        description: data.description || null,
        currentCondition: 'Good',
        currentHealthScore: 90
      }
    });

    await logAudit(req.user?.id, req.user?.name, 'CREATE', 'Building', building.id, null, building);

    res.status(201).json(building);
  } catch (err: any) {
    console.error('Error creating building:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update building
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const oldBuilding = await prisma.building.findUnique({ where: { id: req.params.id } });
    const building = await prisma.building.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logAudit(req.user?.id, req.user?.name, 'UPDATE', 'Building', building.id, oldBuilding, building);

    res.json(building);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
