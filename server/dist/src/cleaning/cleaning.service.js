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
exports.CleaningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CleaningService = class CleaningService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAreas() {
        return this.prisma.cleaningArea.findMany({
            include: {
                checklists: {
                    take: 5,
                    orderBy: { date: 'desc' },
                    include: {
                        assignee: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }
    async createArea(data) {
        return this.prisma.cleaningArea.create({ data });
    }
    async getChecklists(filters) {
        const where = {};
        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            where.date = { gte: startOfDay, lte: endOfDay };
        }
        if (filters.areaId)
            where.areaId = filters.areaId;
        if (filters.status)
            where.status = filters.status;
        if (filters.assignedTo)
            where.assignedTo = filters.assignedTo;
        return this.prisma.cleaningChecklist.findMany({
            where,
            include: {
                area: true,
                assignee: {
                    select: { id: true, firstName: true, lastName: true }
                },
                tasks: true
            },
            orderBy: { date: 'desc' }
        });
    }
    async createChecklist(data) {
        return this.prisma.cleaningChecklist.create({
            data: {
                areaId: data.areaId,
                date: new Date(data.date),
                shift: data.shift,
                assignedTo: data.assignedTo,
                tasks: {
                    create: data.tasks.map(taskName => ({ taskName }))
                }
            },
            include: {
                area: true,
                tasks: true,
                assignee: { select: { firstName: true, lastName: true } }
            }
        });
    }
    async updateChecklistStatus(id, data) {
        return this.prisma.cleaningChecklist.update({
            where: { id },
            data: {
                status: data.status,
                verifiedBy: data.verifiedBy
            },
            include: {
                area: true,
                tasks: true
            }
        });
    }
    async updateTask(id, data) {
        const currentTask = await this.prisma.cleaningTask.findUnique({ where: { id } });
        if (!currentTask)
            throw new common_1.NotFoundException('Task not found');
        const updateData = { ...data };
        if (data.isCompleted === true && !currentTask.isCompleted) {
            updateData.completedAt = new Date();
        }
        else if (data.isCompleted === false && currentTask.isCompleted) {
            updateData.completedAt = null;
        }
        const task = await this.prisma.cleaningTask.update({
            where: { id },
            data: updateData
        });
        const allTasks = await this.prisma.cleaningTask.findMany({
            where: { checklistId: task.checklistId }
        });
        const allCompleted = allTasks.every(t => t.isCompleted);
        if (allCompleted) {
            await this.prisma.cleaningChecklist.update({
                where: { id: task.checklistId },
                data: { status: 'COMPLETED' }
            });
        }
        else {
            await this.prisma.cleaningChecklist.update({
                where: { id: task.checklistId },
                data: { status: 'IN_PROGRESS' }
            });
        }
        return task;
    }
};
exports.CleaningService = CleaningService;
exports.CleaningService = CleaningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CleaningService);
//# sourceMappingURL=cleaning.service.js.map