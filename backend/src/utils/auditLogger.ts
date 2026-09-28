import { prisma } from '../config/prisma';

export async function logAudit(
  userId: string | undefined,
  userName: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || 'system',
        userName: userName || 'System Process',
        action,
        entity,
        entityId: entityId || null,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress: ipAddress || '127.0.0.1'
      }
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}
