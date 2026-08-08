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
exports.EmploymentTypesService = exports.CreateEmploymentTypeDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
class CreateEmploymentTypeDto {
    name;
    description;
    status;
}
exports.CreateEmploymentTypeDto = CreateEmploymentTypeDto;
let EmploymentTypesService = class EmploymentTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmploymentTypes() {
        const types = await this.prisma.employmentType.findMany({
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });
        return types.map((t) => ({
            ...t,
            employeeCount: t._count.employees,
        }));
    }
    async getEmploymentTypeById(id) {
        const type = await this.prisma.employmentType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });
        if (!type)
            throw new common_1.NotFoundException('Employment type not found');
        return {
            ...type,
            employeeCount: type._count.employees,
        };
    }
    async createEmploymentType(data) {
        const existing = await this.prisma.employmentType.findUnique({
            where: { name: data.name },
        });
        if (existing)
            throw new common_1.ConflictException('Employment type name already exists');
        return this.prisma.employmentType.create({
            data: {
                name: data.name,
                description: data.description,
                status: data.status || 'ACTIVE',
            },
        });
    }
    async updateEmploymentType(id, data) {
        await this.getEmploymentTypeById(id);
        return this.prisma.employmentType.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                status: data.status,
            },
        });
    }
    async deleteEmploymentType(id) {
        await this.getEmploymentTypeById(id);
        return this.prisma.employmentType.delete({ where: { id } });
    }
};
exports.EmploymentTypesService = EmploymentTypesService;
exports.EmploymentTypesService = EmploymentTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmploymentTypesService);
//# sourceMappingURL=employment-types.service.js.map