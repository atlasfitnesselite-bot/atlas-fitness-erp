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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditInterceptor = class AuditInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const { method, url, body, user } = req;
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && !url.includes('/auth/login')) {
            return next.handle().pipe((0, operators_1.tap)(() => {
                this.logAction(method, url, body, user).catch(err => {
                    console.error('Failed to write audit log', err);
                });
            }));
        }
        return next.handle();
    }
    async logAction(method, url, body, user) {
        let action = 'UNKNOWN';
        if (method === 'POST')
            action = 'CREATE';
        if (method === 'PUT' || method === 'PATCH')
            action = 'UPDATE';
        if (method === 'DELETE')
            action = 'DELETE';
        const userId = user?.id || null;
        const safeBody = { ...body };
        if (safeBody.password)
            safeBody.password = '***';
        await this.prisma.auditLog.create({
            data: {
                userId,
                action,
                resource: url,
                details: JSON.stringify(safeBody),
            }
        });
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map