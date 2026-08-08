import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleMembershipExpiry() {
    this.logger.debug('Running Membership Expiry Cron');
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const expiringSubscriptions = await this.prisma.memberSubscription.findMany({
      where: {
        endDate: {
          gte: today,
          lte: nextWeek,
        },
        status: 'ACTIVE',
      },
      include: {
        member: true,
      },
    });

    for (const sub of expiringSubscriptions) {
      // No userId on member to send direct notification, so skip.

      await this.notificationsService.broadcastToRole({
        title: 'Membership Expiring',
        message: `${sub.member.firstName} ${sub.member.lastName}'s membership is expiring on ${sub.endDate.toLocaleDateString()}.`,
        type: 'WARNING',
        targetRole: 'MANAGER',
      }).catch(() => {});
    }
  }

  @Cron('0 * * * *') // Every hour
  async handlePtSessionReminders() {
    this.logger.debug('Running PT Session Reminder Cron');
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingSessions = await this.prisma.pTSession.findMany({
      where: {
        date: {
          gte: now,
          lte: next24Hours,
        },
        status: 'SCHEDULED',
      },
      include: {
        member: true,
        trainer: true,
      },
    });

    for (const session of upcomingSessions) {
      // No userId on client (Member), so skip.
      
      if (session.trainer.userId) {
        await this.notificationsService.createNotification({
          userId: session.trainer.userId,
          title: 'PT Session Reminder',
          message: `You have a PT session with ${session.member.firstName} ${session.member.lastName} at ${session.startTime}.`,
          type: 'INFO',
        }).catch(() => {});
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleBirthdayWishes() {
    this.logger.debug('Running Birthday Wishes Cron');
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDate = today.getDate();

    // Members Birthdays
    const members = await this.prisma.member.findMany({
      where: {
        status: 'ACTIVE'
      }
    });

    for (const member of members) {
      if (member.dateOfBirth) {
        const dob = new Date(member.dateOfBirth);
        // No userId on member
        if (dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDate) {
          // Do nothing for member directly
        }
      }
    }

    // Employees Birthdays
    const employees = await this.prisma.employee.findMany({
      where: {
        status: 'ACTIVE'
      }
    });

    for (const emp of employees) {
      if (emp.dateOfBirth) {
        const dob = new Date(emp.dateOfBirth);
        if (dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDate && emp.userId) {
          await this.notificationsService.createNotification({
            userId: emp.userId,
            title: 'Happy Birthday!',
            message: `Happy Birthday! Have a wonderful day from the team.`,
            type: 'SUCCESS',
          }).catch(() => {});
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async handleCleaningPending() {
    this.logger.debug('Running Cleaning Pending Cron');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingTasks = await this.prisma.cleaningTask.findMany({
      where: {
        isCompleted: false,
        createdAt: {
          gte: today,
        }
      },
      include: {
        checklist: {
          include: { area: true }
        }
      }
    });

    for (const task of pendingTasks) {
      if (task.checklist.assignedTo) {
        // Find employee userId
        const emp = await this.prisma.employee.findUnique({
          where: { id: task.checklist.assignedTo }
        });
        if (emp && emp.userId) {
          await this.notificationsService.createNotification({
            userId: emp.userId,
            title: 'Cleaning Task Pending',
            message: `You have pending cleaning tasks in ${task.checklist.area.name}.`,
            type: 'WARNING',
          }).catch(() => {});
        }
      }
    }

    if (pendingTasks.length > 0) {
      await this.notificationsService.broadcastToRole({
        title: 'Incomplete Cleaning Tasks',
        message: `There are ${pendingTasks.length} pending cleaning tasks for today.`,
        type: 'WARNING',
        targetRole: 'MANAGER',
      }).catch(() => {});
    }
  }

  @Cron('30 10 * * *')
  async handleLateStaff() {
    this.logger.debug('Running Late Staff Cron');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const activeEmployees = await this.prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        shiftAssignments: {
          some: {
            startDate: { lte: todayEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: todayStart } }
            ]
          }
        }
      },
      include: {
        attendances: {
          where: {
            date: {
              gte: todayStart,
              lte: todayEnd,
            }
          }
        }
      }
    });

    for (const emp of activeEmployees) {
      const hasClockedIn = emp.attendances.some(a => a.clockIn !== null);
      if (!hasClockedIn) {
        const roles = ['OWNER', 'MANAGER'];
        for (const role of roles) {
          await this.notificationsService.broadcastToRole({
            title: 'Late Staff Alert',
            message: `${emp.firstName} ${emp.lastName} has not clocked in today and may be late`,
            type: 'WARNING',
            targetRole: role,
          }).catch(() => {});
        }
      }
    }
  }

  @Cron('0 */4 * * *')
  async handleLowInventory() {
    this.logger.debug('Running Low Inventory Cron');
    
    const items = await this.prisma.cafeItem.findMany();
    const lowItems = items.filter(item => item.stock <= item.minStock);

    for (const item of lowItems) {
      const roles = ['OWNER', 'CAFE'];
      for (const role of roles) {
        await this.notificationsService.broadcastToRole({
          title: 'Low Stock Alert',
          message: `Low stock alert: ${item.name} has only ${item.stock} units remaining`,
          type: 'WARNING',
          targetRole: role,
        }).catch(() => {});
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleEquipmentFaults() {
    this.logger.debug('Running Equipment Faults Cron');
    
    const faultyEquipment = await this.prisma.equipment.findMany({
      where: {
        OR: [
          { status: { in: ['FAULT', 'MAINTENANCE_NEEDED', 'MAINTENANCE'] } },
          { faultReports: { some: { resolvedAt: null } } }
        ]
      }
    });

    for (const eq of faultyEquipment) {
      const roles = ['OWNER', 'MANAGER'];
      for (const role of roles) {
        await this.notificationsService.broadcastToRole({
          title: 'Equipment Fault Alert',
          message: `Equipment alert: ${eq.name} has an unresolved fault report`,
          type: 'WARNING',
          targetRole: role,
        }).catch(() => {});
      }
    }
  }

  async notifySalaryProcessed(employeeId: string, month: string, amount: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (employee && employee.userId) {
      await this.notificationsService.createNotification({
        userId: employee.userId,
        title: 'Salary Processed',
        message: `Your salary for ${month} has been processed. Net amount: ₹${amount}`,
        type: 'SUCCESS',
      }).catch(() => {});
    }
  }
}
