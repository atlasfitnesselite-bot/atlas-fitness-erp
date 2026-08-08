import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateShiftDto,
  UpdateShiftDto,
  CreateShiftAssignmentDto,
  UpdateShiftAssignmentDto,
  CreateShiftRotationDto,
  CreateShiftRequestDto,
  ApproveShiftRequestDto,
  CreateWeeklyOffDto,
  CreateShiftExceptionDto,
} from './dto/shift.dto';

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

@Injectable()
export class ShiftService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async seedDefaultShifts(): Promise<void> {
    for (const s of DEFAULT_SHIFTS) {
      const existing = await this.prisma.shift.findUnique({
        where: { code: s.code },
      });
      if (!existing) {
        await this.prisma.shift.create({ data: s });
      }
    }
  }

  // ─── SHIFT CRUD ───────────────────────────────────────────────
  async findAll(query: { status?: string; type?: string; search?: string }) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
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

  async findOne(id: string) {
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
    if (!shift) throw new NotFoundException(`Shift ${id} not found`);
    return shift;
  }

  async create(dto: CreateShiftDto) {
    const existing = await this.prisma.shift.findUnique({
      where: { code: dto.code },
    });
    if (existing)
      throw new BadRequestException(`Shift code "${dto.code}" already exists`);
    const shift = await this.prisma.shift.create({ data: { ...dto } });
    await this.prisma.shiftHistory.create({
      data: {
        action: 'SHIFT_CREATED',
        details: `Shift "${shift.name}" created`,
      },
    });
    return shift;
  }

  async update(id: string, dto: UpdateShiftDto) {
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

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.shiftAssignment.deleteMany({ where: { shiftId: id } });
    await this.prisma.shift.delete({ where: { id } });
    await this.prisma.shiftHistory.create({
      data: { action: 'SHIFT_DELETED', details: `Shift ${id} deleted` },
    });
    return { message: 'Shift deleted successfully' };
  }

  // ─── SHIFT ASSIGNMENTS ────────────────────────────────────────
  async bulkAssign(dto: CreateShiftAssignmentDto) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: dto.shiftId },
    });
    if (!shift) throw new NotFoundException('Shift not found');

    const start = new Date(dto.startDate);
    const end = dto.endDate ? new Date(dto.endDate) : null;

    const results: { employeeId: string; status: string }[] = [];

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

  async updateAssignment(id: string, dto: UpdateShiftAssignmentDto) {
    const updateData: any = {};
    if (dto.shiftId) updateData.shiftId = dto.shiftId;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    else if (dto.endDate === null) updateData.endDate = null;

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

  async removeAssignment(id: string) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.prisma.shiftAssignment.delete({ where: { id } });
    return { message: 'Assignment removed' };
  }

  async getAssignmentsByEmployee(employeeId: string) {
    return this.prisma.shiftAssignment.findMany({
      where: { employeeId },
      include: { shift: true },
      orderBy: { startDate: 'desc' },
    });
  }

  // ─── SHIFT ROTATIONS ─────────────────────────────────────────
  async getRotations() {
    return this.prisma.shiftRotation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRotation(dto: CreateShiftRotationDto) {
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

  // ─── SHIFT REQUESTS ──────────────────────────────────────────
  async getRequests(query: { status?: string; employeeId?: string }, user?: any) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;

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

  async createRequest(userId: string, dto: CreateShiftRequestDto) {
    const emp = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!emp) throw new NotFoundException('Employee not found');

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

  async approveRequest(
    id: string,
    approverId: string,
    dto: ApproveShiftRequestDto,
  ) {
    const req = await this.prisma.shiftRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PENDING')
      throw new BadRequestException('Request already processed');

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

  async rejectRequest(
    id: string,
    approverId: string,
    dto: ApproveShiftRequestDto,
  ) {
    const req = await this.prisma.shiftRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PENDING')
      throw new BadRequestException('Request already processed');

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

  // ─── WEEKLY OFF ──────────────────────────────────────────────
  async createWeeklyOff(dto: CreateWeeklyOffDto) {
    return this.prisma.weeklyOff.create({
      data: {
        employeeId: dto.employeeId,
        departmentId: dto.departmentId,
        days: dto.days.join(','),
      },
    });
  }

  // ─── SHIFT EXCEPTIONS ────────────────────────────────────────
  async createException(dto: CreateShiftExceptionDto) {
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

  // ─── SHIFT HISTORY ───────────────────────────────────────────
  async getHistory() {
    return this.prisma.shiftHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ─── DASHBOARD ───────────────────────────────────────────────
  async getDashboard() {
    const [
      totalShifts,
      totalAssignments,
      pendingRequests,
      activeShifts,
      history,
    ] = await Promise.all([
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

  // ─── CALENDAR VIEW ───────────────────────────────────────────
  async getCalendar(year: number, month: number) {
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
}
