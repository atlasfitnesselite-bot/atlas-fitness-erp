"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const billing_controller_1 = require("./billing.controller");
const pdf_service_1 = require("./pdf.service");
const email_service_1 = require("./email.service");
const billing_cron_service_1 = require("./billing-cron.service");
const old_db_sync_service_1 = require("./old-db-sync.service");
const prisma_module_1 = require("../prisma/prisma.module");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [billing_controller_1.BillingController],
        providers: [billing_service_1.BillingService, pdf_service_1.PdfService, email_service_1.EmailService, billing_cron_service_1.BillingCronService, old_db_sync_service_1.OldDbSyncService],
        exports: [billing_service_1.BillingService, pdf_service_1.PdfService, email_service_1.EmailService, old_db_sync_service_1.OldDbSyncService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map