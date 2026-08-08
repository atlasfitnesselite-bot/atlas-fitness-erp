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
exports.EmploymentTypesController = void 0;
const common_1 = require("@nestjs/common");
const employment_types_service_1 = require("./employment-types.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let EmploymentTypesController = class EmploymentTypesController {
    employmentTypesService;
    constructor(employmentTypesService) {
        this.employmentTypesService = employmentTypesService;
    }
    async getEmploymentTypes() {
        return this.employmentTypesService.getEmploymentTypes();
    }
    async getEmploymentTypeById(id) {
        return this.employmentTypesService.getEmploymentTypeById(id);
    }
    async createEmploymentType(data) {
        return this.employmentTypesService.createEmploymentType(data);
    }
    async updateEmploymentType(id, data) {
        return this.employmentTypesService.updateEmploymentType(id, data);
    }
    async deleteEmploymentType(id) {
        return this.employmentTypesService.deleteEmploymentType(id);
    }
};
exports.EmploymentTypesController = EmploymentTypesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmploymentTypesController.prototype, "getEmploymentTypes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmploymentTypesController.prototype, "getEmploymentTypeById", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employment_types_service_1.CreateEmploymentTypeDto]),
    __metadata("design:returntype", Promise)
], EmploymentTypesController.prototype, "createEmploymentType", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employment_types_service_1.CreateEmploymentTypeDto]),
    __metadata("design:returntype", Promise)
], EmploymentTypesController.prototype, "updateEmploymentType", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmploymentTypesController.prototype, "deleteEmploymentType", null);
exports.EmploymentTypesController = EmploymentTypesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('employment-types'),
    __metadata("design:paramtypes", [employment_types_service_1.EmploymentTypesService])
], EmploymentTypesController);
//# sourceMappingURL=employment-types.controller.js.map