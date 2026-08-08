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
exports.ShiftController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const shift_service_1 = require("./shift.service");
const shift_dto_1 = require("./dto/shift.dto");
let ShiftController = class ShiftController {
    shiftService;
    constructor(shiftService) {
        this.shiftService = shiftService;
    }
    getDashboard() {
        return this.shiftService.getDashboard();
    }
    getCalendar(year, month) {
        return this.shiftService.getCalendar(parseInt(year) || new Date().getFullYear(), parseInt(month) || new Date().getMonth() + 1);
    }
    getHistory() {
        return this.shiftService.getHistory();
    }
    findAll(status, type, search) {
        return this.shiftService.findAll({ status, type, search });
    }
    create(dto) {
        return this.shiftService.create(dto);
    }
    update(id, dto) {
        return this.shiftService.update(id, dto);
    }
    remove(id) {
        return this.shiftService.remove(id);
    }
    getAllAssignments() {
        return this.shiftService.getAllAssignments();
    }
    bulkAssign(dto) {
        return this.shiftService.bulkAssign(dto);
    }
    updateAssignment(id, dto) {
        return this.shiftService.updateAssignment(id, dto);
    }
    removeAssignment(id) {
        return this.shiftService.removeAssignment(id);
    }
    getAssignmentsByEmployee(employeeId) {
        return this.shiftService.getAssignmentsByEmployee(employeeId);
    }
    getRotations() {
        return this.shiftService.getRotations();
    }
    createRotation(dto) {
        return this.shiftService.createRotation(dto);
    }
    getRequests(status, employeeId, req) {
        return this.shiftService.getRequests({ status, employeeId }, req?.user);
    }
    createRequest(dto, req) {
        return this.shiftService.createRequest(req.user.id, dto);
    }
    approveRequest(id, dto, req) {
        return this.shiftService.approveRequest(id, req.user.sub, dto);
    }
    rejectRequest(id, dto, req) {
        return this.shiftService.rejectRequest(id, req.user.sub, dto);
    }
    createWeeklyOff(dto) {
        return this.shiftService.createWeeklyOff(dto);
    }
    createException(dto) {
        return this.shiftService.createException(dto);
    }
    findOne(id) {
        return this.shiftService.findOne(id);
    }
};
exports.ShiftController = ShiftController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.CreateShiftDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_dto_1.UpdateShiftDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('assignments'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getAllAssignments", null);
__decorate([
    (0, common_1.Post)('assignments'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.CreateShiftAssignmentDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Put)('assignments/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_dto_1.UpdateShiftAssignmentDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "updateAssignment", null);
__decorate([
    (0, common_1.Delete)('assignments/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "removeAssignment", null);
__decorate([
    (0, common_1.Get)('assignments/employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getAssignmentsByEmployee", null);
__decorate([
    (0, common_1.Get)('rotations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getRotations", null);
__decorate([
    (0, common_1.Post)('rotations'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.CreateShiftRotationDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "createRotation", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Post)('requests'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.CreateShiftRequestDto, Object]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id/approve'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_dto_1.ApproveShiftRequestDto, Object]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id/reject'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_dto_1.ApproveShiftRequestDto, Object]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Post)('weekly-off'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.CreateWeeklyOffDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "createWeeklyOff", null);
__decorate([
    (0, common_1.Post)('exceptions'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.CreateShiftExceptionDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "createException", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "findOne", null);
exports.ShiftController = ShiftController = __decorate([
    (0, common_1.Controller)('shifts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [shift_service_1.ShiftService])
], ShiftController);
//# sourceMappingURL=shift.controller.js.map