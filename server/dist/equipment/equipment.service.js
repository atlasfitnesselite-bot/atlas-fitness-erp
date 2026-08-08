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
exports.EquipmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let EquipmentService = class EquipmentService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getEquipment(filters) {
        const where = {};
        if (filters.category)
            where.category = filters.category;
        if (filters.status)
            where.status = filters.status;
        if (filters.location)
            where.location = filters.location;
        return this.prisma.equipment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async createEquipment(data) {
        const count = await this.prisma.equipment.count();
        const equipmentCode = `EQ-${(count + 1).toString().padStart(4, '0')}`;
        return this.prisma.equipment.create({
            data: {
                ...data,
                equipmentId: data.equipmentId || equipmentCode,
            }
        });
    }
    async updateEquipment(id, data) {
        return this.prisma.equipment.update({
            where: { id },
            data,
        });
    }
    async getFaultReports(equipmentId) {
        return this.prisma.faultReport.findMany({
            where: { equipmentId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async reportFault(equipmentId, data, reportedBy) {
        const fault = await this.prisma.faultReport.create({
            data: {
                ...data,
                equipmentId,
                reportedBy: reportedBy || 'UNKNOWN',
            },
        });
        const equipment = await this.prisma.equipment.findUnique({ where: { id: equipmentId } });
        if (equipment) {
            this.notificationsService.broadcastToRole({
                title: 'Equipment Fault',
                message: `${equipment.name} (${equipment.model}) has been reported faulty.`,
                type: 'DANGER',
                targetRole: 'MANAGER',
            }).catch(console.error);
        }
        return fault;
    }
    async resolveFault(faultId, technicianNotes) {
        const fault = await this.prisma.faultReport.findUnique({ where: { id: faultId } });
        if (!fault)
            throw new common_1.NotFoundException('Fault report not found');
        await this.prisma.equipment.update({
            where: { id: fault.equipmentId },
            data: { status: 'ACTIVE' },
        });
        return this.prisma.faultReport.update({
            where: { id: faultId },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
                technicianNotes,
            },
        });
    }
};
exports.EquipmentService = EquipmentService;
exports.EquipmentService = EquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], EquipmentService);
//# sourceMappingURL=equipment.service.js.map