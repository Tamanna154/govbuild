import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GovBuild360 Database with realistic Gujarat R&B Infrastructure Data...');

  // 1. Clean existing records safely
  await prisma.sensorReading.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.maintenancePart.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.assetDependency.deleteMany();
  await prisma.maintenancePriority.deleteMany();
  await prisma.assetRiskHistory.deleteMany();
  await prisma.assetHealthHistory.deleteMany();
  await prisma.inspectionMeasurement.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.lifecycleEvent.deleteMany();
  await prisma.failureRecord.deleteMany();
  await prisma.aMCContract.deleteMany();
  await prisma.warranty.deleteMany();
  await prisma.document.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.buildingSystem.deleteMany();
  await prisma.building.deleteMany();
  await prisma.subDivision.deleteMany();
  await prisma.division.deleteMany();
  await prisma.circle.deleteMany();
  await prisma.region.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.department.deleteMany();

  console.log('✅ Cleaned previous database state.');

  // 2. Departments & Hierarchy
  const deptRnb = await prisma.department.create({
    data: {
      code: 'DEPT-RNB',
      name: 'Roads & Buildings Department (R&B), Govt of Gujarat',
      description: 'Primary infrastructure development and public maintenance authority of Gujarat.'
    }
  });

  const deptEm = await prisma.department.create({
    data: {
      code: 'DEPT-EM',
      name: 'Electrical & Mechanical Wing (R&B)',
      description: 'Specialized wing responsible for electrical equipment, HVAC, lifts, solar, generators, and heavy machinery.'
    }
  });

  const regionAhm = await prisma.region.create({
    data: { code: 'REG-AHM', name: 'Ahmedabad Region', departmentId: deptRnb.id }
  });

  const regionGnd = await prisma.region.create({
    data: { code: 'REG-GND', name: 'Gandhinagar Capital Region', departmentId: deptRnb.id }
  });

  const circleCapital = await prisma.circle.create({
    data: { code: 'CIR-CAP', name: 'Capital Circle 1', regionId: regionGnd.id }
  });

  const circleAhm = await prisma.circle.create({
    data: { code: 'CIR-AHM', name: 'Ahmedabad R&B Circle', regionId: regionAhm.id }
  });

  const divGnd = await prisma.division.create({
    data: { code: 'DIV-GND-1', name: 'Gandhinagar Capital Division 1', circleId: circleCapital.id }
  });

  const divAhm = await prisma.division.create({
    data: { code: 'DIV-AHM-1', name: 'Ahmedabad City Division', circleId: circleAhm.id }
  });

  const subDiv1 = await prisma.subDivision.create({
    data: { code: 'SUB-GND-1', name: 'Secretariat Sub-Division', divisionId: divGnd.id }
  });

  const subDiv2 = await prisma.subDivision.create({
    data: { code: 'SUB-AHM-1', name: 'Civil & Medical Sub-Division', divisionId: divAhm.id }
  });

  // 3. Demo Users
  const passwordHash = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Shri Rajesh Patel',
      email: 'admin@rnb.gujarat.gov.in',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      departmentId: deptRnb.id,
      designation: 'Chief Engineer & Technical Secretary',
      phone: '+91 98250 11223'
    }
  });

  const deptAdmin = await prisma.user.create({
    data: {
      name: 'Er. Suresh Mehta',
      email: 'dept.admin@rnb.gujarat.gov.in',
      password: passwordHash,
      role: 'DEPT_ADMIN',
      departmentId: deptEm.id,
      designation: 'Superintending Engineer (E&M)',
      phone: '+91 98250 44556'
    }
  });

  const engineer = await prisma.user.create({
    data: {
      name: 'Er. Vikram Shah',
      email: 'engineer@rnb.gujarat.gov.in',
      password: passwordHash,
      role: 'ENGINEER',
      departmentId: deptEm.id,
      designation: 'Executive Engineer (Mechanical)',
      phone: '+91 98250 77889'
    }
  });

  const inspector = await prisma.user.create({
    data: {
      name: 'Dipak Parmar',
      email: 'inspector@rnb.gujarat.gov.in',
      password: passwordHash,
      role: 'INSPECTOR',
      departmentId: deptRnb.id,
      designation: 'Assistant Quality Inspector',
      phone: '+91 98250 99001'
    }
  });

  const technician = await prisma.user.create({
    data: {
      name: 'Mahesh Solanki',
      email: 'technician@rnb.gujarat.gov.in',
      password: passwordHash,
      role: 'TECHNICIAN',
      departmentId: deptEm.id,
      designation: 'Senior Electrical Technician',
      phone: '+91 98250 33445'
    }
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Smt. Anjali Joshi',
      email: 'viewer@rnb.gujarat.gov.in',
      password: passwordHash,
      role: 'VIEWER',
      departmentId: deptRnb.id,
      designation: 'Additional Chief Secretary (Monitoring)',
      phone: '+91 98250 55667'
    }
  });

  console.log('✅ Demo user accounts created.');

  // 4. Vendors
  const vendorSiemens = await prisma.vendor.create({
    data: {
      vendorId: 'VND-001',
      companyName: 'Siemens India Ltd - Power Division',
      contactPerson: 'Karan Sharma',
      email: 'support@siemens.co.in',
      phone: '+91 79 2658 9000',
      address: 'CG Road, Ahmedabad',
      serviceTypes: 'Transformers, Switchgear, ATS Panels',
      performanceScore: 94
    }
  });

  const vendorKirloskar = await prisma.vendor.create({
    data: {
      vendorId: 'VND-002',
      companyName: 'Kirloskar Brothers Heavy Machinery Ltd',
      contactPerson: 'Amit Chaudhari',
      email: 'service@kirloskar.com',
      phone: '+91 79 4000 1200',
      address: 'GIDC Naroda, Ahmedabad',
      serviceTypes: 'High Discharge Water Pumps, Motors',
      performanceScore: 91
    }
  });

  const vendorOtis = await prisma.vendor.create({
    data: {
      vendorId: 'VND-003',
      companyName: 'Otis Elevator Company India Ltd',
      contactPerson: 'Ravi Desai',
      email: 'gujarat@otis.com',
      phone: '+91 79 6631 8888',
      address: 'SG Highway, Ahmedabad',
      serviceTypes: 'Elevators, Escalators, Vertical Transport',
      performanceScore: 96
    }
  });

  const vendorVoltas = await prisma.vendor.create({
    data: {
      vendorId: 'VND-004',
      companyName: 'Voltas Electro-Mechanical Solutions Ltd',
      contactPerson: 'Pravin Rana',
      email: 'service@voltas.com',
      phone: '+91 79 2754 3300',
      address: 'Ashram Road, Ahmedabad',
      serviceTypes: 'Central HVAC Chillers, Air Conditioners',
      performanceScore: 88
    }
  });

  // 5. 10 Government Buildings
  const buildingsData = [
    {
      buildingId: 'BLD-GND-001',
      name: 'Gujarat Swarnim Sankul 1 (CM & Cabinet Secretariat)',
      type: 'Government Office',
      departmentId: deptRnb.id,
      regionId: regionGnd.id,
      circleId: circleCapital.id,
      divisionId: divGnd.id,
      subDivisionId: subDiv1.id,
      district: 'Gandhinagar',
      taluka: 'Gandhinagar',
      address: 'Sector 10, Secretariat Complex, Gandhinagar, Gujarat 382010',
      latitude: 23.2238,
      longitude: 72.6499,
      constructionDate: new Date('2014-04-14'),
      constructionCost: 1450000000,
      builtUpArea: 48500,
      totalFloors: 5,
      contractor: 'Larsen & Toubro Construction',
      architect: 'HCP Design & Project Management',
      structuralEngineer: 'VMS Consultants',
      completionDate: new Date('2014-03-31'),
      currentCondition: 'Good',
      currentHealthScore: 86,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Vikram Shah',
      contactInfo: '+91 79 2325 0001',
      description: 'Primary apex executive headquarters housing Chief Minister and Cabinet Ministers.'
    },
    {
      buildingId: 'BLD-GND-002',
      name: 'Gujarat Swarnim Sankul 2 (Secretariat Annex)',
      type: 'Government Office',
      departmentId: deptRnb.id,
      regionId: regionGnd.id,
      circleId: circleCapital.id,
      divisionId: divGnd.id,
      subDivisionId: subDiv1.id,
      district: 'Gandhinagar',
      taluka: 'Gandhinagar',
      address: 'Sector 10, Secretariat Complex, Gandhinagar, Gujarat 382010',
      latitude: 23.2245,
      longitude: 72.6512,
      constructionDate: new Date('2015-08-15'),
      constructionCost: 1100000000,
      builtUpArea: 42000,
      totalFloors: 5,
      contractor: 'Shapoorji Pallonji Ltd',
      architect: 'HCP Design',
      completionDate: new Date('2015-07-20'),
      currentCondition: 'Good',
      currentHealthScore: 92,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Vikram Shah'
    },
    {
      buildingId: 'BLD-AHM-001',
      name: 'District Collectorate Office Complex, Ahmedabad',
      type: 'Collector Office',
      departmentId: deptRnb.id,
      regionId: regionAhm.id,
      circleId: circleAhm.id,
      divisionId: divAhm.id,
      subDivisionId: subDiv2.id,
      district: 'Ahmedabad',
      taluka: 'Ahmedabad City',
      address: 'Near Subhash Bridge, Ashram Road, Ahmedabad, Gujarat 380027',
      latitude: 23.0560,
      longitude: 72.5802,
      constructionDate: new Date('2008-01-10'),
      constructionCost: 450000000,
      builtUpArea: 24000,
      totalFloors: 4,
      contractor: 'Gujarat State Construction Ltd',
      completionDate: new Date('2007-12-15'),
      currentCondition: 'Moderate',
      currentHealthScore: 78,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Suresh Mehta'
    },
    {
      buildingId: 'BLD-AHM-002',
      name: 'Gujarat High Court Complex',
      type: 'Court Building',
      departmentId: deptRnb.id,
      regionId: regionAhm.id,
      circleId: circleAhm.id,
      divisionId: divAhm.id,
      subDivisionId: subDiv2.id,
      district: 'Ahmedabad',
      taluka: 'Ghatlodiya',
      address: 'Sola Road, SG Highway, Ahmedabad, Gujarat 380060',
      latitude: 23.0805,
      longitude: 72.5255,
      constructionDate: new Date('1999-01-16'),
      constructionCost: 890000000,
      builtUpArea: 65000,
      totalFloors: 4,
      contractor: 'Ahluwalia Contracts Ltd',
      completionDate: new Date('1998-11-30'),
      currentCondition: 'Good',
      currentHealthScore: 84,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Suresh Mehta'
    },
    {
      buildingId: 'BLD-AHM-003',
      name: 'Civil Hospital & Apex Trauma Centre',
      type: 'Government Hospital',
      departmentId: deptRnb.id,
      regionId: regionAhm.id,
      circleId: circleAhm.id,
      divisionId: divAhm.id,
      subDivisionId: subDiv2.id,
      district: 'Ahmedabad',
      taluka: 'Asarwa',
      address: 'Asarwa, Ahmedabad, Gujarat 380016',
      latitude: 23.0520,
      longitude: 72.6022,
      constructionDate: new Date('2012-05-01'),
      constructionCost: 2800000000,
      builtUpArea: 120000,
      totalFloors: 8,
      contractor: 'L&T Healthcare Infrastructure',
      completionDate: new Date('2012-04-10'),
      currentCondition: 'Good',
      currentHealthScore: 89,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Vikram Shah'
    },
    {
      buildingId: 'BLD-GND-003',
      name: 'Gujarat Institute of Disaster Management (GIDM)',
      type: 'Training Centre',
      departmentId: deptRnb.id,
      regionId: regionGnd.id,
      circleId: circleCapital.id,
      divisionId: divGnd.id,
      subDivisionId: subDiv1.id,
      district: 'Gandhinagar',
      taluka: 'Gandhinagar',
      address: 'Raisan, Gandhinagar, Gujarat 382007',
      latitude: 23.1812,
      longitude: 72.6270,
      constructionDate: new Date('2016-02-10'),
      constructionCost: 350000000,
      builtUpArea: 18500,
      totalFloors: 3,
      contractor: 'PSP Projects Ltd',
      completionDate: new Date('2016-01-20'),
      currentCondition: 'Good',
      currentHealthScore: 94,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Suresh Mehta'
    },
    {
      buildingId: 'BLD-GND-004',
      name: 'Government Engineering College (GEC) Main Block',
      type: 'Government College',
      departmentId: deptRnb.id,
      regionId: regionGnd.id,
      circleId: circleCapital.id,
      divisionId: divGnd.id,
      subDivisionId: subDiv1.id,
      district: 'Gandhinagar',
      taluka: 'Gandhinagar',
      address: 'Sector 28, Gandhinagar, Gujarat 382028',
      latitude: 23.2450,
      longitude: 72.6580,
      constructionDate: new Date('2005-07-01'),
      constructionCost: 220000000,
      builtUpArea: 28000,
      totalFloors: 3,
      contractor: 'R&B Construction Division',
      completionDate: new Date('2005-06-15'),
      currentCondition: 'Moderate',
      currentHealthScore: 72,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Vikram Shah'
    },
    {
      buildingId: 'BLD-AHM-004',
      name: 'R&B Quality Control Laboratory & Material Store',
      type: 'Government Office',
      departmentId: deptRnb.id,
      regionId: regionAhm.id,
      circleId: circleAhm.id,
      divisionId: divAhm.id,
      subDivisionId: subDiv2.id,
      district: 'Ahmedabad',
      taluka: 'Asarwa',
      address: 'Subhash Bridge End, Asarwa, Ahmedabad 380016',
      latitude: 23.0580,
      longitude: 72.5850,
      constructionDate: new Date('2010-03-20'),
      constructionCost: 150000000,
      builtUpArea: 12500,
      totalFloors: 2,
      contractor: 'Gujarat Civil Infra',
      completionDate: new Date('2010-02-28'),
      currentCondition: 'Good',
      currentHealthScore: 81,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Suresh Mehta'
    },
    {
      buildingId: 'BLD-VAD-001',
      name: 'Vadodara Circuit House & State Guest House',
      type: 'Government Guest House',
      departmentId: deptRnb.id,
      regionId: regionAhm.id,
      circleId: circleAhm.id,
      divisionId: divAhm.id,
      subDivisionId: subDiv2.id,
      district: 'Vadodara',
      taluka: 'Vadodara',
      address: 'Alkapuri, Vadodara, Gujarat 390007',
      latitude: 22.3100,
      longitude: 73.1700,
      constructionDate: new Date('2018-11-10'),
      constructionCost: 410000000,
      builtUpArea: 22000,
      totalFloors: 4,
      contractor: 'Cube Construction Ltd',
      completionDate: new Date('2018-10-01'),
      currentCondition: 'Good',
      currentHealthScore: 90,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Suresh Mehta'
    },
    {
      buildingId: 'BLD-SUR-001',
      name: 'Surat District Administrative Complex',
      type: 'Government Office',
      departmentId: deptRnb.id,
      regionId: regionAhm.id,
      circleId: circleAhm.id,
      divisionId: divAhm.id,
      subDivisionId: subDiv2.id,
      district: 'Surat',
      taluka: 'Surat City',
      address: 'Nanpura, Surat, Gujarat 395001',
      latitude: 21.1959,
      longitude: 72.8184,
      constructionDate: new Date('2013-09-15'),
      constructionCost: 680000000,
      builtUpArea: 38000,
      totalFloors: 6,
      contractor: 'Jayanti Construction',
      completionDate: new Date('2013-08-20'),
      currentCondition: 'Good',
      currentHealthScore: 85,
      status: 'ACTIVE',
      responsibleOfficer: 'Er. Vikram Shah'
    }
  ];

  const createdBuildings: any[] = [];
  for (const b of buildingsData) {
    const created = await prisma.building.create({ data: b });
    createdBuildings.push(created);
  }

  console.log(`✅ Created ${createdBuildings.length} government buildings.`);

  // 6. Building Systems
  const b1 = createdBuildings[0];

  const sysElec = await prisma.buildingSystem.create({
    data: { systemCode: 'SYS-ELE-01', name: 'Main Power Distribution & Back-up System', category: 'Electrical', buildingId: b1.id }
  });

  const sysHvac = await prisma.buildingSystem.create({
    data: { systemCode: 'SYS-HVC-01', name: 'Central Air Conditioning & Chiller System', category: 'Mechanical', buildingId: b1.id }
  });

  const sysWater = await prisma.buildingSystem.create({
    data: { systemCode: 'SYS-WTR-01', name: 'Building Hydro-Pneumatic Water Supply System', category: 'Utility', buildingId: b1.id }
  });

  // 7. Key Assets
  const qrGen = await QRCode.toDataURL(JSON.stringify({ assetId: 'GEN-AHM-001', name: 'Main Emergency Diesel Generator 750 kVA', url: '/assets/GEN-AHM-001' }));

  const gen001 = await prisma.asset.create({
    data: {
      assetId: 'GEN-AHM-001',
      name: 'Main Emergency Diesel Generator 750 kVA',
      category: 'Electrical',
      type: 'Generator',
      buildingId: b1.id,
      systemId: sysElec.id,
      manufacturer: 'Cummins India Heavy Diesel',
      model: 'QSK23-G3',
      serialNumber: 'CUM-2021-998822',
      vendorId: vendorSiemens.id,
      purchaseDate: new Date('2021-03-15'),
      installationDate: new Date('2021-04-01'),
      commissioningDate: new Date('2021-04-10'),
      purchaseCost: 4800000,
      installationCost: 350000,
      warrantyStartDate: new Date('2021-04-10'),
      warrantyEndDate: new Date('2023-04-10'),
      amcStartDate: new Date('2023-05-01'),
      amcEndDate: new Date('2026-04-30'),
      expectedLifeYears: 15,
      expectedEolDate: new Date('2036-04-01'),
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 42,
      currentRiskScore: 82,
      riskLevel: 'CRITICAL',
      criticalityLevel: 'URGENT',
      lastInspectionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextScheduledInspection: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastMaintenanceDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      nextScheduledMaintenance: new Date('2026-12-20'),
      responsiblePerson: 'Er. Vikram Shah',
      locationInBuilding: 'Basement Substation Room B-04',
      description: 'Primary emergency back-up generator powering Chief Minister executive wing and IT server room during grid outages.',
      qrCodeUrl: qrGen
    }
  });

  const qrAts = await QRCode.toDataURL(JSON.stringify({ assetId: 'ATS-AHM-001', name: 'Automatic Transfer Switch (ATS) 1250A', url: '/assets/ATS-AHM-001' }));
  const ats001 = await prisma.asset.create({
    data: {
      assetId: 'ATS-AHM-001',
      name: 'Automatic Transfer Switch (ATS) 1250A',
      category: 'Electrical',
      type: 'Electrical Panel',
      buildingId: b1.id,
      systemId: sysElec.id,
      manufacturer: 'Siemens Energy',
      model: '3KC4 1250A',
      serialNumber: 'SIE-ATS-4411',
      vendorId: vendorSiemens.id,
      purchaseDate: new Date('2021-03-20'),
      installationDate: new Date('2021-04-05'),
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 88,
      currentRiskScore: 25,
      riskLevel: 'LOW',
      criticalityLevel: 'HIGH',
      responsiblePerson: 'Mahesh Solanki',
      locationInBuilding: 'Electrical Panel Room B-02',
      qrCodeUrl: qrAts
    }
  });

  const qrPnl = await QRCode.toDataURL(JSON.stringify({ assetId: 'PNL-AHM-001', name: 'Emergency Power Main Distribution Panel', url: '/assets/PNL-AHM-001' }));
  const pnl001 = await prisma.asset.create({
    data: {
      assetId: 'PNL-AHM-001',
      name: 'Emergency Power Main Distribution Panel',
      category: 'Electrical',
      type: 'Electrical Panel',
      buildingId: b1.id,
      systemId: sysElec.id,
      manufacturer: 'L&T Switchgear',
      model: 'MDB-750-EMG',
      serialNumber: 'LT-PNL-8821',
      vendorId: vendorSiemens.id,
      purchaseDate: new Date('2021-03-22'),
      installationDate: new Date('2021-04-06'),
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 90,
      currentRiskScore: 18,
      riskLevel: 'LOW',
      criticalityLevel: 'HIGH',
      locationInBuilding: 'Electrical Panel Room B-02',
      qrCodeUrl: qrPnl
    }
  });

  const qrLgt = await QRCode.toDataURL(JSON.stringify({ assetId: 'LGT-AHM-001', name: 'Cabinet Wing Emergency Lighting & UPS Bus', url: '/assets/LGT-AHM-001' }));
  const lgt001 = await prisma.asset.create({
    data: {
      assetId: 'LGT-AHM-001',
      name: 'Cabinet Wing Emergency Lighting & UPS Bus',
      category: 'Electrical',
      type: 'Emergency System',
      buildingId: b1.id,
      systemId: sysElec.id,
      manufacturer: 'Schneider Electric',
      model: 'EL-BUS-200A',
      serialNumber: 'SCH-EMG-102',
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 95,
      currentRiskScore: 12,
      riskLevel: 'LOW',
      criticalityLevel: 'HIGH',
      locationInBuilding: 'Ground Floor & Floor 1 Executive Wings',
      qrCodeUrl: qrLgt
    }
  });

  const tenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const qrLift = await QRCode.toDataURL(JSON.stringify({ assetId: 'LFT-AHM-001', name: 'Executive Passenger Lift No. 1 (Otis)', url: '/assets/LFT-AHM-001' }));
  const lift001 = await prisma.asset.create({
    data: {
      assetId: 'LFT-AHM-001',
      name: 'Executive Passenger Lift No. 1 (Otis)',
      category: 'Mechanical',
      type: 'Lift',
      buildingId: b1.id,
      manufacturer: 'Otis Elevator Co',
      model: 'Gen2 Premier 13-Person',
      serialNumber: 'OTIS-LFT-9901',
      vendorId: vendorOtis.id,
      purchaseDate: new Date('2021-01-10'),
      installationDate: new Date('2021-02-15'),
      warrantyStartDate: new Date('2021-02-15'),
      warrantyEndDate: tenDays,
      expectedLifeYears: 20,
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 92,
      currentRiskScore: 28,
      riskLevel: 'LOW',
      criticalityLevel: 'HIGH',
      responsiblePerson: 'Er. Vikram Shah',
      locationInBuilding: 'Central Atrium Shaft A',
      qrCodeUrl: qrLift
    }
  });

  const qrPmp = await QRCode.toDataURL(JSON.stringify({ assetId: 'PMP-AHM-001', name: 'Primary Hydro-Pneumatic Water Pump 25 HP', url: '/assets/PMP-AHM-001' }));
  const pmp001 = await prisma.asset.create({
    data: {
      assetId: 'PMP-AHM-001',
      name: 'Primary Hydro-Pneumatic Water Pump 25 HP',
      category: 'Utility',
      type: 'Water Pump',
      buildingId: b1.id,
      systemId: sysWater.id,
      manufacturer: 'Kirloskar Brothers',
      model: 'DB-100/26',
      serialNumber: 'KIR-PMP-5544',
      vendorId: vendorKirloskar.id,
      purchaseDate: new Date('2020-05-10'),
      installationDate: new Date('2020-06-01'),
      lastMaintenanceDate: new Date(Date.now() - 173 * 24 * 60 * 60 * 1000),
      nextScheduledMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      currentStatus: 'OPERATIONAL',
      currentHealthScore: 90,
      currentRiskScore: 20,
      riskLevel: 'LOW',
      criticalityLevel: 'MEDIUM',
      locationInBuilding: 'Pump Room B-01',
      qrCodeUrl: qrPmp
    }
  });

  // Additional assets with guaranteed unique asset IDs
  const categories = [
    { cat: 'Electrical', type: 'Transformer', mfr: 'Siemens' },
    { cat: 'Electrical', type: 'Solar System', mfr: 'Tata Power Solar' },
    { cat: 'Mechanical', type: 'HVAC', mfr: 'Voltas' },
    { cat: 'Mechanical', type: 'Air Conditioner', mfr: 'Daikin' },
    { cat: 'Safety', type: 'Fire System', mfr: 'Honeywell' },
    { cat: 'Security', type: 'CCTV', mfr: 'Hikvision' },
    { cat: 'IT / Communication', type: 'UPS', mfr: 'APC Schneider' }
  ];

  let assetSeq = 100;
  for (let i = 0; i < createdBuildings.length; i++) {
    const bld = createdBuildings[i];
    for (let j = 0; j < 5; j++) {
      assetSeq++;
      const catObj = categories[(i + j) % categories.length];
      const code = `${catObj.cat.substring(0, 3).toUpperCase()}-${bld.district.substring(0, 3).toUpperCase()}-${assetSeq}`;
      const qr = await QRCode.toDataURL(JSON.stringify({ assetId: code, name: `${catObj.type} Unit ${j + 1}`, url: `/assets/${code}` }));
      const health = Math.floor(Math.random() * 35) + 65;
      const risk = Math.floor((100 - health) * 0.8);

      await prisma.asset.create({
        data: {
          assetId: code,
          name: `${catObj.type} Assembly Unit ${j + 1} (${bld.district})`,
          category: catObj.cat,
          type: catObj.type,
          buildingId: bld.id,
          manufacturer: catObj.mfr,
          model: `MOD-2022-${i}${j}`,
          serialNumber: `SN-${i}${j}-${assetSeq}`,
          vendorId: vendorSiemens.id,
          purchaseDate: new Date(2021, i % 12, 15),
          installationDate: new Date(2021, (i + 1) % 12, 1),
          currentStatus: 'OPERATIONAL',
          currentHealthScore: health,
          currentRiskScore: risk,
          riskLevel: risk >= 60 ? 'HIGH' : risk >= 31 ? 'MEDIUM' : 'LOW',
          criticalityLevel: 'MEDIUM',
          responsiblePerson: 'Er. Suresh Mehta',
          locationInBuilding: `Floor ${(j % 4) + 1} Equipment Bay`,
          qrCodeUrl: qr
        }
      });
    }
  }

  console.log('✅ Created 55 realistic infrastructure assets.');

  // 8. Dependencies
  await prisma.assetDependency.create({
    data: {
      sourceAssetId: gen001.id,
      dependentAssetId: ats001.id,
      relationshipType: 'POWER',
      criticality: 'CRITICAL',
      description: 'ATS automatically selects Emergency Generator input upon main grid loss.'
    }
  });

  await prisma.assetDependency.create({
    data: {
      sourceAssetId: ats001.id,
      dependentAssetId: pnl001.id,
      relationshipType: 'POWER',
      criticality: 'CRITICAL',
      description: 'Feeds Emergency Power Main Distribution Panel.'
    }
  });

  await prisma.assetDependency.create({
    data: {
      sourceAssetId: pnl001.id,
      dependentAssetId: lgt001.id,
      relationshipType: 'POWER',
      criticality: 'HIGH',
      description: 'Feeds Cabinet Wing Emergency Lighting & Server Room Power.'
    }
  });

  await prisma.assetDependency.create({
    data: {
      sourceAssetId: pmp001.id,
      dependentAssetId: gen001.id,
      relationshipType: 'COOLING',
      criticality: 'HIGH',
      description: 'Cooling jacket water circulation pump feed.'
    }
  });

  // 9. Warranties & AMC
  await prisma.warranty.create({
    data: {
      assetId: lift001.id,
      vendorId: vendorOtis.id,
      providerName: 'Otis Elevator Company India Ltd',
      startDate: new Date('2021-02-15'),
      endDate: tenDays,
      terms: 'Full comprehensive coverage including motor, wire ropes, and electronic drive boards.',
      coveredComponents: 'Traction Motor, Inverter, Controller Board, Door Operator',
      status: 'ACTIVE'
    }
  });

  await prisma.aMCContract.create({
    data: {
      contractNumber: 'AMC-2024-CUMM-01',
      assetId: gen001.id,
      vendorId: vendorSiemens.id,
      startDate: new Date('2023-05-01'),
      endDate: new Date('2026-04-30'),
      contractValue: 180000,
      serviceFrequency: 'Quarterly',
      slaDetails: '4-hour onsite response time during critical grid failures.',
      status: 'ACTIVE'
    }
  });

  // 10. Histories
  const dates = [
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  ];

  await prisma.assetHealthHistory.createMany({
    data: [
      { assetId: gen001.id, healthScore: 78, conditionRating: 'Good', recordedAt: dates[0], factorsJson: JSON.stringify(['Normal quarterly check']) },
      { assetId: gen001.id, healthScore: 58, conditionRating: 'Poor', recordedAt: dates[1], factorsJson: JSON.stringify(['Vibration elevation observed']) },
      { assetId: gen001.id, healthScore: 42, conditionRating: 'Critical', recordedAt: dates[2], factorsJson: JSON.stringify(['High temperature and 4.8 mm/s vibration anomaly']) }
    ]
  });

  await prisma.assetRiskHistory.createMany({
    data: [
      { assetId: gen001.id, riskScore: 48, riskLevel: 'MEDIUM', healthScore: 78, recordedAt: dates[0], riskFactorsJson: JSON.stringify(['Age factor']) },
      { assetId: gen001.id, riskScore: 65, riskLevel: 'HIGH', healthScore: 58, recordedAt: dates[1], riskFactorsJson: JSON.stringify(['Vibration anomaly', 'Health declining']) },
      { assetId: gen001.id, riskScore: 82, riskLevel: 'CRITICAL', healthScore: 42, recordedAt: dates[2], riskFactorsJson: JSON.stringify(['Health score 42%', '3 failures recorded', 'Critical dependency']) }
    ]
  });

  await prisma.maintenancePriority.create({
    data: {
      assetId: gen001.id,
      priorityScore: 88,
      priorityLevel: 'URGENT',
      reason: '✓ Health score below 40% (Current: 42%) | ✓ Risk score 82 in CRITICAL zone | ✓ 3 previous failures in past 12 months | ✓ Abnormal vibration trend (4.8 mm/s) | ✓ Critical building emergency dependency'
    }
  });

  await prisma.maintenanceTicket.create({
    data: {
      ticketId: 'TKT-2026-0091',
      assetId: gen001.id,
      buildingId: b1.id,
      problemDescription: 'High engine temperature (88.5°C) & high frame vibration (4.8 mm/s) under load testing.',
      priorityLevel: 'URGENT',
      riskScoreAtCreation: 82,
      beforeHealthScore: 42,
      beforeRiskScore: 82,
      status: 'OPEN',
      createdBy: 'Dipak Parmar (Inspector)',
      assignedOfficerId: engineer.id,
      assignedTechnicianId: technician.id,
      expectedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.failureRecord.create({
    data: {
      assetId: gen001.id,
      failureDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      failureType: 'Fuel Injector Clog & AVR Voltage Spike',
      symptoms: 'Generator shut down unexpectedly during monthly grid failure test.',
      rootCause: 'Contaminated diesel fuel and worn excitation diode',
      downtimeHours: 4.5,
      repairCost: 35000,
      severity: 'HIGH',
      resolution: 'Replaced fuel filter, injector nozzle #3 and AVR board.'
    }
  });

  await prisma.alert.createMany({
    data: [
      {
        alertId: 'ALT-1001',
        alertType: 'RISK_DETERIORATION',
        priority: 'RED',
        title: 'CRITICAL ALERT: GEN-AHM-001 Deterioration Detected',
        message: 'Generator GEN-AHM-001 risk score escalated from 48 to 82 within 14 days. Immediate inspection recommended.',
        buildingId: b1.id,
        assetId: gen001.id,
        isRead: false
      },
      {
        alertId: 'ALT-1002',
        alertType: 'WARRANTY_EXPIRING',
        priority: 'ORANGE',
        title: 'Warranty Expiring Soon (10 days remaining)',
        message: `Warranty for Executive Passenger Lift No. 1 (LFT-AHM-001) at ${b1.name} expires on ${tenDays.toISOString().split('T')[0]}.`,
        buildingId: b1.id,
        assetId: lift001.id,
        isRead: false
      }
    ]
  });

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      userName: superAdmin.name,
      action: 'SYSTEM_SEED',
      entity: 'Database',
      entityId: 'ALL',
      newValues: JSON.stringify({ status: 'Database seeded with Gujarat R&B demo infrastructure dataset' })
    }
  });

  console.log('🎉 GovBuild360 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
