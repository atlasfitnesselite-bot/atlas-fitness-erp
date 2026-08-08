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
exports.CleaningController = void 0;
const common_1 = require("@nestjs/common");
const cleaning_service_1 = require("./cleaning.service");
const passport_1 = require("@nestjs/passport");
let CleaningController = class CleaningController {
    cleaningService;
    constructor(cleaningService) {
        this.cleaningService = cleaningService;
    }
    getAreas() {
        return this.cleaningService.getAreas();
    }
    createArea(data) {
        return this.cleaningService.createArea(data);
    }
    getChecklists(date, areaId, status, assignedTo) {
        return this.cleaningService.getChecklists({ date, areaId, status, assignedTo });
    }
    createChecklist(data) {
        return this.cleaningService.createChecklist(data);
    }
    updateChecklistStatus(id, data, req) {
        return this.cleaningService.updateChecklistStatus(id, {
            status: data.status,
            verifiedBy: data.status === 'VERIFIED' ? req.user.id : undefined
        });
    }
    updateTask(id, data) {
        return this.cleaningService.updateTask(id, data);
    }
};
exports.CleaningController = CleaningController;
__decorate([
    (0, common_1.Get)('areas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CleaningController.prototype, "getAreas", null);
__decorate([
    (0, common_1.Post)('areas'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleaningController.prototype, "createArea", null);
__decorate([
    (0, common_1.Get)('checklists'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('areaId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('assignedTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], CleaningController.prototype, "getChecklists", null);
__decorate([
    (0, common_1.Post)('checklists'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CleaningController.prototype, "createChecklist", null);
__decorate([
    (0, common_1.Put)('checklists/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CleaningController.prototype, "updateChecklistStatus", null);
__decorate([
    (0, common_1.Put)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CleaningController.prototype, "updateTask", null);
exports.CleaningController = CleaningController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('cleaning'),
    __metadata("design:paramtypes", [cleaning_service_1.CleaningService])
], CleaningController);
//# sourceMappingURL=cleaning.controller.js.map