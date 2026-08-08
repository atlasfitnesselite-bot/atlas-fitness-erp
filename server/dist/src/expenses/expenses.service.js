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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
let ExpensesService = class ExpensesService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async getCategories() {
        try {
            return await this.prisma.expenseCategory.findMany({
                orderBy: { name: 'asc' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch expense categories');
        }
    }
    async createCategory(dto) {
        try {
            return await this.prisma.expenseCategory.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to create expense category');
        }
    }
    async getExpenses() {
        try {
            return await this.prisma.expense.findMany({
                include: {
                    category: true,
                    recordedBy: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch expenses');
        }
    }
    async createExpense(dto, recordedById) {
        try {
            const expense = await this.prisma.expense.create({
                data: {
                    categoryId: dto.categoryId,
                    amount: dto.amount,
                    description: dto.description,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    recordedById,
                },
            });
            this.eventsGateway.server.emit('new_expense', { amount: dto.amount, description: dto.description });
            return expense;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to create expense');
        }
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map