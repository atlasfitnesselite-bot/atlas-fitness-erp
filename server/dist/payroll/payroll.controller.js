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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const payroll_service_1 = require("./payroll.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const payroll_dto_1 = require("./dto/payroll.dto");
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async getStructure(employeeId) {
        return this.payrollService.getStructure(employeeId);
    }
    async setStructure(employeeId, dto) {
        return this.payrollService.setStructure(employeeId, dto);
    }
    async generateSlips(dto) {
        return this.payrollService.generateSlips(dto);
    }
    async getSummary(month, year) {
        return this.payrollService.getSummary(month ? parseInt(month, 10) : undefined, year ? parseInt(year, 10) : undefined);
    }
    async getAllSlips(month, year) {
        return this.payrollService.getAllSlips(month ? parseInt(month, 10) : undefined, year ? parseInt(year, 10) : undefined);
    }
    async markAsPaid(id) {
        return this.payrollService.markAsPaid(id);
    }
    async updateSlip(id, body) {
        return this.payrollService.updateSlip(id, body.bonuses || 0, body.otherPenalties || 0);
    }
    async getMySlips(req, year) {
        return this.payrollService.getMySlips(req.user.id, year ? parseInt(year, 10) : undefined);
    }
    async getSlips(employeeId, year) {
        return this.payrollService.getSlips(employeeId, year ? parseInt(year, 10) : undefined);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Get)('structure/:employeeId'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getStructure", null);
__decorate([
    (0, common_1.Put)('structure/:employeeId'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_dto_1.SetPayrollStructureDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "setStructure", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_dto_1.GenerateSalarySlipDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generateSlips", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('slips'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getAllSlips", null);
__decorate([
    (0, common_1.Put)('slips/:id/pay'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Put)('slips/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "updateSlip", null);
__decorate([
    (0, common_1.Get)('slips/me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getMySlips", null);
__decorate([
    (0, common_1.Get)('slips/employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getSlips", null);
exports.PayrollController = PayrollController = __decorate([
    (0, common_1.Controller)('payroll'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map