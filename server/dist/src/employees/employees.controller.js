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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const employees_service_1 = require("./employees.service");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let EmployeesController = class EmployeesController {
    employeesService;
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    async getEmployees(search, departmentId, designationId, employmentTypeId, status, managerId, page, limit, sortBy, sortOrder) {
        return this.employeesService.getEmployees({
            search,
            departmentId,
            designationId,
            employmentTypeId,
            status,
            managerId,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            sortBy,
            sortOrder,
        });
    }
    async getOrgStructure() {
        return this.employeesService.getOrgStructure();
    }
    async createEmployee(data) {
        return this.employeesService.createEmployee(data);
    }
    async updateEmployee(id, data) {
        return this.employeesService.updateEmployee(id, data);
    }
    async deleteEmployee(id) {
        return this.employeesService.deleteEmployee(id);
    }
    async bulkDelete(body) {
        return this.employeesService.bulkDelete(body.ids);
    }
    async bulkUpdateStatus(body) {
        return this.employeesService.bulkUpdateStatus(body.ids, body.status);
    }
    async importEmployees(body) {
        const results = [];
        for (const emp of body.employees) {
            try {
                const created = await this.employeesService.createEmployee(emp);
                results.push({ email: emp.email, success: true, id: created.id });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Error onboarding employee';
                results.push({
                    email: emp.email,
                    success: false,
                    error: message,
                });
            }
        }
        return { success: true, results };
    }
    async getEmployeeAttendance(id, month, year) {
        return this.employeesService.getEmployeeAttendance(id, month ? parseInt(month) : new Date().getMonth() + 1, year ? parseInt(year) : new Date().getFullYear());
    }
    async getEmployeeLeaveBalance(id) {
        return this.employeesService.getEmployeeLeaveBalance(id);
    }
    async getEmployeeShifts(id) {
        return this.employeesService.getEmployeeShifts(id);
    }
    async getEmployeeNotes(id) {
        return this.employeesService.getEmployeeNotes(id);
    }
    async createEmployeeNote(id, req, body) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.employeesService.createEmployeeNote(id, req.user.id, body.content, body.type);
    }
    async getEmployeeDocuments(id) {
        return this.employeesService.getEmployeeDocuments(id);
    }
    async addEmployeeDocument(id, body) {
        return this.employeesService.addEmployeeDocument(id, body.name, body.fileName, body.fileUrl, body.fileSize, body.mimeType);
    }
    async deleteEmployeeDocument(id, docId) {
        return this.employeesService.deleteEmployeeDocument(id, docId);
    }
    async getEmployeeById(id) {
        return this.employeesService.getEmployeeById(id);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('departmentId')),
    __param(2, (0, common_1.Query)('designationId')),
    __param(3, (0, common_1.Query)('employmentTypeId')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('managerId')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __param(8, (0, common_1.Query)('sortBy')),
    __param(9, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployees", null);
__decorate([
    (0, common_1.Get)('org-structure'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getOrgStructure", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "createEmployee", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "updateEmployee", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "deleteEmployee", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)('bulk-delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "bulkDelete", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)('bulk-status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "bulkUpdateStatus", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "importEmployees", null);
__decorate([
    (0, common_1.Get)(':id/attendance'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployeeAttendance", null);
__decorate([
    (0, common_1.Get)(':id/leave-balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployeeLeaveBalance", null);
__decorate([
    (0, common_1.Get)(':id/shifts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployeeShifts", null);
__decorate([
    (0, common_1.Get)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployeeNotes", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "createEmployeeNote", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployeeDocuments", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "addEmployeeDocument", null);
__decorate([
    (0, common_1.Delete)(':id/documents/:docId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "deleteEmployeeDocument", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployeeById", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map