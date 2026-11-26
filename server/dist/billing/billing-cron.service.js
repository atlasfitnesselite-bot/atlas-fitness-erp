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
var BillingCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("./email.service");
let BillingCronService = BillingCronService_1 = class BillingCronService {
    prisma;
    emailService;
    logger = new common_1.Logger(BillingCronService_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async handleDailyMembershipExpiryCheck() {
        this.logger.log('Running daily membership expiry check...');
        try {
            const now = new Date();
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            const endOfFiveDays = new Date(startOfToday);
            endOfFiveDays.setDate(endOfFiveDays.getDate() + 5);
            endOfFiveDays.setHours(23, 59, 59, 999);
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
                if (!sub.member?.email)
                    continue;
                const daysLeft = Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 3600 * 24)));
                await this.emailService.sendExpiryReminder(sub.member, sub.plan?.name || 'Gym', daysLeft);
            }
        }
        catch (err) {
            this.logger.error('Daily membership expiry cron failed', err);
        }
    }
};
exports.BillingCronService = BillingCronService;
__decorate([
    (0, schedule_1.Cron)('0 10 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingCronService.prototype, "handleDailyMembershipExpiryCheck", null);
exports.BillingCronService = BillingCronService = BillingCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], BillingCronService);
//# sourceMappingURL=billing-cron.service.js.map