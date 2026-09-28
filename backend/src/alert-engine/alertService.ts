import { prisma } from '../config/prisma';

export type AlertPriority = 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE';

export interface CreateAlertInput {
  alertType: string;
  priority: AlertPriority;
  title: string;
  message: string;
  buildingId?: string;
  assetId?: string;
}

export async function createAlert(input: CreateAlertInput) {
  const existing = await prisma.alert.findFirst({
    where: {
      alertType: input.alertType,
      assetId: input.assetId || null,
      isRead: false,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  });

  if (existing) {
    return existing;
  }

  const alertId = `ALT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  return await prisma.alert.create({
    data: {
      alertId,
      alertType: input.alertType,
      priority: input.priority,
      title: input.title,
      message: input.message,
      buildingId: input.buildingId,
      assetId: input.assetId
    }
  });
}

export async function runSystemAlertCheck() {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const warrantiesExpiring = await prisma.warranty.findMany({
    where: {
      endDate: { lte: thirtyDaysLater, gte: now },
      status: 'ACTIVE'
    },
    include: { asset: { include: { building: true } } }
  });

  for (const w of warrantiesExpiring) {
    const daysLeft = Math.ceil((w.endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    await createAlert({
      alertType: 'WARRANTY_EXPIRING',
      priority: daysLeft <= 7 ? 'RED' : daysLeft <= 15 ? 'ORANGE' : 'YELLOW',
      title: `Warranty Expiring Soon (${daysLeft} days remaining)`,
      message: `Warranty for ${w.asset.name} (${w.asset.assetId}) at ${w.asset.building.name} expires on ${w.endDate.toISOString().split('T')[0]}. Provider: ${w.providerName}.`,
      buildingId: w.asset.buildingId,
      assetId: w.assetId
    });
  }

  const amcExpiring = await prisma.aMCContract.findMany({
    where: {
      endDate: { lte: thirtyDaysLater, gte: now },
      status: 'ACTIVE'
    },
    include: { asset: { include: { building: true } } }
  });

  for (const amc of amcExpiring) {
    const daysLeft = Math.ceil((amc.endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    await createAlert({
      alertType: 'AMC_EXPIRING',
      priority: daysLeft <= 7 ? 'RED' : 'ORANGE',
      title: `AMC Contract Expiring Soon (${daysLeft} days)`,
      message: `AMC contract ${amc.contractNumber} for ${amc.asset.name} (${amc.asset.assetId}) expires on ${amc.endDate.toISOString().split('T')[0]}.`,
      buildingId: amc.asset.buildingId,
      assetId: amc.assetId
    });
  }

  const highRiskAssets = await prisma.asset.findMany({
    where: {
      OR: [
        { currentRiskScore: { gte: 70 } },
        { currentHealthScore: { lte: 45 } }
      ]
    },
    include: { building: true }
  });

  for (const asset of highRiskAssets) {
    await createAlert({
      alertType: asset.currentRiskScore >= 80 ? 'CRITICAL_RISK' : 'HIGH_RISK',
      priority: asset.currentRiskScore >= 80 || asset.currentHealthScore <= 40 ? 'RED' : 'ORANGE',
      title: `Critical Asset Risk Detected: ${asset.assetId}`,
      message: `${asset.name} at ${asset.building.name} has a Health Score of ${asset.currentHealthScore}% and Risk Score of ${asset.currentRiskScore}/100. Immediate inspection/maintenance required.`,
      buildingId: asset.buildingId,
      assetId: asset.id
    });
  }
}
