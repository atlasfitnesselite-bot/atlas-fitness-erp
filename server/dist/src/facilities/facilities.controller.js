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
exports.FacilitiesController = void 0;
const common_1 = require("@nestjs/common");
const facilities_service_1 = require("./facilities.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let FacilitiesController = class FacilitiesController {
    facilitiesService;
    constructor(facilitiesService) {
        this.facilitiesService = facilitiesService;
    }
    getMaintenanceTickets() {
        return this.facilitiesService.getMaintenanceTickets();
    }
    createMaintenanceTicket(data) {
        return this.facilitiesService.createMaintenanceTicket(data);
    }
    resolveMaintenanceTicket(id) {
        return this.facilitiesService.resolveMaintenanceTicket(id);
    }
    getCleaningZones() {
        return this.facilitiesService.getCleaningZones();
    }
    createCleaningZone(data) {
        return this.facilitiesService.createCleaningZone(data);
    }
    toggleCleaningTask(id, isCompleted) {
        return this.facilitiesService.toggleCleaningTask(id, isCompleted);
    }
};
exports.FacilitiesController = FacilitiesController;
__decorate([
    (0, common_1.Get)('maintenance'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "getMaintenanceTickets", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CLEANING'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "createMaintenanceTicket", null);
__decorate([
    (0, common_1.Put)('maintenance/:id/resolve'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "resolveMaintenanceTicket", null);
__decorate([
    (0, common_1.Get)('cleaning'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CLEANING'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "getCleaningZones", null);
__decorate([
    (0, common_1.Post)('cleaning'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "createCleaningZone", null);
__decorate([
    (0, common_1.Put)('cleaning/task/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CLEANING'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isCompleted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], FacilitiesController.prototype, "toggleCleaningTask", null);
exports.FacilitiesController = FacilitiesController = __decorate([
    (0, common_1.Controller)('facilities'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [facilities_service_1.FacilitiesService])
], FacilitiesController);
//# sourceMappingURL=facilities.controller.js.map