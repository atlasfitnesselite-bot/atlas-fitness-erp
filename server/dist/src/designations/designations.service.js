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
exports.DesignationsService = exports.CreateDesignationDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
class CreateDesignationDto {
    name;
    level;
    description;
    status;
}
exports.CreateDesignationDto = CreateDesignationDto;
let DesignationsService = class DesignationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDesignations() {
        const desigs = await this.prisma.designation.findMany({
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });
        return desigs.map((d) => ({
            ...d,
            employeeCount: d._count.employees,
        }));
    }
    async getDesignationById(id) {
        const desig = await this.prisma.designation.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });
        if (!desig)
            throw new common_1.NotFoundException('Designation not found');
        return {
            ...desig,
            employeeCount: desig._count.employees,
        };
    }
    async createDesignation(data) {
        const existing = await this.prisma.designation.findUnique({
            where: { name: data.name },
        });
        if (existing)
            throw new common_1.ConflictException('Designation name already exists');
        return this.prisma.designation.create({
            data: {
                name: data.name,
                level: data.level,
                description: data.description,
                status: data.status || 'ACTIVE',
            },
        });
    }
    async updateDesignation(id, data) {
        await this.getDesignationById(id);
        return this.prisma.designation.update({
            where: { id },
            data: {
                name: data.name,
                level: data.level,
                description: data.description,
                status: data.status,
            },
        });
    }
    async deleteDesignation(id) {
        await this.getDesignationById(id);
        return this.prisma.designation.delete({ where: { id } });
    }
};
exports.DesignationsService = DesignationsService;
exports.DesignationsService = DesignationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DesignationsService);
//# sourceMappingURL=designations.service.js.map