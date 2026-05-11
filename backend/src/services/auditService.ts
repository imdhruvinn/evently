import prisma from '../lib/prisma';
import { Request } from 'express';

export class AuditService {
  /**
   * Log an action to the immutable audit trail
   */
  static async log(
    action: string,
    req?: Request,
    details?: any,
    targetId?: string
  ): Promise<void> {
    try {
      const userId = (req as any)?.user?.id;
      const ipAddress = req?.ip || req?.headers['x-forwarded-for'] as string || 'unknown';

      // Insert asynchronously so it doesn't block the main request
      prisma.auditLog.create({
        data: {
          action,
          userId,
          targetId,
          details,
          ipAddress
        }
      }).catch(err => console.error('Failed to write audit log:', err));

    } catch (error) {
      console.error('AuditService error:', error);
    }
  }

  /**
   * Fetch recent audit logs for an admin dashboard
   */
  static async getLogs(limit = 50, skip = 0) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });
  }
}
