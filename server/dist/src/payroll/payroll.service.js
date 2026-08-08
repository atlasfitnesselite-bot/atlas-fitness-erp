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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const attendance_analytics_service_1 = require("../attendance/attendance-analytics.service");
let PayrollService = class PayrollService {
    prisma;
    notificationsService;
    attendanceAnalytics;
    constructor(prisma, notificationsService, attendanceAnalytics) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.attendanceAnalytics = attendanceAnalytics;
    }
    async getStructure(employeeId) {
        const structure = await this.prisma.payrollStructure.findUnique({
            where: { employeeId },
        });
        if (!structure) {
            return {
                employeeId,
                baseSalary: 0,
                standardAllowances: "{}",
                standardDeductions: "{}",
            };
        }
        return structure;
    }
    async setStructure(employeeId, dto) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return this.prisma.payrollStructure.upsert({
            where: { employeeId },
            update: {
                baseSalary: dto.baseSalary,
                standardAllowances: JSON.stringify(dto.standardAllowances ?? {}),
                standardDeductions: JSON.stringify(dto.standardDeductions ?? {}),
            },
            create: {
                employeeId,
                baseSalary: dto.baseSalary,
                standardAllowances: JSON.stringify(dto.standardAllowances ?? {}),
                standardDeductions: JSON.stringify(dto.standardDeductions ?? {}),
            },
        });
    }
    async generateSlips(dto) {
        const { month, year } = dto;
        const activeEmployees = await this.prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                payrollStructure: true,
                commissions: {
                    where: { status: 'PENDING', month, year }
                }
            }
        });
        const createdSlips = [];
        for (const emp of activeEmployees) {
            if (!emp.payrollStructure)
                continue;
            await this.attendanceAnalytics.syncPayrollSummary(emp.id, month, year);
            const summaries = await this.prisma.attendanceSummary.findMany({
                where: { employeeId: emp.id, month, year }
            });
            const summary = summaries[0];
            const struct = emp.payrollStructure;
            const baseSalary = struct.baseSalary;
            const workingDays = summary?.workingDays || 0;
            const presentDays = summary?.presentDays || 0;
            const lateMinutes = summary?.lateMinutes || 0;
            const overtimeHours = summary?.overtimeHours || 0;
            const lateDeduction = lateMinutes * (baseSalary / 30 / 480);
            const overtimePay = overtimeHours * (baseSalary / 30 / 8) * 1.5;
            let allowancesTotal = 0;
            let parsedAllowances = typeof struct.standardAllowances === 'string' ? JSON.parse(struct.standardAllowances) : struct.standardAllowances;
            if (parsedAllowances && typeof parsedAllowances === 'object' && !Array.isArray(parsedAllowances)) {
                allowancesTotal = Object.values(parsedAllowances).reduce((sum, val) => sum + (Number(val) || 0), 0);
            }
            let deductionsTotal = 0;
            let parsedDeductions = typeof struct.standardDeductions === 'string' ? JSON.parse(struct.standardDeductions) : struct.standardDeductions;
            if (parsedDeductions && typeof parsedDeductions === 'object' && !Array.isArray(parsedDeductions)) {
                deductionsTotal = Object.values(parsedDeductions).reduce((sum, val) => sum + (Number(val) || 0), 0);
            }
            const ptCommission = emp.commissions?.reduce((sum, comm) => sum + (comm.amount || 0), 0) || 0;
            const grossPay = baseSalary + allowancesTotal + overtimePay + ptCommission;
            const netPay = grossPay - deductionsTotal - lateDeduction;
            const slipData = {
                employeeId: emp.id,
                month,
                year,
                baseSalary,
                workingDays,
                leaveDays: (summary?.paidLeave || 0) + (summary?.unpaidLeave || 0),
                lateMinutes,
                overtimeHours,
                standardAllowances: allowancesTotal,
                overtimePay,
                ptCommission,
                standardDeductions: deductionsTotal,
                latePenalties: lateDeduction,
                grossPay,
                netPay,
                status: 'DRAFT'
            };
            const existingSlip = await this.prisma.salarySlip.findFirst({
                where: { employeeId: emp.id, month, year }
            });
            let slip;
            if (existingSlip) {
                slip = await this.prisma.salarySlip.update({
                    where: { id: existingSlip.id },
                    data: slipData
                });
            }
            else {
                slip = await this.prisma.salarySlip.create({
                    data: slipData
                });
            }
            createdSlips.push(slip);
        }
        return createdSlips;
    }
    async getAllSlips(month, year) {
        const whereClause = {};
        if (month)
            whereClause.month = month;
        if (year)
            whereClause.year = year;
        return this.prisma.salarySlip.findMany({
            where: whereClause,
            include: { employee: true },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
            ],
        });
    }
    async getSlips(employeeId, year) {
        const whereClause = { employeeId };
        if (year) {
            whereClause.year = year;
        }
        return this.prisma.salarySlip.findMany({
            where: whereClause,
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
            ],
        });
    }
    async markAsPaid(id) {
        const slip = await this.prisma.salarySlip.findUnique({
            where: { id },
            include: { employee: true }
        });
        if (!slip)
            throw new common_1.NotFoundException('Slip not found');
        const updatedSlip = await this.prisma.salarySlip.update({
            where: { id },
            data: { status: 'PAID' }
        });
        await this.prisma.trainerCommission.updateMany({
            where: {
                trainerId: slip.employeeId,
                month: slip.month,
                year: slip.year,
                status: 'PENDING'
            },
            data: { status: 'PAID' }
        });
        if (slip.employee.userId) {
            await this.notificationsService.createNotification({
                userId: slip.employee.userId,
                title: 'Salary Processed',
                message: `Your salary for ${slip.month}/${slip.year} has been processed and marked as PAID.`,
                type: 'Payroll'
            });
        }
        return updatedSlip;
    }
    async updateSlip(id, bonuses, otherPenalties) {
        const slip = await this.prisma.salarySlip.findUnique({ where: { id } });
        if (!slip)
            throw new common_1.NotFoundException('Slip not found');
        const grossPay = slip.baseSalary + slip.standardAllowances + slip.overtimePay + slip.ptCommission + (bonuses || 0);
        const netPay = grossPay - slip.standardDeductions - slip.latePenalties - (otherPenalties || 0);
        return this.prisma.salarySlip.update({
            where: { id },
            data: {
                bonuses: bonuses || 0,
                otherPenalties: otherPenalties || 0,
                grossPay,
                netPay
            }
        });
    }
    async getSummary(month, year) {
        const whereClause = {};
        if (month)
            whereClause.month = month;
        if (year)
            whereClause.year = year;
        const slips = await this.prisma.salarySlip.findMany({ where: whereClause });
        let totalGross = 0;
        let totalNet = 0;
        let paidCount = 0;
        let draftCount = 0;
        for (const slip of slips) {
            totalGross += slip.grossPay;
            totalNet += slip.netPay;
            if (slip.status === 'PAID')
                paidCount++;
            else if (slip.status === 'DRAFT')
                draftCount++;
        }
        const employees = new Set(slips.map(s => s.employeeId));
        return {
            totalGross,
            totalNet,
            totalEmployees: employees.size,
            paidCount,
            draftCount,
        };
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        attendance_analytics_service_1.AttendanceAnalyticsService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map