import prisma from '../lib/prisma';
import { Request } from 'express';
import { AuditService } from './auditService';

export class FraudService {
  /**
   * Evaluate a booking for potential fraud
   * Returns true if suspicious, false if safe.
   */
  static async evaluateBooking(
    userId: string,
    eventId: string,
    quantity: number,
    req: Request
  ): Promise<boolean> {
    try {
      let isSuspicious = false;
      const reasons: string[] = [];

      // 1. Velocity Rule: Check if user made > 3 bookings in the last 5 minutes
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentBookings = await prisma.booking.count({
        where: {
          userId,
          createdAt: { gte: fiveMinsAgo }
        }
      });

      if (recentBookings >= 3) {
        isSuspicious = true;
        reasons.push('High booking velocity (>3 in 5 mins)');
      }

      // 2. Volume Rule: Check if booking > 15% of event capacity
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { capacity: true }
      });

      if (event && event.capacity > 0) {
        const percentage = (quantity / event.capacity) * 100;
        if (percentage > 15) {
          isSuspicious = true;
          reasons.push(`High volume (${percentage.toFixed(1)}% of total capacity)`);
        }
      }

      // 3. Optional: we could add IP rules here later.

      if (isSuspicious) {
        await AuditService.log('FRAUD_FLAGGED', req, { eventId, quantity, reasons }, userId);
      }

      return isSuspicious;

    } catch (error) {
      console.error('FraudService Error:', error);
      // Fail open: don't block bookings if the fraud service crashes
      return false;
    }
  }
}
