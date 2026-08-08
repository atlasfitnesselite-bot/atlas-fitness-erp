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
exports.VisitorController = void 0;
const common_1 = require("@nestjs/common");
const visitor_service_1 = require("./visitor.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let VisitorController = class VisitorController {
    visitorService;
    constructor(visitorService) {
        this.visitorService = visitorService;
    }
    create(createVisitorDto, req) {
        return this.visitorService.create(createVisitorDto, req.user.id);
    }
    findAll() {
        return this.visitorService.findAll();
    }
    findToday() {
        return this.visitorService.findToday();
    }
    checkout(id) {
        return this.visitorService.checkout(id);
    }
};
exports.VisitorController = VisitorController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VisitorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VisitorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VisitorController.prototype, "findToday", null);
__decorate([
    (0, common_1.Put)(':id/checkout'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisitorController.prototype, "checkout", null);
exports.VisitorController = VisitorController = __decorate([
    (0, common_1.Controller)('visitors'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [visitor_service_1.VisitorService])
], VisitorController);
//# sourceMappingURL=visitor.controller.js.map