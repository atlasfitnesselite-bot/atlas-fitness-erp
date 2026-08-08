"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KioskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
const bcrypt = __importStar(require("bcrypt"));
let KioskService = class KioskService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async memberCheckIn(dto) {
        const { identifier } = dto;
        const member = await this.prisma.member.findFirst({
            where: {
                OR: [
                    { memberId: identifier },
                    { mobile: identifier },
                ],
            },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found with the provided identifier.');
        }
        await this.prisma.memberCheckIn.create({
            data: {
                memberId: member.id,
            },
        });
        this.eventsGateway.server.emit('live_checkin', { type: 'MEMBER', name: member.firstName });
        return {
            success: true,
            memberName: `${member.firstName} ${member.lastName}`.trim(),
            message: 'Check-in successful',
        };
    }
    async employeeCheckIn(dto) {
        const { employeeId, pin } = dto;
        const employee = await this.prisma.employee.findUnique({
            where: { employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found with the provided ID.');
        }
        const isPinValid = employee.hashedPin ? await bcrypt.compare(pin, employee.hashedPin) : false;
        if (!isPinValid) {
            throw new common_1.UnauthorizedException('Invalid PIN.');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await this.prisma.attendance.create({
            data: {
                employeeId: employee.id,
                date: today,
                clockIn: new Date(),
                status: 'PRESENT',
            },
        });
        this.eventsGateway.server.emit('live_checkin', { type: 'STAFF', name: employee.firstName });
        return {
            success: true,
            employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
            message: 'Employee check-in successful',
        };
    }
};
exports.KioskService = KioskService;
exports.KioskService = KioskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], KioskService);
//# sourceMappingURL=kiosk.service.js.map