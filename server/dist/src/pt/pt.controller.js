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
exports.PtController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const pt_service_1 = require("./pt.service");
const pt_dto_1 = require("./dto/pt.dto");
let PtController = class PtController {
    ptService;
    constructor(ptService) {
        this.ptService = ptService;
    }
    async getSessions() {
        return this.ptService.getSessions();
    }
    async createSession(dto) {
        return this.ptService.bookSession(dto);
    }
    async bookSession(dto) {
        return this.ptService.bookSession(dto);
    }
    async getFitnessPlans(memberId) {
        return this.ptService.getFitnessPlans(memberId);
    }
    async createFitnessPlan(dto) {
        return this.ptService.createFitnessPlan(dto);
    }
    async updateFitnessPlan(id, dto) {
        return this.ptService.updateFitnessPlan(id, dto);
    }
    async deleteFitnessPlan(id) {
        return this.ptService.deleteFitnessPlan(id);
    }
    async updateSessionStatus(id, status, notes) {
        return this.ptService.updateSessionStatus(id, status, notes);
    }
    async completeSession(sessionId, dto) {
        return this.ptService.completeSession(sessionId, dto);
    }
    async updateSessionNotes(id, notes) {
        return this.ptService.updateSessionNotes(id, notes);
    }
    async updateSessionFeedback(id, clientFeedback) {
        return this.ptService.updateSessionFeedback(id, clientFeedback);
    }
    async getTrainerStats(req) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.ptService.getTrainerStats(req.user.id);
    }
    async getTrainerDashboard(req) {
        if (!req.user || !req.user.id)
            throw new common_1.UnauthorizedException();
        return this.ptService.getTrainerDashboard(req.user.id);
    }
    async getMemberProfile(memberId) {
        return this.ptService.getMemberProfile(memberId);
    }
    async getMemberProgress(memberId) {
        return this.ptService.getMemberProgress(memberId);
    }
    async addMeasurement(memberId, dto) {
        return this.ptService.addMeasurement(memberId, dto);
    }
    async uploadProgressPhoto(memberId, file) {
        if (!file)
            throw new Error('Photo file is required');
        const photoUrl = `/uploads/pt/${file.filename}`;
        return this.ptService.addProgressPhoto(memberId, photoUrl);
    }
    async getMyCommission(req) {
        return this.ptService.getMyCommission(req.user.id);
    }
    async getCommission(trainerId) {
        return this.ptService.getCommission(trainerId);
    }
    async createCommission(dto) {
        return this.ptService.createCommission(dto);
    }
    async getLeaderboard() {
        return this.ptService.getLeaderboard();
    }
};
exports.PtController = PtController;
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER', 'FRONT_DESK'),
    (0, common_1.Get)('sessions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getSessions", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER', 'FRONT_DESK'),
    (0, common_1.Post)('sessions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pt_dto_1.BookSessionDto]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "createSession", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER', 'FRONT_DESK'),
    (0, common_1.Post)('sessions/book'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pt_dto_1.BookSessionDto]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "bookSession", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Get)('fitness-plans'),
    __param(0, (0, common_1.Query)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getFitnessPlans", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Post)('fitness-plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pt_dto_1.CreateFitnessPlanDto]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "createFitnessPlan", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Put)('fitness-plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "updateFitnessPlan", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Delete)('fitness-plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "deleteFitnessPlan", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Put)('sessions/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "updateSessionStatus", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Put)('sessions/:sessionId/complete'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pt_dto_1.CompleteSessionDto]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "completeSession", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Put)('sessions/:id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "updateSessionNotes", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Put)('sessions/:id/feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('clientFeedback')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "updateSessionFeedback", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('TRAINER'),
    (0, common_1.Get)('trainer/stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getTrainerStats", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('TRAINER', 'MANAGER', 'OWNER'),
    (0, common_1.Get)('trainer/dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getTrainerDashboard", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Get)('members/:memberId/profile'),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getMemberProfile", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Get)('members/:memberId/progress'),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getMemberProgress", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Post)('members/:memberId/measurements'),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pt_dto_1.CreateMeasurementDto]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "addMeasurement", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Post)('members/:memberId/progress-photos'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/pt',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "uploadProgressPhoto", null);
__decorate([
    (0, roles_decorator_1.Roles)('TRAINER'),
    (0, common_1.Get)('trainer/commission'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getMyCommission", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Get)('commission/:trainerId'),
    __param(0, (0, common_1.Param)('trainerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getCommission", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)('commission'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pt_dto_1.CreateCommissionDto]),
    __metadata("design:returntype", Promise)
], PtController.prototype, "createCommission", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    (0, common_1.Get)('leaderboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PtController.prototype, "getLeaderboard", null);
exports.PtController = PtController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('pt'),
    __metadata("design:paramtypes", [pt_service_1.PtService])
], PtController);
//# sourceMappingURL=pt.controller.js.map