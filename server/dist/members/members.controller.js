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
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_config_1 = require("./multer.config");
const members_service_1 = require("./members.service");
const create_member_dto_1 = require("./dto/create-member.dto");
const update_member_dto_1 = require("./dto/update-member.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let MembersController = class MembersController {
    membersService;
    constructor(membersService) {
        this.membersService = membersService;
    }
    create(createMemberDto, req) {
        return this.membersService.create(createMemberDto, req.user.userId);
    }
    findAll(query) {
        return this.membersService.findAll(query);
    }
    findOne(id) {
        return this.membersService.findOne(id);
    }
    update(id, updateMemberDto, req) {
        return this.membersService.update(id, updateMemberDto, req.user.userId);
    }
    remove(id, req) {
        return this.membersService.remove(id, req.user.userId);
    }
    getTimeline(id) {
        return this.membersService.getTimeline(id);
    }
    async uploadDocument(id, file, body, req) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        return this.membersService.addDocument(id, {
            type: body.type,
            title: body.title,
            fileUrl: `/uploads/members/${file.filename}`,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedById: req.user.userId,
        });
    }
    deleteDocument(id, docId) {
        return this.membersService.deleteDocument(id, docId);
    }
    getNotes(id) {
        return this.membersService.getNotes(id);
    }
    async issueAccessCard(id, accessCardId) {
        return this.membersService.issueAccessCard(id, accessCardId);
    }
    addNote(id, body, req) {
        return this.membersService.addNote(id, {
            ...body,
            authorId: req.user.userId,
        });
    }
    deleteNote(id, noteId) {
        return this.membersService.deleteNote(id, noteId);
    }
    getMeasurements(id) {
        return this.membersService.getMeasurements(id);
    }
    addMeasurement(id, body) {
        return this.membersService.addMeasurement(id, body);
    }
    freezeSubscription(id, subId, frozenUntil) {
        return this.membersService.freezeSubscription(id, subId, new Date(frozenUntil));
    }
    transferSubscription(id, subId, targetMemberId) {
        return this.membersService.transferSubscription(id, subId, targetMemberId);
    }
    updateAgreement(id, subId, agreementUrl) {
        return this.membersService.updateSubscriptionAgreement(id, subId, agreementUrl);
    }
    getInvoices(id) {
        return this.membersService.getInvoices(id);
    }
    getAttendance(id) {
        return this.membersService.getAttendance(id);
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_member_dto_1.CreateMemberDto, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_member_dto_1.UpdateMemberDto, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: multer_config_1.memberStorage })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Delete)(':id/documents/:docId'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Get)(':id/notes'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getNotes", null);
__decorate([
    (0, common_1.Put)(':id/access-card'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('accessCardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "issueAccessCard", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "addNote", null);
__decorate([
    (0, common_1.Delete)(':id/notes/:noteId'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('noteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "deleteNote", null);
__decorate([
    (0, common_1.Get)(':id/measurements'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getMeasurements", null);
__decorate([
    (0, common_1.Post)(':id/measurements'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'TRAINER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "addMeasurement", null);
__decorate([
    (0, common_1.Put)(':id/subscriptions/:subId/freeze'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('subId')),
    __param(2, (0, common_1.Body)('frozenUntil')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "freezeSubscription", null);
__decorate([
    (0, common_1.Put)(':id/subscriptions/:subId/transfer'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('subId')),
    __param(2, (0, common_1.Body)('targetMemberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "transferSubscription", null);
__decorate([
    (0, common_1.Put)(':id/subscriptions/:subId/agreement'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('subId')),
    __param(2, (0, common_1.Body)('agreementUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "updateAgreement", null);
__decorate([
    (0, common_1.Get)(':id/invoices'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)(':id/attendance'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "getAttendance", null);
exports.MembersController = MembersController = __decorate([
    (0, common_1.Controller)('members'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [members_service_1.MembersService])
], MembersController);
//# sourceMappingURL=members.controller.js.map