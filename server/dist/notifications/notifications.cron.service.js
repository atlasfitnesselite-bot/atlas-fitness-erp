"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("./notifications.service");
let NotificationCronService = NotificationCronService_1 = class NotificationCronService {
    prisma;
    notificationsService;
    logger = new common_1.Logger(NotificationCronService_1.name);
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
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
            await this.notificationsService.broadcastToRole({
                title: 'Membership Expiring',
                message: `${sub.member.firstName} ${sub.member.lastName}'s membership is expiring on ${sub.endDate.toLocaleDateString()}.`,
                type: 'WARNING',
                targetRole: 'MANAGER',
            }).catch(() => { });
        }
    }
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
            if (session.trainer.userId) {
                await this.notificationsService.createNotification({
                    userId: session.trainer.userId,
                    title: 'PT Session Reminder',
                    message: `You have a PT session with ${session.member.firstName} ${session.member.lastName} at ${session.startTime}.`,
                    type: 'INFO',
                }).catch(() => { });
            }
        }
    }
    async handleBirthdayWishes() {
        this.logger.debug('Running Birthday Wishes Cron');
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDate = today.getDate();
        const members = await this.prisma.member.findMany({
            where: {
                status: 'ACTIVE'
            }
        });
        for (const member of members) {
            if (member.dateOfBirth) {
                const dob = new Date(member.dateOfBirth);
                if (dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDate) {
                }
            }
        }
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
                    }).catch(() => { });
                }
            }
        }
    }
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
                const emp = await this.prisma.employee.findUnique({
                    where: { id: task.checklist.assignedTo }
                });
                if (emp && emp.userId) {
                    await this.notificationsService.createNotification({
                        userId: emp.userId,
                        title: 'Cleaning Task Pending',
                        message: `You have pending cleaning tasks in ${task.checklist.area.name}.`,
                        type: 'WARNING',
                    }).catch(() => { });
                }
            }
        }
        if (pendingTasks.length > 0) {
            await this.notificationsService.broadcastToRole({
                title: 'Incomplete Cleaning Tasks',
                message: `There are ${pendingTasks.length} pending cleaning tasks for today.`,
                type: 'WARNING',
                targetRole: 'MANAGER',
            }).catch(() => { });
        }
    }
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
                    }).catch(() => { });
                }
            }
        }
    }
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
                }).catch(() => { });
            }
        }
    }
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
                }).catch(() => { });
            }
        }
    }
    async notifySalaryProcessed(employeeId, month, amount) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId }
        });
        if (employee && employee.userId) {
            await this.notificationsService.createNotification({
                userId: employee.userId,
                title: 'Salary Processed',
                message: `Your salary for ${month} has been processed. Net amount: ₹${amount}`,
                type: 'SUCCESS',
            }).catch(() => { });
        }
    }
};
exports.NotificationCronService = NotificationCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handleMembershipExpiry", null);
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handlePtSessionReminders", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handleBirthdayWishes", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6PM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handleCleaningPending", null);
__decorate([
    (0, schedule_1.Cron)('30 10 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handleLateStaff", null);
__decorate([
    (0, schedule_1.Cron)('0 */4 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handleLowInventory", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handleEquipmentFaults", null);
exports.NotificationCronService = NotificationCronService = NotificationCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], NotificationCronService);
//# sourceMappingURL=notifications.cron.service.js.map