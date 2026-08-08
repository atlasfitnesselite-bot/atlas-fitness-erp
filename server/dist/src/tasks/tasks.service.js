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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployeeByUserId(userId) {
        return this.prisma.employee.findUnique({
            where: { userId }
        });
    }
    async getTasks(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.priority)
            where.priority = filters.priority;
        if (filters.assignedTo)
            where.assignedTo = filters.assignedTo;
        if (filters.category)
            where.category = filters.category;
        return this.prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                assignee: { select: { id: true, userId: true, firstName: true, lastName: true, employeeId: true } },
                assigner: { select: { id: true, name: true, email: true } }
            }
        });
    }
    async createTask(data, userId) {
        const payload = { ...data, assignedBy: userId };
        if (!payload.assignedTo)
            delete payload.assignedTo;
        if (!payload.description)
            delete payload.description;
        if (payload.dueDate) {
            payload.dueDate = new Date(payload.dueDate);
        }
        else {
            delete payload.dueDate;
        }
        return this.prisma.task.create({
            data: payload,
        });
    }
    async updateTask(id, data) {
        const updateData = { ...data };
        if (updateData.status === 'COMPLETED' && !updateData.completedAt) {
            updateData.completedAt = new Date();
        }
        return this.prisma.task.update({
            where: { id },
            data: updateData,
        });
    }
    async completeTask(id, data) {
        return this.prisma.task.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                photoProof: data.photoProof,
                remarks: data.remarks,
            },
        });
    }
    async deleteTask(id) {
        return this.prisma.task.delete({
            where: { id },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map