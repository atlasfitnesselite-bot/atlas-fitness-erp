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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getSalesOverview() {
        return this.reportsService.getSalesOverview();
    }
    getComprehensiveReport(timeframe, date) {
        return this.reportsService.generateComprehensiveReport(timeframe || 'monthly', date || new Date().toISOString());
    }
    getAuditorReport(timeframe, date, startDate, endDate) {
        return this.reportsService.getAuditorReport({ timeframe, date, startDate, endDate });
    }
    async exportAuditorCsv(res, timeframe, date, startDate, endDate) {
        const csv = await this.reportsService.exportAuditorCsv({
            timeframe,
            date,
            startDate,
            endDate,
        });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=CA_Auditor_GST_Report.csv');
        res.send(csv);
    }
    async exportAuditorPdf(res, timeframe, date, startDate, endDate) {
        const buffer = await this.reportsService.exportAuditorPdf({
            timeframe,
            date,
            startDate,
            endDate,
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=CA_Auditor_GST_Report.pdf');
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('sales'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSalesOverview", null);
__decorate([
    (0, common_1.Get)('comprehensive'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Query)('timeframe')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getComprehensiveReport", null);
__decorate([
    (0, common_1.Get)('auditor'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Query)('timeframe')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAuditorReport", null);
__decorate([
    (0, common_1.Get)('auditor/export/csv'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('timeframe')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportAuditorCsv", null);
__decorate([
    (0, common_1.Get)('auditor/export/pdf'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('timeframe')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportAuditorPdf", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map