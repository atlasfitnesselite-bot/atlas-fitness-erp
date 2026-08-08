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
exports.ShiftService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const DEFAULT_SHIFTS = [
    {
        name: 'Morning Shift',
        code: 'MORNING',
        color: '#f59e0b',
        type: 'MORNING',
        startTime: '06:00',
        endTime: '14:00',
        breakDuration: 30,
    },
    {
        name: 'Evening Shift',
        code: 'EVENING',
        color: '#6366f1',
        type: 'EVENING',
        startTime: '14:00',
        endTime: '22:00',
        breakDuration: 30,
    },
    {
        name: 'Night Shift',
        code: 'NIGHT',
        color: '#1e293b',
        type: 'NIGHT',
        startTime: '22:00',
        endTime: '06:00',
        breakDuration: 30,
    },
    {
        name: 'Split Shift',
        code: 'SPLIT',
        color: '#10b981',
        type: 'SPLIT',
        startTime: '08:00',
        endTime: '20:00',
        breakDuration: 240,
    },
    {
        name: 'Weekend Shift',
        code: 'WEEKEND',
        color: '#ec4899',
        type: 'WEEKEND',
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 45,
    },
    {
        name: 'Holiday Shift',
        code: 'HOLIDAY',
        color: '#ef4444',
        type: 'HOLIDAY',
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 45,
    },
];
let ShiftService = class ShiftService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async seedDefaultShifts() {
        for (const s of DEFAULT_SHIFTS) {
            const existing = await this.prisma.shift.findUnique({
                where: { code: s.code },
            });
            if (!existing) {
                await this.prisma.shift.create({ data: s });
            }
        }
    }
    async findAll(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.type)
            where.type = query.type;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search } },
                { code: { contains: query.search } },
            ];
        }
        const shifts = await this.prisma.shift.findMany({
            where,
            include: { _count: { select: { assignments: true } } },
            orderBy: { createdAt: 'asc' },
        });
        return shifts;
    }
    async findOne(id) {
        const shift = await this.prisma.shift.findUnique({
            where: { id },
            include: {
                assignments: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                employeeId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!shift)
            throw new common_1.NotFoundException(`Shift ${id} not found`);
        return shift;
    }
    async create(dto) {
        const existing = await this.prisma.shift.findUnique({
            where: { code: dto.code },
        });
        if (existing)
            throw new common_1.BadRequestException(`Shift code "${dto.code}" already exists`);
        const shift = await this.prisma.shift.create({ data: { ...dto } });
        await this.prisma.shiftHistory.create({
            data: {
                action: 'SHIFT_CREATED',
                details: `Shift "${shift.name}" created`,
            },
        });
        return shift;
    }
    async update(id, dto) {
        await this.findOne(id);
        const shift = await this.prisma.shift.update({
            where: { id },
            data: { ...dto },
        });
        await this.prisma.shiftHistory.create({
            data: {
                action: 'SHIFT_UPDATED',
                details: `Shift "${shift.name}" updated`,
            },
        });
        return shift;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.shiftAssignment.deleteMany({ where: { shiftId: id } });
        await this.prisma.shift.delete({ where: { id } });
        await this.prisma.shiftHistory.create({
            data: { action: 'SHIFT_DELETED', details: `Shift ${id} deleted` },
        });
        return { message: 'Shift deleted successfully' };
    }
    async bulkAssign(dto) {
        const shift = await this.prisma.shift.findUnique({
            where: { id: dto.shiftId },
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        const start = new Date(dto.startDate);
        const end = dto.endDate ? new Date(dto.endDate) : null;
        const results = [];
        for (const empId of dto.employeeIds) {
            const emp = await this.prisma.employee.findUnique({
                where: { id: empId },
            });
            if (!emp) {
                results.push({ employeeId: empId, status: 'EMPLOYEE_NOT_FOUND' });
                continue;
            }
            if (dto.replaceExisting) {
                await this.prisma.shiftAssignment.deleteMany({
                    where: { employeeId: empId },
                });
            }
            await this.prisma.shiftAssignment.create({
                data: {
                    employeeId: empId,
                    shiftId: dto.shiftId,
                    startDate: start,
                    endDate: end,
                },
            });
            await this.prisma.shiftHistory.create({
                data: {
                    action: 'SHIFT_ASSIGNED',
                    details: `Shift "${shift.name}" assigned to employee ${emp.firstName} ${emp.lastName}`,
                },
            });
            if (emp.userId) {
                await this.notificationsService.createNotification({
                    userId: emp.userId,
                    title: 'Shift Assignment Updated',
                    message: `You have been assigned to the ${shift.name} shift.`,
                    type: 'Shift',
                });
            }
            results.push({ employeeId: empId, status: 'ASSIGNED' });
        }
        return results;
    }
    async getAllAssignments() {
        return this.prisma.shiftAssignment.findMany({
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
                shift: { select: { id: true, name: true, type: true, color: true } }
            },
            orderBy: { startDate: 'desc' }
        });
    }
    async updateAssignment(id, dto) {
        const updateData = {};
        if (dto.shiftId)
            updateData.shiftId = dto.shiftId;
        if (dto.startDate)
            updateData.startDate = new Date(dto.startDate);
        if (dto.endDate)
            updateData.endDate = new Date(dto.endDate);
        else if (dto.endDate === null)
            updateData.endDate = null;
        const assignment = await this.prisma.shiftAssignment.update({
            where: { id },
            data: updateData,
            include: { employee: true, shift: true },
        });
        if (assignment.employee.userId) {
            await this.notificationsService.createNotification({
                userId: assignment.employee.userId,
                title: 'Shift Assignment Updated',
                message: `Your shift assignment for ${assignment.shift.name} has been updated.`,
                type: 'Shift',
            });
        }
        return assignment;
    }
    async removeAssignment(id) {
        const assignment = await this.prisma.shiftAssignment.findUnique({
            where: { id },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        await this.prisma.shiftAssignment.delete({ where: { id } });
        return { message: 'Assignment removed' };
    }
    async getAssignmentsByEmployee(employeeId) {
        return this.prisma.shiftAssignment.findMany({
            where: { employeeId },
            include: { shift: true },
            orderBy: { startDate: 'desc' },
        });
    }
    async getRotations() {
        return this.prisma.shiftRotation.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async createRotation(dto) {
        const start = new Date(dto.startDate);
        const next = new Date(start);
        next.setDate(next.getDate() + (dto.rotationCycle ?? 7));
        return this.prisma.shiftRotation.create({
            data: {
                name: dto.name,
                frequency: dto.frequency,
                rotationCycle: dto.rotationCycle ?? 7,
                startDate: start,
                nextRotationDate: next,
                employeeIds: JSON.stringify(dto.employeeIds),
                shiftSequence: JSON.stringify(dto.shiftSequence),
            },
        });
    }
    async getRequests(query, user) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (user) {
            const dbUser = await this.prisma.user.findUnique({
                where: { id: user.id || user.sub },
                include: { userRoles: { include: { role: true } }, employee: true }
            });
            if (dbUser) {
                const roles = dbUser.userRoles.map(ur => ur.role.name);
                if (!roles.includes('OWNER') && !roles.includes('MANAGER')) {
                    where.employeeId = dbUser.employee?.id || 'NONE';
                }
            }
        }
        return this.prisma.shiftRequest.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    },
                },
                requestedShift: { select: { id: true, name: true, color: true } },
                currentShift: { select: { id: true, name: true, color: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createRequest(userId, dto) {
        const emp = await this.prisma.employee.findUnique({
            where: { userId },
        });
        if (!emp)
            throw new common_1.NotFoundException('Employee not found');
        return this.prisma.shiftRequest.create({
            data: {
                employeeId: emp.id,
                requestedShiftId: dto.requestedShiftId || null,
                currentShiftId: dto.currentShiftId || null,
                targetDate: new Date(dto.targetDate),
                type: dto.type,
                targetEmployeeId: dto.targetEmployeeId || null,
                reason: dto.reason,
            },
        });
    }
    async approveRequest(id, approverId, dto) {
        const req = await this.prisma.shiftRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Request not found');
        if (req.status !== 'PENDING')
            throw new common_1.BadRequestException('Request already processed');
        const updated = await this.prisma.shiftRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedById: approverId,
                managerComment: dto.managerComment,
            },
        });
        await this.prisma.shiftHistory.create({
            data: {
                action: 'SHIFT_REQUEST_APPROVED',
                details: `Shift request ${id} approved`,
            },
        });
        return updated;
    }
    async rejectRequest(id, approverId, dto) {
        const req = await this.prisma.shiftRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Request not found');
        if (req.status !== 'PENDING')
            throw new common_1.BadRequestException('Request already processed');
        const updated = await this.prisma.shiftRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approvedById: approverId,
                managerComment: dto.managerComment,
            },
        });
        await this.prisma.shiftHistory.create({
            data: {
                action: 'SHIFT_REQUEST_REJECTED',
                details: `Shift request ${id} rejected`,
            },
        });
        return updated;
    }
    async createWeeklyOff(dto) {
        return this.prisma.weeklyOff.create({
            data: {
                employeeId: dto.employeeId,
                departmentId: dto.departmentId,
                days: dto.days.join(','),
            },
        });
    }
    async createException(dto) {
        return this.prisma.shiftException.create({
            data: {
                employeeId: dto.employeeId,
                shiftId: dto.shiftId,
                date: new Date(dto.date),
                reason: dto.reason,
                type: dto.type ?? 'HOLIDAY',
            },
        });
    }
    async getHistory() {
        return this.prisma.shiftHistory.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getDashboard() {
        const [totalShifts, totalAssignments, pendingRequests, activeShifts, history,] = await Promise.all([
            this.prisma.shift.count(),
            this.prisma.shiftAssignment.count(),
            this.prisma.shiftRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.shift.findMany({
                where: { status: 'ACTIVE' },
                include: { _count: { select: { assignments: true } } },
            }),
            this.prisma.shiftHistory.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);
        const totalEmployees = await this.prisma.employee.count({
            where: { status: 'ACTIVE' },
        });
        const assignedEmployeeIds = await this.prisma.shiftAssignment.findMany({
            select: { employeeId: true },
            distinct: ['employeeId'],
        });
        const assignedCount = assignedEmployeeIds.length;
        const unassignedCount = Math.max(0, totalEmployees - assignedCount);
        const shiftDistribution = activeShifts.map((s) => ({
            id: s.id,
            name: s.name,
            color: s.color,
            count: s._count.assignments,
        }));
        return {
            totalShifts,
            totalAssignments,
            assignedEmployees: assignedCount,
            unassignedEmployees: unassignedCount,
            pendingRequests,
            shiftDistribution,
            recentHistory: history,
        };
    }
    async getCalendar(year, month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const assignments = await this.prisma.shiftAssignment.findMany({
            where: {
                OR: [
                    { startDate: { gte: start, lte: end } },
                    { endDate: { gte: start } },
                    { endDate: null, startDate: { lte: end } },
                ],
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        attendances: {
                            where: {
                                date: { gte: start, lte: end }
                            },
                            select: {
                                date: true,
                                lateMinutes: true,
                                status: true
                            }
                        }
                    },
                },
                shift: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        startTime: true,
                        endTime: true,
                        type: true,
                    },
                },
            },
        });
        return assignments;
    }
};
exports.ShiftService = ShiftService;
exports.ShiftService = ShiftService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ShiftService);
//# sourceMappingURL=shift.service.js.map