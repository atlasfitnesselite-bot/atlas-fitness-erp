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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    createClass(data) {
        return this.prisma.groupClass.create({
            data: {
                name: data.name,
                instructorId: data.instructorId,
                date: new Date(data.date),
                startTime: data.startTime,
                endTime: data.endTime,
                capacity: Number(data.capacity),
            },
        });
    }
    async findToday() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return this.prisma.groupClass.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                instructor: true,
                _count: { select: { bookings: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async bookClass(classId, memberId) {
        const groupClass = await this.prisma.groupClass.findUnique({
            where: { id: classId },
            include: { _count: { select: { bookings: true } } },
        });
        if (!groupClass)
            throw new common_1.BadRequestException('Class not found');
        if (groupClass._count.bookings >= groupClass.capacity) {
            throw new common_1.BadRequestException('Class is full');
        }
        const existing = await this.prisma.classBooking.findUnique({
            where: {
                classId_memberId: { classId, memberId }
            }
        });
        if (existing) {
            throw new common_1.BadRequestException('Member already booked for this class');
        }
        return this.prisma.classBooking.create({
            data: {
                classId,
                memberId,
            },
        });
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map