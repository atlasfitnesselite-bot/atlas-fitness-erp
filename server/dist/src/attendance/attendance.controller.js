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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const attendance_analytics_service_1 = require("./attendance-analytics.service");
const attendance_reports_service_1 = require("./attendance-reports.service");
const attendance_dto_1 = require("./dto/attendance.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const kiosk_guard_1 = require("../rbac/guards/kiosk.guard");
class SelfCheckInOutDto {
    offlineTimestamp;
    location;
    device;
}
let AttendanceController = class AttendanceController {
    attendanceService;
    attendanceAnalyticsService;
    attendanceReportsService;
    constructor(attendanceService, attendanceAnalyticsService, attendanceReportsService) {
        this.attendanceService = attendanceService;
        this.attendanceAnalyticsService = attendanceAnalyticsService;
        this.attendanceReportsService = attendanceReportsService;
    }
    async getDashboardAnalytics(date) {
        return this.attendanceAnalyticsService.getDashboardAnalytics(date || new Date().toISOString());
    }
    async getAttendanceTrend(startDate, endDate) {
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(new Date().setDate(end.getDate() - 30));
        return this.attendanceAnalyticsService.getAttendanceTrend(start, end);
    }
    async getPayrollSummary(month, year) {
        return this.attendanceAnalyticsService.getPayrollSummary(parseInt(month), parseInt(year));
    }
    async getLateReports(startDate, endDate) {
        return this.attendanceReportsService.getLateReports(new Date(startDate), new Date(endDate));
    }
    async getOvertimeReports(startDate, endDate) {
        return this.attendanceReportsService.getOvertimeReports(new Date(startDate), new Date(endDate));
    }
    async getBreakReports(startDate, endDate) {
        return this.attendanceReportsService.getBreakReports(new Date(startDate), new Date(endDate));
    }
    async getTimeline(employeeId, limit) {
        return this.attendanceReportsService.getTimeline(employeeId, limit ? parseInt(limit) : undefined);
    }
    async getKioskEmployees() {
        return this.attendanceService.getKioskEmployees();
    }
    async checkIn(data) {
        return this.attendanceService.checkIn(data);
    }
    async checkOut(data) {
        return this.attendanceService.checkOut(data);
    }
    async breakStart(data) {
        return this.attendanceService.breakStart(data);
    }
    async breakEnd(data) {
        return this.attendanceService.breakEnd(data);
    }
    async selfClockIn(req, data) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.attendanceService.selfClockIn(req.user.id, data);
    }
    async selfClockOut(req, data) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.attendanceService.selfClockOut(req.user.id, data);
    }
    async selfStatus(req) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.attendanceService.selfStatus(req.user.id);
    }
    async getAttendance(search, departmentId, status, startDate, endDate, page, limit) {
        return this.attendanceService.getAttendanceRecords({
            search,
            departmentId,
            status,
            startDate,
            endDate,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
    async getDailyReport(date) {
        return this.attendanceService.getDailyReport(date);
    }
    async getWeeklyReport(startDate) {
        return this.attendanceService.getWeeklyReport(startDate);
    }
    async getMonthlyReport(month, year) {
        return this.attendanceService.getMonthlyReport(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    }
    async getSettings() {
        return this.attendanceService.getSettings();
    }
    async updateSettings(data) {
        return this.attendanceService.updateSettings(data);
    }
    async getCorrections(status) {
        return this.attendanceService.getCorrections(status);
    }
    async requestCorrection(req, data) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.attendanceService.createCorrection(req.user.id, data);
    }
    async handleCorrection(id, req, data) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.attendanceService.handleCorrectionApproval(id, req.user.id, data);
    }
    async getEmployeeAttendance(employeeId) {
        return this.attendanceService.getEmployeeAttendance(employeeId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('analytics/dashboard'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getDashboardAnalytics", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('analytics/trend'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceTrend", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('payroll-ready'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getPayrollSummary", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('reports/late'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getLateReports", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('reports/overtime'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getOvertimeReports", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('reports/break'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getBreakReports", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('timeline/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), kiosk_guard_1.KioskGuard),
    (0, common_1.Get)('kiosk-employees'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getKioskEmployees", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), kiosk_guard_1.KioskGuard),
    (0, common_1.Post)('check-in'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.CheckInOutDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkIn", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), kiosk_guard_1.KioskGuard),
    (0, common_1.Post)('check-out'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.CheckInOutDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkOut", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), kiosk_guard_1.KioskGuard),
    (0, common_1.Post)('break-start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.CheckInOutDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "breakStart", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), kiosk_guard_1.KioskGuard),
    (0, common_1.Post)('break-end'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.CheckInOutDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "breakEnd", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('me/clock-in'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, SelfCheckInOutDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "selfClockIn", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('me/clock-out'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, SelfCheckInOutDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "selfClockOut", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me/status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "selfStatus", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('departmentId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('report/daily'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getDailyReport", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('report/weekly'),
    __param(0, (0, common_1.Query)('startDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getWeeklyReport", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('report/monthly'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMonthlyReport", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getSettings", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.UpdateSettingsDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('corrections'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getCorrections", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('correction'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attendance_dto_1.CreateCorrectionDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "requestCorrection", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Put)('correction/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, attendance_dto_1.UpdateCorrectionDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "handleCorrection", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getEmployeeAttendance", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        attendance_analytics_service_1.AttendanceAnalyticsService,
        attendance_reports_service_1.AttendanceReportsService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map