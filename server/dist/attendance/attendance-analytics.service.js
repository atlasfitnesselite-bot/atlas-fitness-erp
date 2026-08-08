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
exports.AttendanceAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceAnalyticsService = class AttendanceAnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardAnalytics(dateStr) {
        const date = new Date(dateStr);
        const totalEmployees = await this.prisma.employee.count({
            where: { status: 'ACTIVE' },
        });
        const todayAttendances = await this.prisma.attendance.findMany({
            where: { date: new Date(date.toISOString().split('T')[0]) },
            include: { employee: { include: { department: true } } },
        });
        const presentCount = todayAttendances.filter((a) => a.clockIn).length;
        const absentCount = totalEmployees - presentCount;
        const lateCount = todayAttendances.filter((a) => a.lateMinutes > 0).length;
        const onBreakCount = todayAttendances.filter((a) => a.status === 'ON_BREAK').length;
        const clockedOutCount = todayAttendances.filter((a) => a.clockOut).length;
        const pendingRequests = await this.prisma.attendanceCorrection.count({
            where: { status: 'PENDING' },
        });
        const shiftDistribution = [
            { name: 'Morning', count: presentCount * 0.5, color: '#f59e0b' },
            { name: 'Evening', count: presentCount * 0.3, color: '#6366f1' },
            { name: 'Night', count: presentCount * 0.2, color: '#1e293b' },
        ];
        return {
            presentToday: presentCount,
            absentToday: absentCount,
            pendingRequests,
            systemHealth: 99.9,
            totalEmployees,
            presentCount,
            absentCount,
            lateCount,
            onBreakCount,
            clockedOutCount,
            onLeaveCount: 0,
            holidayCount: 0,
            weeklyOffCount: 0,
            workingEmployees: presentCount - clockedOutCount - onBreakCount,
            avgWorkingHours: presentCount > 0
                ? todayAttendances.reduce((acc, curr) => acc + curr.workingHours, 0) /
                    presentCount
                : 0,
            overtimeEmployees: todayAttendances.filter((a) => a.overtime > 0).length,
            pendingCorrections: pendingRequests,
            shiftDistribution,
            attendances: todayAttendances,
        };
    }
    async getAttendanceTrend(startDate, endDate) {
        const records = await this.prisma.attendance.findMany({
            where: { date: { gte: startDate, lte: endDate } },
        });
        const totalEmployees = await this.prisma.employee.count({
            where: { status: 'ACTIVE' },
        });
        const trendMap = new Map();
        records.forEach((r) => {
            const d = r.date.toISOString().split('T')[0];
            if (r.clockIn) {
                trendMap.set(d, (trendMap.get(d) || 0) + 1);
            }
        });
        const result = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const present = trendMap.get(dateStr) || 0;
            const absent = Math.max(0, totalEmployees - present);
            result.push({
                date: dateStr,
                present,
                absent,
            });
        }
        return result;
    }
    async syncPayrollSummary(employeeId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        const attendances = await this.prisma.attendance.findMany({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate },
            },
        });
        let workingDays = 0;
        let presentDays = 0;
        let lateCount = 0;
        let lateMinutes = 0;
        let overtimeHours = 0;
        let breakHours = 0;
        let totalWorkingHrs = 0;
        attendances.forEach((a) => {
            workingDays++;
            if (a.clockIn)
                presentDays++;
            if (a.lateMinutes > 0) {
                lateCount++;
                lateMinutes += a.lateMinutes;
            }
            overtimeHours += a.overtime;
            breakHours += a.breakDuration / 60;
            totalWorkingHrs += a.workingHours;
        });
        const leaves = await this.prisma.leaveRequest.findMany({
            where: {
                employeeId,
                status: 'APPROVED',
                OR: [
                    { fromDate: { lte: endDate }, toDate: { gte: startDate } }
                ]
            },
            include: { leaveType: true }
        });
        let paidLeave = 0;
        let unpaidLeave = 0;
        leaves.forEach(leave => {
            const lStart = leave.fromDate < startDate ? startDate : leave.fromDate;
            const lEnd = leave.toDate > endDate ? endDate : leave.toDate;
            let days = 1;
            if (!leave.isHalfDay) {
                const diffTime = Math.abs(lEnd.getTime() - lStart.getTime());
                days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }
            else {
                days = 0.5;
            }
            if (leave.leaveType.isPaid) {
                paidLeave += days;
            }
            else {
                unpaidLeave += days;
            }
        });
        const absentDays = Math.max(0, workingDays - presentDays - paidLeave - unpaidLeave);
        const holidayWork = 0;
        const weeklyOffWork = 0;
        const salaryDays = presentDays + paidLeave;
        return this.prisma.attendanceSummary.upsert({
            where: {
                employeeId_month_year: { employeeId, month, year },
            },
            update: {
                workingDays,
                presentDays,
                absentDays,
                paidLeave,
                unpaidLeave,
                lateCount,
                lateMinutes,
                overtimeHours,
                holidayWork,
                weeklyOffWork,
                breakHours,
                totalWorkingHrs,
                salaryDays,
            },
            create: {
                employeeId,
                month,
                year,
                workingDays,
                presentDays,
                absentDays,
                paidLeave,
                unpaidLeave,
                lateCount,
                lateMinutes,
                overtimeHours,
                holidayWork,
                weeklyOffWork,
                breakHours,
                totalWorkingHrs,
                salaryDays,
            },
        });
    }
    async getPayrollSummary(month, year) {
        return this.prisma.attendanceSummary.findMany({
            where: { month, year },
            include: { employee: true },
        });
    }
};
exports.AttendanceAnalyticsService = AttendanceAnalyticsService;
exports.AttendanceAnalyticsService = AttendanceAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceAnalyticsService);
//# sourceMappingURL=attendance-analytics.service.js.map