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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompanySettings() {
        const settings = await this.prisma.companySettings.findFirst();
        if (!settings) {
            return {
                companyName: 'Atlas Fitness',
                timezone: 'UTC',
                dateFormat: 'YYYY-MM-DD',
                companyLogo: null,
                companyContact: null,
            };
        }
        return settings;
    }
    async updateCompanySettings(userId, dto) {
        const existing = await this.prisma.companySettings.findFirst();
        if (existing) {
            return this.prisma.companySettings.update({
                where: { id: existing.id },
                data: { ...dto, userId },
            });
        }
        return this.prisma.companySettings.create({
            data: {
                companyName: dto.companyName || 'Atlas Fitness',
                timezone: dto.timezone || 'UTC',
                dateFormat: dto.dateFormat || 'YYYY-MM-DD',
                companyLogo: dto.companyLogo,
                companyContact: dto.companyContact,
                userId,
            },
        });
    }
    async getThemeSettings(userId) {
        let settings = await this.prisma.themeSettings.findUnique({
            where: { userId },
        });
        if (!settings) {
            settings = await this.prisma.themeSettings.create({
                data: {
                    userId,
                    primaryColor: '#DC2626',
                    secondaryColor: '#0F172A',
                    mode: 'light',
                },
            });
        }
        return settings;
    }
    async updateThemeSettings(userId, dto) {
        return this.prisma.themeSettings.upsert({
            where: { userId },
            update: dto,
            create: {
                userId,
                primaryColor: dto.primaryColor || '#DC2626',
                secondaryColor: dto.secondaryColor || '#0F172A',
                mode: dto.mode || 'light',
            },
        });
    }
    async getAllRoles() {
        return this.prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    async updateRolePermissions(roleId, permissionIds) {
        await this.prisma.rolePermission.deleteMany({
            where: { roleId },
        });
        if (permissionIds.length > 0) {
            await this.prisma.rolePermission.createMany({
                data: permissionIds.map((permissionId) => ({
                    roleId,
                    permissionId,
                })),
            });
        }
        return this.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map