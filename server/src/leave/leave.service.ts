import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  CreateLeaveRequestDto,
  ApproveLeaveRequestDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  AdjustLeaveBalanceDto,
} from './dto/leave.dto';

const DEFAULT_LEAVE_TYPES = [
  {
    name: 'Casual Leave',
    code: 'CL',
    description: 'For urgent or unforeseen matters',
    isPaid: true,
    maxDaysPerYear: 12,
    carryForwardAllowed: false,
    requiresApproval: true,
  },
  {
    name: 'Sick Leave',
    code: 'SL',
    description: 'For medical reasons',
    isPaid: true,
    maxDaysPerYear: 12,
    carryForwardAllowed: true,
    requiresApproval: true,
  },
  {
    name: 'Paid Leave',
    code: 'PL',
    description: 'Earned paid time off',
    isPaid: true,
    maxDaysPerYear: 15,
    carryForwardAllowed: true,
    requiresApproval: true,
  },
  {
    name: 'Unpaid Leave',
    code: 'UPL',
    description: 'Leave without pay',
    isPaid: false,
    maxDaysPerYear: 30,
    carryForwardAllowed: false,
    requiresApproval: true,
  },
  {
    name: 'Emergency Leave',
    code: 'EL',
    description: 'For severe emergencies',
    isPaid: true,
    maxDaysPerYear: 5,
    carryForwardAllowed: false,
    requiresApproval: true,
  },
  {
    name: 'Maternity Leave',
    code: 'ML',
    description: 'For expecting mothers',
    isPaid: true,
    maxDaysPerYear: 90,
    carryForwardAllowed: false,
    requiresApproval: true,
  },
  {
    name: 'Paternity Leave',
    code: 'PTL',
    description: 'For expecting fathers',
    isPaid: true,
    maxDaysPerYear: 14,
    carryForwardAllowed: false,
    requiresApproval: true,
  },
  {
    name: 'Comp Off',
    code: 'COFF',
    description: 'Compensatory off for extra days worked',
    isPaid: true,
    maxDaysPerYear: 10,
    carryForwardAllowed: false,
    requiresApproval: true,
  },
];

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultLeaveTypes();
  }

  private async seedDefaultLeaveTypes() {
    const count = await this.prisma.leaveType.count();
    if (count === 0) {
      for (const lt of DEFAULT_LEAVE_TYPES) {
        await this.prisma.leaveType.create({ data: lt });
      }
      console.log('Seeded default Leave Types');
    }
  }

  // --- LEAVE TYPES ---
  async getLeaveTypes() {
    return this.prisma.leaveType.findMany({ orderBy: { name: 'asc' } });
  }

  async getLeaveTypeById(id: string) {
    const lt = await this.prisma.leaveType.findUnique({ where: { id } });
    if (!lt) throw new NotFoundException('Leave type not found');
    return lt;
  }

  async createLeaveType(dto: CreateLeaveTypeDto) {
    const existing = await this.prisma.leaveType.findUnique({
      where: { code: dto.code },
    });
    if (existing)
      throw new BadRequestException('Leave type code already exists');
    return this.prisma.leaveType.create({ data: dto });
  }

  async updateLeaveType(id: string, dto: UpdateLeaveTypeDto) {
    return this.prisma.leaveType.update({ where: { id }, data: dto });
  }

  async deleteLeaveType(id: string) {
    const inUse = await this.prisma.leaveRequest.findFirst({
      where: { leaveTypeId: id },
    });
    if (inUse) throw new BadRequestException('Cannot delete leave type in use');
    return this.prisma.leaveType.delete({ where: { id } });
  }

  // --- LEAVE BALANCES ---
  async getLeaveBalances(employeeId?: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const whereClause: any = { year: currentYear };
    if (employeeId) whereClause.employeeId = employeeId;

    return this.prisma.leaveBalance.findMany({
      where: whereClause,
      include: { employee: true, leaveType: true },
      orderBy: { employee: { firstName: 'asc' } },
    });
  }

  async adjustLeaveBalance(dto: AdjustLeaveBalanceDto) {
    const existing = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: dto.employeeId,
          leaveTypeId: dto.leaveTypeId,
          year: dto.year,
        },
      },
    });

    const currentAllocated = existing?.allocated || 0;
    const currentUsed = existing?.used || 0;
    const currentCF = existing?.carriedForward || 0;

    const newAllocated =
      dto.allocated !== undefined ? dto.allocated : currentAllocated;
    const newUsed = dto.used !== undefined ? dto.used : currentUsed;
    const newCF =
      dto.carriedForward !== undefined ? dto.carriedForward : currentCF;
    const newBalance = newAllocated + newCF - newUsed;

    if (existing) {
      return this.prisma.leaveBalance.update({
        where: { id: existing.id },
        data: {
          allocated: newAllocated,
          used: newUsed,
          carriedForward: newCF,
          balance: newBalance,
        },
      });
    } else {
      return this.prisma.leaveBalance.create({
        data: {
          employeeId: dto.employeeId,
          leaveTypeId: dto.leaveTypeId,
          year: dto.year,
          allocated: newAllocated,
          used: newUsed,
          carriedForward: newCF,
          balance: newBalance,
        },
      });
    }
  }

  // --- LEAVE REQUESTS ---
  async getLeaveRequests(status?: string, employeeId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        employee: true,
        leaveType: true,
        approvals: { include: { manager: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeaveRequest(dto: CreateLeaveRequestDto) {
    const employeeId = dto.employeeId;
    if (!employeeId) {
      throw new BadRequestException('Employee profile not found for this user');
    }

    // 1. Validation (overlapping requests)
    const fromDate = new Date(dto.fromDate);
    const toDate = new Date(dto.toDate);

    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { notIn: ['REJECTED', 'CANCELLED'] },
        OR: [{ fromDate: { lte: toDate }, toDate: { gte: fromDate } }],
      },
    });

    if (overlap)
      throw new BadRequestException(
        'You already have a leave request during this period',
      );

    // 2. Create the request
    const req = await this.prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        fromDate,
        toDate,
        isHalfDay: dto.isHalfDay || false,
        reason: dto.reason,
        attachmentUrl: dto.attachmentUrl,
      },
    });

    // 3. Log history
    await this.prisma.leaveHistory.create({
      data: {
        leaveRequestId: req.id,
        action: 'APPLIED',
        details: 'Leave request submitted',
      },
    });

    return req;
  }

  async approveLeaveRequest(id: string, dto: ApproveLeaveRequestDto) {
    const req = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true },
    });
    if (!req) throw new NotFoundException('Leave request not found');
    if (req.status !== 'PENDING')
      throw new BadRequestException(`Request is already ${req.status}`);

    const newStatus = dto.status; // APPROVED or REJECTED

    await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: newStatus },
    });

    await this.prisma.leaveApproval.create({
      data: {
        leaveRequestId: id,
        managerId: dto.managerId,
        status: newStatus,
        comments: dto.comments,
      },
    });

    await this.prisma.leaveHistory.create({
      data: {
        leaveRequestId: id,
        action: newStatus,
        details: dto.comments,
        performedById: dto.managerId,
      },
    });

    // If approved, deduct balance
    if (newStatus === 'APPROVED' && req.leaveType.isPaid) {
      const year = new Date(req.fromDate).getFullYear();
      let days = 1;
      if (!req.isHalfDay) {
        const diffTime = Math.abs(
          new Date(req.toDate).getTime() - new Date(req.fromDate).getTime(),
        );
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      } else {
        days = 0.5;
      }

      const balance = await this.prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: req.employeeId,
            leaveTypeId: req.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        await this.adjustLeaveBalance({
          employeeId: req.employeeId,
          leaveTypeId: req.leaveTypeId,
          year,
          used: balance.used + days,
        });
      }
    }

    return { message: `Request ${newStatus.toLowerCase()} successfully` };
  }

  async cancelLeaveRequest(id: string) {
    const req = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true },
    });
    if (!req) throw new NotFoundException('Leave request not found');

    if (req.status === 'CANCELLED')
      throw new BadRequestException('Request already cancelled');

    const wasApproved = req.status === 'APPROVED';

    await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.leaveHistory.create({
      data: {
        leaveRequestId: id,
        action: 'CANCELLED',
        details: 'Cancelled by employee',
      },
    });

    // If it was already approved, refund the balance
    if (wasApproved && req.leaveType.isPaid) {
      const year = new Date(req.fromDate).getFullYear();
      let days = 1;
      if (!req.isHalfDay) {
        const diffTime = Math.abs(
          new Date(req.toDate).getTime() - new Date(req.fromDate).getTime(),
        );
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      } else {
        days = 0.5;
      }

      const balance = await this.prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: req.employeeId,
            leaveTypeId: req.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        await this.adjustLeaveBalance({
          employeeId: req.employeeId,
          leaveTypeId: req.leaveTypeId,
          year,
          used: Math.max(0, balance.used - days),
        });
      }
    }

    return { message: 'Request cancelled successfully' };
  }

  // --- HOLIDAYS ---
  async getHolidays(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01`);
    const endDate = new Date(`${targetYear}-12-31`);

    return this.prisma.holiday.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
      include: { department: true },
    });
  }

  async createHoliday(dto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        description: dto.description,
        departmentId: dto.departmentId,
        status: dto.status || 'ACTIVE',
      },
    });
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.holiday.update({ where: { id }, data });
  }

  async deleteHoliday(id: string) {
    return this.prisma.holiday.delete({ where: { id } });
  }

  // --- DASHBOARD / REPORTS ---
  async getLeaveDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRequests, pendingApprovals, approvedLeaves, employeesOnLeave] =
      await Promise.all([
        this.prisma.leaveRequest.count(),
        this.prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        this.prisma.leaveRequest.count({ where: { status: 'APPROVED' } }),
        this.prisma.leaveRequest.count({
          where: {
            status: 'APPROVED',
            fromDate: { lte: today },
            toDate: { gte: today },
          },
        }),
      ]);

    return {
      totalRequests,
      pendingApprovals,
      approvedLeaves,
      employeesOnLeave,
    };
  }
}
