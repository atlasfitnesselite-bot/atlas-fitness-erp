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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const leave_service_1 = require("./leave.service");
const leave_dto_1 = require("./dto/leave.dto");
let LeaveController = class LeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    getLeaveTypes() {
        return this.leaveService.getLeaveTypes();
    }
    getLeaveTypeById(id) {
        return this.leaveService.getLeaveTypeById(id);
    }
    createLeaveType(dto) {
        return this.leaveService.createLeaveType(dto);
    }
    updateLeaveType(id, dto) {
        return this.leaveService.updateLeaveType(id, dto);
    }
    deleteLeaveType(id) {
        return this.leaveService.deleteLeaveType(id);
    }
    getLeaveBalances(employeeId, year) {
        return this.leaveService.getLeaveBalances(employeeId, year ? parseInt(year, 10) : undefined);
    }
    adjustLeaveBalance(dto) {
        return this.leaveService.adjustLeaveBalance(dto);
    }
    async getLeaveRequests(req, status, employeeId) {
        const roles = req.user?.roles || [];
        const isAdmin = roles.includes('OWNER') || roles.includes('MANAGER');
        let targetEmpId = employeeId;
        if (!isAdmin) {
            const emp = await this.leaveService['prisma'].employee.findUnique({
                where: { userId: req.user?.id },
                select: { id: true },
            });
            if (!emp)
                return [];
            targetEmpId = emp.id;
        }
        return this.leaveService.getLeaveRequests(status, targetEmpId);
    }
    async createLeaveRequest(req, dto) {
        if (!dto.employeeId) {
            const emp = await this.leaveService['prisma'].employee.findUnique({
                where: { userId: req.user?.id },
                select: { id: true },
            });
            if (emp)
                dto.employeeId = emp.id;
        }
        return this.leaveService.createLeaveRequest(dto);
    }
    async approveLeaveRequest(id, dto, req) {
        const employee = await this.leaveService['prisma'].employee.findUnique({
            where: { userId: req.user.id }
        });
        if (employee) {
            dto.managerId = employee.id;
        }
        return this.leaveService.approveLeaveRequest(id, dto);
    }
    cancelLeaveRequest(id) {
        return this.leaveService.cancelLeaveRequest(id);
    }
    getHolidays(year) {
        return this.leaveService.getHolidays(year ? parseInt(year, 10) : undefined);
    }
    createHoliday(dto) {
        return this.leaveService.createHoliday(dto);
    }
    updateHoliday(id, dto) {
        return this.leaveService.updateHoliday(id, dto);
    }
    deleteHoliday(id) {
        return this.leaveService.deleteHoliday(id);
    }
    getDashboardStats() {
        return this.leaveService.getLeaveDashboardStats();
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getLeaveTypes", null);
__decorate([
    (0, common_1.Get)('types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getLeaveTypeById", null);
__decorate([
    (0, common_1.Post)('types'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.CreateLeaveTypeDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "createLeaveType", null);
__decorate([
    (0, common_1.Put)('types/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, leave_dto_1.UpdateLeaveTypeDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "updateLeaveType", null);
__decorate([
    (0, common_1.Delete)('types/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "deleteLeaveType", null);
__decorate([
    (0, common_1.Get)('balances'),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getLeaveBalances", null);
__decorate([
    (0, common_1.Post)('balances/adjust'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.AdjustLeaveBalanceDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "adjustLeaveBalance", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveRequests", null);
__decorate([
    (0, common_1.Post)('requests'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, leave_dto_1.CreateLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "createLeaveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id/approve'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, leave_dto_1.ApproveLeaveRequestDto, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approveLeaveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "cancelLeaveRequest", null);
__decorate([
    (0, common_1.Get)('holidays'),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getHolidays", null);
__decorate([
    (0, common_1.Post)('holidays'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.CreateHolidayDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "createHoliday", null);
__decorate([
    (0, common_1.Put)('holidays/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, leave_dto_1.UpdateHolidayDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "updateHoliday", null);
__decorate([
    (0, common_1.Delete)('holidays/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "deleteHoliday", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getDashboardStats", null);
exports.LeaveController = LeaveController = __decorate([
    (0, common_1.Controller)('leave'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map