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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPlan(data) {
        return this.prisma.membershipPlan.create({ data });
    }
    async getPlans() {
        return this.prisma.membershipPlan.findMany({
            orderBy: [{ durationInMonths: 'asc' }, { price: 'asc' }],
        });
    }
    async getPlanById(id) {
        const plan = await this.prisma.membershipPlan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
    async updatePlan(id, data) {
        return this.prisma.membershipPlan.update({
            where: { id },
            data,
        });
    }
    async deletePlan(id) {
        return this.prisma.membershipPlan.delete({ where: { id } });
    }
    async assignPlan(data) {
        return this.prisma.memberSubscription.create({
            data: {
                memberId: data.memberId,
                planId: data.planId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: data.status,
            },
        });
    }
    async getSubscriptions() {
        return this.prisma.memberSubscription.findMany({
            include: {
                member: true,
                plan: true,
            },
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map