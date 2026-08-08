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
exports.AttendanceReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceReportsService = class AttendanceReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateReport(type, format, generatedBy, metadata) {
        const fileUrl = `/reports/${type.toLowerCase()}_${Date.now()}.${format.toLowerCase()}`;
        return this.prisma.attendanceReport.create({
            data: {
                name: `${type} Attendance Report`,
                type,
                format,
                generatedBy,
                fileUrl,
                status: 'COMPLETED',
            },
        });
    }
    async getReports() {
        return this.prisma.attendanceReport.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async getLateReports(startDate, endDate) {
        return this.prisma.lateRecord.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
            include: {
                attendance: true,
                employee: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOvertimeReports(startDate, endDate) {
        return this.prisma.overtime.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
            include: {
                attendance: true,
                employee: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getBreakReports(startDate, endDate) {
        return this.prisma.breakHistory.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
            include: {
                attendance: true,
                employee: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTimeline(employeeId, limit = 20) {
        return this.prisma.attendanceLog.findMany({
            where: { employeeId },
            orderBy: { timestamp: 'desc' },
            take: limit,
            include: { attendance: true },
        });
    }
};
exports.AttendanceReportsService = AttendanceReportsService;
exports.AttendanceReportsService = AttendanceReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceReportsService);
//# sourceMappingURL=attendance-reports.service.js.map