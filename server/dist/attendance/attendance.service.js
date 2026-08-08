"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = __importStar(require("bcrypt"));
let AttendanceService = class AttendanceService {
    prisma;
    eventsGateway;
    notificationsService;
    constructor(prisma, eventsGateway, notificationsService) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
        this.notificationsService = notificationsService;
    }
    getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    getNormalizedDate(date = new Date()) {
        const localStr = this.getLocalDateString(date);
        return new Date(`${localStr}T00:00:00.000Z`);
    }
    async getSettings() {
        let settings = await this.prisma.attendanceSettings.findFirst();
        if (!settings) {
            settings = await this.prisma.attendanceSettings.create({
                data: {
                    officeStartTime: '09:00',
                    officeEndTime: '17:00',
                    graceTime: 15,
                    lateThreshold: 30,
                    breakDuration: 45,
                    minWorkingHours: 4.0,
                    maxWorkingHours: 12.0,
                    autoLogoutTime: 10,
                    deviceName: 'Reception Tablet',
                    timezone: 'UTC',
                    dateFormat: 'YYYY-MM-DD',
                    timeFormat: 'HH:mm',
                },
            });
        }
        return settings;
    }
    async updateSettings(data) {
        const current = await this.getSettings();
        return this.prisma.attendanceSettings.update({
            where: { id: current.id },
            data,
        });
    }
    async logEmployeeTimeline(employeeId, event, description) {
        await this.prisma.employeeTimeline.create({
            data: {
                employeeId,
                event,
                description,
            },
        });
    }
    async getKioskEmployees() {
        return this.prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                designation: {
                    select: { name: true },
                },
            },
            orderBy: { firstName: 'asc' },
        });
    }
    async checkIn(data) {
        const employee = await this.prisma.employee.findUnique({
            where: { employeeId: data.employeeId },
            include: { department: true, designation: true },
        });
        if (!employee || !employee.hashedPin) {
            throw new common_1.BadRequestException('Employee Not Found or PIN not set');
        }
        const isPinValid = await bcrypt.compare(data.pin, employee.hashedPin);
        if (!isPinValid) {
            throw new common_1.BadRequestException('Wrong PIN');
        }
        if (employee.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Employee status is inactive');
        }
        const todayDate = this.getNormalizedDate();
        const existing = await this.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: employee.id,
                    date: todayDate,
                },
            },
        });
        if (existing && existing.clockIn) {
            throw new common_1.BadRequestException('Already Checked In');
        }
        const now = data.offlineTimestamp
            ? new Date(data.offlineTimestamp)
            : new Date();
        const settings = await this.getSettings();
        const [startHour, startMin] = settings.officeStartTime
            .split(':')
            .map(Number);
        const officeStart = new Date(now);
        officeStart.setHours(startHour, startMin, 0, 0);
        const graceLimit = new Date(officeStart.getTime() + settings.graceTime * 60 * 1000);
        let status = 'PRESENT';
        let lateMinutes = 0;
        if (now > graceLimit) {
            status = 'LATE';
            lateMinutes = Math.round((now.getTime() - officeStart.getTime()) / (60 * 1000));
            this.notificationsService.broadcastToRole({
                title: 'Staff Late',
                message: `${employee.firstName} ${employee.lastName} is late by ${lateMinutes} mins.`,
                type: 'WARNING',
                targetRole: 'MANAGER',
            }).catch(console.error);
        }
        const attendance = await this.prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: employee.id,
                    date: todayDate,
                },
            },
            update: {
                clockIn: now,
                status,
                lateMinutes,
            },
            create: {
                employeeId: employee.id,
                date: todayDate,
                clockIn: now,
                status,
                lateMinutes,
            },
        });
        await this.prisma.attendanceLog.create({
            data: {
                employeeId: employee.id,
                attendanceId: attendance.id,
                type: 'CLOCK_IN',
                method: data.method || 'PIN',
                device: data.device || settings.deviceName,
                location: data.location || 'Reception',
            },
        });
        await this.logEmployeeTimeline(employee.id, 'Clocked In', `Clocked in at ${now.toLocaleTimeString()} via Kiosk mode. Status: ${status}`);
        this.eventsGateway.server.emit('attendance_update', { type: 'CLOCK_IN', name: employee.firstName });
        return {
            success: true,
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                profilePicture: employee.profilePicture,
                department: employee.department?.name,
                designation: employee.designation?.name,
            },
            time: now,
            type: 'CLOCK_IN',
        };
    }
    async checkOut(data) {
        const employee = await this.prisma.employee.findUnique({
            where: { employeeId: data.employeeId },
            include: { department: true, designation: true },
        });
        if (!employee || !employee.hashedPin) {
            throw new common_1.BadRequestException('Employee Not Found or PIN not set');
        }
        const isPinValid = await bcrypt.compare(data.pin, employee.hashedPin);
        if (!isPinValid) {
            throw new common_1.BadRequestException('Wrong PIN');
        }
        const todayDate = this.getNormalizedDate();
        const attendance = await this.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: employee.id,
                    date: todayDate,
                },
            },
        });
        if (!attendance || !attendance.clockIn) {
            throw new common_1.BadRequestException('Clock Out without Clock In');
        }
        if (attendance.clockOut) {
            throw new common_1.BadRequestException('Already Checked Out');
        }
        if (attendance.breakStart && !attendance.breakEnd) {
            throw new common_1.BadRequestException('Clock Out during active break');
        }
        const now = data.offlineTimestamp
            ? new Date(data.offlineTimestamp)
            : new Date();
        const settings = await this.getSettings();
        const totalDurationHrs = (now.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60);
        const finalWorkingHours = Math.max(0, totalDurationHrs - attendance.breakDuration);
        const [endHour, endMin] = settings.officeEndTime.split(':').map(Number);
        const officeEnd = new Date(now);
        officeEnd.setHours(endHour, endMin, 0, 0);
        const shiftHrs = (officeEnd.getTime() - (officeEnd.getTime() - 8 * 60 * 60 * 1000)) /
            (1000 * 60 * 60);
        const overtime = finalWorkingHours > shiftHrs ? finalWorkingHours - shiftHrs : 0;
        const earlyExit = now < officeEnd;
        await this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: now,
                workingHours: finalWorkingHours,
                overtime,
                earlyExit,
                status: finalWorkingHours < settings.minWorkingHours
                    ? 'HALF_DAY'
                    : attendance.status,
            },
        });
        await this.prisma.attendanceLog.create({
            data: {
                employeeId: employee.id,
                attendanceId: attendance.id,
                type: 'CLOCK_OUT',
                method: data.method || 'PIN',
                device: data.device || settings.deviceName,
                location: data.location || 'Reception',
            },
        });
        await this.logEmployeeTimeline(employee.id, 'Clocked Out', `Clocked out at ${now.toLocaleTimeString()} via Kiosk mode. Working hours: ${finalWorkingHours.toFixed(2)}`);
        this.eventsGateway.server.emit('attendance_update', { type: 'CLOCK_OUT', name: employee.firstName });
        return {
            success: true,
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                profilePicture: employee.profilePicture,
                department: employee.department?.name,
                designation: employee.designation?.name,
            },
            time: now,
            type: 'CLOCK_OUT',
        };
    }
    async breakStart(data) {
        const employee = await this.prisma.employee.findUnique({
            where: { employeeId: data.employeeId },
            include: { department: true, designation: true },
        });
        if (!employee || !employee.hashedPin) {
            throw new common_1.BadRequestException('Employee Not Found or PIN not set');
        }
        const isPinValid = await bcrypt.compare(data.pin, employee.hashedPin);
        if (!isPinValid) {
            throw new common_1.BadRequestException('Wrong PIN');
        }
        const todayDate = this.getNormalizedDate();
        const attendance = await this.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: employee.id,
                    date: todayDate,
                },
            },
        });
        if (!attendance || !attendance.clockIn) {
            throw new common_1.BadRequestException('Clock In required before break');
        }
        if (attendance.breakStart && !attendance.breakEnd) {
            throw new common_1.BadRequestException('Break Already Started');
        }
        const now = data.offlineTimestamp
            ? new Date(data.offlineTimestamp)
            : new Date();
        const settings = await this.getSettings();
        await this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                breakStart: now,
                breakEnd: null,
                status: 'ON_BREAK',
            },
        });
        await this.prisma.attendanceLog.create({
            data: {
                employeeId: employee.id,
                attendanceId: attendance.id,
                type: 'BREAK_START',
                method: data.method || 'PIN',
                device: data.device || settings.deviceName,
                location: data.location || 'Reception',
            },
        });
        await this.logEmployeeTimeline(employee.id, 'Break Started', `Started break at ${now.toLocaleTimeString()}`);
        return {
            success: true,
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                profilePicture: employee.profilePicture,
                department: employee.department?.name,
                designation: employee.designation?.name,
            },
            time: now,
            type: 'BREAK_START',
        };
    }
    async breakEnd(data) {
        const employee = await this.prisma.employee.findUnique({
            where: { employeeId: data.employeeId },
            include: { department: true, designation: true },
        });
        if (!employee || !employee.hashedPin) {
            throw new common_1.BadRequestException('Employee Not Found or PIN not set');
        }
        const isPinValid = await bcrypt.compare(data.pin, employee.hashedPin);
        if (!isPinValid) {
            throw new common_1.BadRequestException('Wrong PIN');
        }
        const todayDate = this.getNormalizedDate();
        const attendance = await this.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: employee.id,
                    date: todayDate,
                },
            },
        });
        if (!attendance || !attendance.breakStart) {
            throw new common_1.BadRequestException('Break End before Break Start');
        }
        if (attendance.breakEnd) {
            throw new common_1.BadRequestException('Break Already Ended');
        }
        const now = data.offlineTimestamp
            ? new Date(data.offlineTimestamp)
            : new Date();
        const settings = await this.getSettings();
        const currentBreakHrs = (now.getTime() - attendance.breakStart.getTime()) / (1000 * 60 * 60);
        const cumulativeBreakDuration = attendance.breakDuration + currentBreakHrs;
        await this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                breakEnd: now,
                breakDuration: cumulativeBreakDuration,
                status: attendance.clockOut ? 'PRESENT' : 'PRESENT',
            },
        });
        await this.prisma.attendanceLog.create({
            data: {
                employeeId: employee.id,
                attendanceId: attendance.id,
                type: 'BREAK_END',
                method: data.method || 'PIN',
                device: data.device || settings.deviceName,
                location: data.location || 'Reception',
            },
        });
        await this.logEmployeeTimeline(employee.id, 'Break Ended', `Ended break at ${now.toLocaleTimeString()}. Break duration added: ${(currentBreakHrs * 60).toFixed(0)} mins`);
        return {
            success: true,
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                profilePicture: employee.profilePicture,
                department: employee.department?.name,
                designation: employee.designation?.name,
            },
            time: now,
            type: 'BREAK_END',
        };
    }
    async selfClockIn(userId, data) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId },
            include: { department: true, designation: true },
        });
        if (!employee)
            throw new common_1.BadRequestException('Employee record not found for this user');
        if (employee.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Employee status is inactive');
        const todayDate = this.getNormalizedDate();
        const existing = await this.prisma.attendance.findUnique({
            where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
        });
        if (existing && existing.clockIn)
            throw new common_1.BadRequestException('Already Checked In');
        const now = data.offlineTimestamp ? new Date(data.offlineTimestamp) : new Date();
        const settings = await this.getSettings();
        const [startHour, startMin] = settings.officeStartTime.split(':').map(Number);
        const officeStart = new Date(now);
        officeStart.setHours(startHour, startMin, 0, 0);
        const graceLimit = new Date(officeStart.getTime() + settings.graceTime * 60 * 1000);
        let status = 'PRESENT';
        let lateMinutes = 0;
        if (now > graceLimit) {
            status = 'LATE';
            lateMinutes = Math.round((now.getTime() - officeStart.getTime()) / (60 * 1000));
            this.notificationsService.broadcastToRole({
                title: 'Staff Late',
                message: `${employee.firstName} ${employee.lastName} is late by ${lateMinutes} mins.`,
                type: 'WARNING',
                targetRole: 'MANAGER',
            }).catch(console.error);
        }
        const attendance = await this.prisma.attendance.upsert({
            where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
            update: { clockIn: now, status, lateMinutes },
            create: { employeeId: employee.id, date: todayDate, clockIn: now, status, lateMinutes },
        });
        await this.prisma.attendanceLog.create({
            data: {
                employeeId: employee.id,
                attendanceId: attendance.id,
                type: 'CLOCK_IN',
                method: 'DASHBOARD',
                device: data.device || 'User Device',
                location: data.location || 'Unknown',
            },
        });
        await this.logEmployeeTimeline(employee.id, 'Clocked In', `Clocked in at ${now.toLocaleTimeString()} via Dashboard. Status: ${status}`);
        this.eventsGateway.server.emit('attendance_update', { type: 'CLOCK_IN', name: employee.firstName });
        return { success: true, time: now, type: 'CLOCK_IN' };
    }
    async selfClockOut(userId, data) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId },
            include: { department: true, designation: true },
        });
        if (!employee)
            throw new common_1.BadRequestException('Employee record not found for this user');
        const todayDate = this.getNormalizedDate();
        const attendance = await this.prisma.attendance.findUnique({
            where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
        });
        if (!attendance || !attendance.clockIn)
            throw new common_1.BadRequestException('Clock Out without Clock In');
        if (attendance.clockOut)
            throw new common_1.BadRequestException('Already Checked Out');
        if (attendance.breakStart && !attendance.breakEnd)
            throw new common_1.BadRequestException('Clock Out during active break');
        const now = data.offlineTimestamp ? new Date(data.offlineTimestamp) : new Date();
        const settings = await this.getSettings();
        const totalDurationHrs = (now.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60);
        const finalWorkingHours = Math.max(0, totalDurationHrs - attendance.breakDuration);
        const [endHour, endMin] = settings.officeEndTime.split(':').map(Number);
        const officeEnd = new Date(now);
        officeEnd.setHours(endHour, endMin, 0, 0);
        const shiftHrs = (officeEnd.getTime() - (officeEnd.getTime() - 8 * 60 * 60 * 1000)) / (1000 * 60 * 60);
        const overtime = finalWorkingHours > shiftHrs ? finalWorkingHours - shiftHrs : 0;
        const earlyExit = now < officeEnd;
        await this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: now,
                workingHours: finalWorkingHours,
                overtime,
                earlyExit,
                status: finalWorkingHours < settings.minWorkingHours ? 'HALF_DAY' : attendance.status,
            },
        });
        await this.prisma.attendanceLog.create({
            data: {
                employeeId: employee.id,
                attendanceId: attendance.id,
                type: 'CLOCK_OUT',
                method: 'DASHBOARD',
                device: data.device || 'User Device',
                location: data.location || 'Unknown',
            },
        });
        await this.logEmployeeTimeline(employee.id, 'Clocked Out', `Clocked out at ${now.toLocaleTimeString()} via Dashboard. Working hours: ${finalWorkingHours.toFixed(2)}`);
        this.eventsGateway.server.emit('attendance_update', { type: 'CLOCK_OUT', name: employee.firstName });
        return { success: true, time: now, type: 'CLOCK_OUT' };
    }
    async selfStatus(userId) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId },
        });
        if (!employee)
            throw new common_1.BadRequestException('Employee record not found for this user');
        const todayDate = this.getNormalizedDate();
        const attendance = await this.prisma.attendance.findUnique({
            where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
        });
        if (!attendance) {
            return { status: 'NOT_CLOCKED_IN', attendance: null };
        }
        if (attendance.clockOut) {
            return { status: 'CLOCKED_OUT', attendance };
        }
        if (attendance.breakStart && !attendance.breakEnd) {
            return { status: 'ON_BREAK', attendance };
        }
        return { status: 'CLOCKED_IN', attendance };
    }
    async getAttendanceRecords(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.startDate || query.endDate) {
            where.date = {};
            if (query.startDate) {
                where.date.gte = new Date(`${query.startDate}T00:00:00.000Z`);
            }
            if (query.endDate) {
                where.date.lte = new Date(`${query.endDate}T23:59:59.000Z`);
            }
        }
        if (query.departmentId || query.search) {
            where.employee = {};
            if (query.departmentId) {
                where.employee.departmentId = query.departmentId;
            }
            if (query.search) {
                where.employee.OR = [
                    { firstName: { contains: query.search } },
                    { lastName: { contains: query.search } },
                    { employeeId: { contains: query.search } },
                ];
            }
        }
        const [total, items] = await Promise.all([
            this.prisma.attendance.count({ where }),
            this.prisma.attendance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    employee: {
                        include: { department: true, designation: true },
                    },
                },
            }),
        ]);
        return { total, items, page, limit };
    }
    async getEmployeeAttendance(employeeId) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        const records = await this.prisma.attendance.findMany({
            where: { employeeId },
            orderBy: { date: 'desc' },
            include: {
                logs: true,
                corrections: true,
            },
        });
        return records;
    }
    async getDailyReport(dateStr) {
        const targetDate = dateStr
            ? new Date(`${dateStr}T00:00:00.000Z`)
            : this.getNormalizedDate();
        const records = await this.prisma.attendance.findMany({
            where: { date: targetDate },
            include: {
                employee: {
                    include: { department: true, designation: true },
                },
            },
        });
        const activeEmployeesCount = await this.prisma.employee.count({
            where: { status: 'ACTIVE' },
        });
        const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
        const late = records.filter((r) => r.status === 'LATE').length;
        const onBreak = records.filter((r) => r.status === 'ON_BREAK').length;
        const halfDay = records.filter((r) => r.status === 'HALF_DAY').length;
        const absent = Math.max(0, activeEmployeesCount - (present + halfDay));
        return {
            date: targetDate,
            totalEmployees: activeEmployeesCount,
            present,
            absent,
            late,
            onBreak,
            halfDay,
            attendancePercentage: activeEmployeesCount > 0
                ? ((present + halfDay) / activeEmployeesCount) * 100
                : 0,
            items: records,
        };
    }
    async getWeeklyReport(startDateStr) {
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startNormalized = startDateStr
            ? new Date(`${startDateStr}T00:00:00.000Z`)
            : start;
        const records = await this.prisma.attendance.findMany({
            where: {
                date: {
                    gte: startNormalized,
                    lte: end,
                },
            },
            include: {
                employee: {
                    include: { department: true },
                },
            },
        });
        return records;
    }
    async getMonthlyReport(month, year) {
        const now = new Date();
        const tYear = year || now.getFullYear();
        const tMonth = month ? month - 1 : now.getMonth();
        const start = new Date(tYear, tMonth, 1);
        const end = new Date(tYear, tMonth + 1, 0);
        const records = await this.prisma.attendance.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                employee: {
                    include: { department: true, designation: true },
                },
            },
        });
        return records;
    }
    async getCorrections(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        return this.prisma.attendanceCorrection.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, employeeId: true },
                },
            },
        });
    }
    async createCorrection(requestedById, data) {
        const attendance = await this.prisma.attendance.findFirst({
            where: {
                employeeId: data.employeeId,
                date: new Date(`${data.correctedDate}T00:00:00.000Z`),
            },
        });
        return this.prisma.attendanceCorrection.create({
            data: {
                employeeId: data.employeeId,
                attendanceId: attendance?.id,
                requestedById,
                correctedDate: new Date(`${data.correctedDate}T00:00:00.000Z`),
                type: data.type,
                correctedTime: new Date(data.correctedTime),
                reason: data.reason,
                status: 'PENDING',
            },
        });
    }
    async handleCorrectionApproval(id, approvedById, data) {
        const correction = await this.prisma.attendanceCorrection.findUnique({
            where: { id },
            include: { employee: true },
        });
        if (!correction)
            throw new common_1.NotFoundException('Correction request not found');
        if (correction.status !== 'PENDING')
            throw new common_1.BadRequestException('Request is already processed');
        if (data.status === 'REJECTED') {
            return this.prisma.attendanceCorrection.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    approvedById,
                    reason: data.reason || correction.reason,
                },
            });
        }
        const settings = await this.getSettings();
        const updateData = {};
        if (correction.type === 'CLOCK_IN') {
            updateData.clockIn = correction.correctedTime;
            const [startHour, startMin] = settings.officeStartTime
                .split(':')
                .map(Number);
            const officeStart = new Date(correction.correctedTime);
            officeStart.setHours(startHour, startMin, 0, 0);
            const graceLimit = new Date(officeStart.getTime() + settings.graceTime * 60 * 1000);
            if (correction.correctedTime > graceLimit) {
                updateData.status = 'LATE';
                updateData.lateMinutes = Math.round((correction.correctedTime.getTime() - officeStart.getTime()) /
                    (60 * 1000));
            }
            else {
                updateData.status = 'PRESENT';
                updateData.lateMinutes = 0;
            }
        }
        else if (correction.type === 'CLOCK_OUT') {
            updateData.clockOut = correction.correctedTime;
            const attendance = await this.prisma.attendance.findFirst({
                where: {
                    employeeId: correction.employeeId,
                    date: correction.correctedDate,
                },
            });
            if (attendance && attendance.clockIn) {
                const totalDurationHrs = (correction.correctedTime.getTime() - attendance.clockIn.getTime()) /
                    (1000 * 60 * 60);
                const finalWorkingHours = Math.max(0, totalDurationHrs - attendance.breakDuration);
                updateData.workingHours = finalWorkingHours;
                const [endHour, endMin] = settings.officeEndTime.split(':').map(Number);
                const officeEnd = new Date(correction.correctedTime);
                officeEnd.setHours(endHour, endMin, 0, 0);
                updateData.earlyExit = correction.correctedTime < officeEnd;
                updateData.status =
                    finalWorkingHours < settings.minWorkingHours
                        ? 'HALF_DAY'
                        : attendance.status;
            }
        }
        await this.prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: correction.employeeId,
                    date: correction.correctedDate,
                },
            },
            update: updateData,
            create: {
                employeeId: correction.employeeId,
                date: correction.correctedDate,
                ...updateData,
            },
        });
        await this.logEmployeeTimeline(correction.employeeId, 'Attendance Corrected', `Manual attendance correction (${correction.type}) approved by manager.`);
        return this.prisma.attendanceCorrection.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedById,
            },
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway,
        notifications_service_1.NotificationsService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map