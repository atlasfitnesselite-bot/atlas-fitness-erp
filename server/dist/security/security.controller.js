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
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let SecurityController = class SecurityController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLoginHistory() {
        return this.prisma.loginHistory.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    }
                }
            }
        });
    }
    async getAuditLogs() {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    }
                }
            }
        });
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)('logins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getLoginHistory", null);
__decorate([
    (0, common_1.Get)('audits'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getAuditLogs", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.Controller)('security'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map