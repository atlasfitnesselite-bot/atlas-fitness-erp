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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const old_db_sync_service_1 = require("./old-db-sync.service");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const pay_invoice_dto_1 = require("./dto/pay-invoice.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let BillingController = class BillingController {
    billingService;
    oldDbSyncService;
    constructor(billingService, oldDbSyncService) {
        this.billingService = billingService;
        this.oldDbSyncService = oldDbSyncService;
    }
    syncOldDb() {
        return this.oldDbSyncService.syncFromOldDb();
    }
    getSummary() {
        return this.billingService.getBillingSummary();
    }
    createInvoice(createInvoiceDto) {
        return this.billingService.createInvoice(createInvoiceDto);
    }
    getInvoices() {
        return this.billingService.getInvoices();
    }
    getInvoiceById(id) {
        return this.billingService.getInvoiceById(id);
    }
    updateInvoice(id, updateDto) {
        return this.billingService.updateInvoice(id, updateDto);
    }
    async downloadInvoicePdf(id, res) {
        const { buffer, filename } = await this.billingService.generatePdfBuffer(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }
    sendInvoiceEmail(id) {
        return this.billingService.sendInvoiceEmail(id);
    }
    payInvoice(id, payInvoiceDto) {
        return this.billingService.payInvoice(id, payInvoiceDto);
    }
    collectPayment(body) {
        return this.billingService.payInvoice(body.invoiceId, {
            amount: body.amount,
            paymentMethod: body.paymentMethod || body.method || 'CASH',
            transactionReference: body.transactionReference,
        });
    }
    createRazorpayOrder(body) {
        return this.billingService.createRazorpayOrder(body.invoiceId);
    }
    verifyRazorpayPayment(body) {
        return this.billingService.verifyRazorpayPayment(body);
    }
    deleteInvoice(id) {
        return this.billingService.deleteInvoice(id);
    }
    verifyPin(req, pin) {
        return this.billingService.verifyRevenuePin(req.user.id, pin);
    }
    changePin(req, currentPin, newPin) {
        return this.billingService.changeRevenuePin(req.user.id, currentPin, newPin);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)('sync-old-db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "syncOldDb", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getSummary", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getInvoiceById", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Put)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "updateInvoice", null);
__decorate([
    (0, common_1.Get)('invoices/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "downloadInvoicePdf", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Post)('invoices/:id/send-email'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sendInvoiceEmail", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Put)('invoices/:id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pay_invoice_dto_1.PayInvoiceDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "payInvoice", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Post)('payments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "collectPayment", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Post)('razorpay/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "createRazorpayOrder", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTION'),
    (0, common_1.Post)('razorpay/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "verifyRazorpayPayment", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Delete)('invoices/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "deleteInvoice", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)('verify-pin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "verifyPin", null);
__decorate([
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    (0, common_1.Post)('change-pin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('currentPin')),
    __param(2, (0, common_1.Body)('newPin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "changePin", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService,
        old_db_sync_service_1.OldDbSyncService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map