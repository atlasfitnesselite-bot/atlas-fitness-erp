import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class BillingCronService {
  private readonly logger = new Logger(BillingCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Runs daily at 10:00 AM to mark expired memberships and send 5-day expiry reminders.
   */
  @Cron('0 10 * * *')
  async handleDailyMembershipExpiryCheck() {
    this.logger.log('Running daily membership expiry check...');
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfFiveDays = new Date(startOfToday);
      endOfFiveDays.setDate(endOfFiveDays.getDate() + 5);
      endOfFiveDays.setHours(23, 59, 59, 999);

      // 1. Mark expired subscriptions as EXPIRED
      const expiredSubs = await this.prisma.memberSubscription.updateMany({
        where: {
          endDate: { lt: startOfToday },
          status: 'ACTIVE',
        },
        data: { status: 'EXPIRED' },
      });

      if (expiredSubs.count > 0) {
        this.logger.log(`Marked ${expiredSubs.count} expired subscriptions as EXPIRED.`);
      }

      // 2. Mark members without any remaining ACTIVE subscription as EXPIRED
      await this.prisma.member.updateMany({
        where: {
          status: 'ACTIVE',
          subscriptions: {
            some: { status: 'EXPIRED' },
            none: { status: 'ACTIVE' },
          },
        },
        data: { status: 'EXPIRED' },
      });

      // 3. Send reminders for subscriptions expiring within the next 5 days
      const expiringSubs = await this.prisma.memberSubscription.findMany({
        where: {
          endDate: { gte: startOfToday, lte: endOfFiveDays },
          status: 'ACTIVE',
        },
        include: {
          member: true,
          plan: true,
        },
      });

      for (const sub of expiringSubs) {
        if (!sub.member?.email) continue;
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 3600 * 24)),
        );
        await this.emailService.sendExpiryReminder(
          sub.member,
          sub.plan?.name || 'Gym',
          daysLeft,
        );
      }
    } catch (err) {
      this.logger.error('Daily membership expiry cron failed', err);
    }
  }
}
