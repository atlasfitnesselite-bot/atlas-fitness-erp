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
exports.KioskController = void 0;
const common_1 = require("@nestjs/common");
const kiosk_service_1 = require("./kiosk.service");
const kiosk_dto_1 = require("./dto/kiosk.dto");
let KioskController = class KioskController {
    kioskService;
    constructor(kioskService) {
        this.kioskService = kioskService;
    }
    async memberCheckIn(dto) {
        return this.kioskService.memberCheckIn(dto);
    }
    async employeeCheckIn(dto) {
        return this.kioskService.employeeCheckIn(dto);
    }
};
exports.KioskController = KioskController;
__decorate([
    (0, common_1.Post)('member-checkin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kiosk_dto_1.MemberCheckInDto]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "memberCheckIn", null);
__decorate([
    (0, common_1.Post)('employee-checkin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kiosk_dto_1.EmployeeCheckInDto]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "employeeCheckIn", null);
exports.KioskController = KioskController = __decorate([
    (0, common_1.Controller)('kiosk'),
    __metadata("design:paramtypes", [kiosk_service_1.KioskService])
], KioskController);
//# sourceMappingURL=kiosk.controller.js.map