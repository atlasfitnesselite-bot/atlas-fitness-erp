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
exports.CafeController = void 0;
const common_1 = require("@nestjs/common");
const cafe_service_1 = require("./cafe.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let CafeController = class CafeController {
    cafeService;
    constructor(cafeService) {
        this.cafeService = cafeService;
    }
    getMenu() {
        return this.cafeService.getMenu();
    }
    createMenuItem(data) {
        return this.cafeService.createMenuItem(data);
    }
    updateMenuItem(id, data) {
        return this.cafeService.updateMenuItem(id, data);
    }
    getInventoryTransactions() {
        return this.cafeService.getInventoryTransactions();
    }
    updateStock(data) {
        return this.cafeService.updateStock(data);
    }
    getSuppliers() {
        return this.cafeService.getSuppliers();
    }
    createSupplier(data) {
        return this.cafeService.createSupplier(data);
    }
    updateSupplier(id, data) {
        return this.cafeService.updateSupplier(id, data);
    }
    getOrders() {
        return this.cafeService.getOrders();
    }
    createOrder(data) {
        return this.cafeService.createOrder(data);
    }
    updateOrderStatus(id, data) {
        return this.cafeService.updateOrderStatus(id, data);
    }
    getReportsSummary() {
        return this.cafeService.getReportsSummary();
    }
    submitChecklist(data) {
        return this.cafeService.submitChecklist(data);
    }
    getChecklists() {
        return this.cafeService.getChecklists();
    }
    submitPrepLog(data) {
        return this.cafeService.submitPrepLog(data);
    }
    getPrepLogs() {
        return this.cafeService.getPrepLogs();
    }
    submitHygieneLog(data) {
        return this.cafeService.submitHygieneLog(data);
    }
    getHygieneLogs() {
        return this.cafeService.getHygieneLogs();
    }
    getCafeExpenses() {
        return this.cafeService.getCafeExpenses();
    }
    createCafeExpense(data) {
        return this.cafeService.createCafeExpense(data);
    }
};
exports.CafeController = CafeController;
__decorate([
    (0, common_1.Get)('menu'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Post)('menu'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "createMenuItem", null);
__decorate([
    (0, common_1.Put)('menu/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "updateMenuItem", null);
__decorate([
    (0, common_1.Get)('inventory/transactions'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getInventoryTransactions", null);
__decorate([
    (0, common_1.Post)('inventory/stock'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Get)('suppliers'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getSuppliers", null);
__decorate([
    (0, common_1.Post)('suppliers'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Put)('suppliers/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id/status'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('reports/summary'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getReportsSummary", null);
__decorate([
    (0, common_1.Post)('checklists'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "submitChecklist", null);
__decorate([
    (0, common_1.Get)('checklists'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getChecklists", null);
__decorate([
    (0, common_1.Post)('prep-logs'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "submitPrepLog", null);
__decorate([
    (0, common_1.Get)('prep-logs'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getPrepLogs", null);
__decorate([
    (0, common_1.Post)('hygiene-logs'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "submitHygieneLog", null);
__decorate([
    (0, common_1.Get)('hygiene-logs'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getHygieneLogs", null);
__decorate([
    (0, common_1.Get)('expenses'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "getCafeExpenses", null);
__decorate([
    (0, common_1.Post)('expenses'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'CAFE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CafeController.prototype, "createCafeExpense", null);
exports.CafeController = CafeController = __decorate([
    (0, common_1.Controller)('cafe'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [cafe_service_1.CafeService])
], CafeController);
//# sourceMappingURL=cafe.controller.js.map