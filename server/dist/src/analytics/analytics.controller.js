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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const analytics_service_1 = require("./analytics.service");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getDashboardStats(req) {
        return this.analyticsService.getDashboardStats();
    }
    async getManagerDashboardStats() {
        return this.analyticsService.getManagerDashboardStats();
    }
    async getTrainerDashboardStats(req) {
        return this.analyticsService.getTrainerDashboardStats(req.user.id);
    }
    async getReceptionDashboardStats() {
        return this.analyticsService.getReceptionDashboardStats();
    }
    async getBusinessIntelligenceData(req) {
        const roles = req.user?.roles || [];
        const role = roles.includes('OWNER') ? 'OWNER' : 'MANAGER';
        return this.analyticsService.getBusinessIntelligenceData(role);
    }
    async submitFeedback(body) {
        return this.analyticsService['prisma'].memberFeedback.create({
            data: {
                memberId: body.memberId,
                category: body.category || 'GENERAL',
                rating: body.rating,
                comments: body.comments
            }
        });
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardStats", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('manager-dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getManagerDashboardStats", null);
__decorate([
    (0, common_1.Get)('trainer-dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTrainerDashboardStats", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Get)('reception-dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getReceptionDashboardStats", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('business-intelligence'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getBusinessIntelligenceData", null);
__decorate([
    (0, common_1.Post)('feedback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "submitFeedback", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map