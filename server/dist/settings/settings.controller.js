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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const settings_service_1 = require("./settings.service");
const settings_dto_1 = require("./dto/settings.dto");
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getCompanySettings() {
        return this.settingsService.getCompanySettings();
    }
    updateCompanySettings(req, dto) {
        return this.settingsService.updateCompanySettings(req.user.id, dto);
    }
    getThemeSettings(req) {
        return this.settingsService.getThemeSettings(req.user.id);
    }
    updateThemeSettings(req, dto) {
        return this.settingsService.updateThemeSettings(req.user.id, dto);
    }
    getAllRoles() {
        return this.settingsService.getAllRoles();
    }
    updateRolePermissions(id, dto) {
        return this.settingsService.updateRolePermissions(id, dto.permissionIds);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('company'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getCompanySettings", null);
__decorate([
    (0, common_1.Put)('company'),
    (0, roles_decorator_1.Roles)('OWNER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.UpdateCompanySettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateCompanySettings", null);
__decorate([
    (0, common_1.Get)('theme'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getThemeSettings", null);
__decorate([
    (0, common_1.Put)('theme'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.UpdateThemeSettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateThemeSettings", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, roles_decorator_1.Roles)('OWNER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getAllRoles", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, roles_decorator_1.Roles)('OWNER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, settings_dto_1.UpdateRolePermissionsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateRolePermissions", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map