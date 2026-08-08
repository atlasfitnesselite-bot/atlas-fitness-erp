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
exports.CafeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let CafeService = class CafeService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getMenu() {
        return this.prisma.cafeItem.findMany({
            include: { transactions: true },
            orderBy: { name: 'asc' },
        });
    }
    async createMenuItem(data) {
        return this.prisma.cafeItem.create({
            data,
        });
    }
    async updateMenuItem(id, data) {
        return this.prisma.cafeItem.update({
            where: { id },
            data,
        });
    }
    async getInventoryTransactions() {
        return this.prisma.cafeInventoryTransaction.findMany({
            include: { item: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStock(data) {
        const modQuantity = (data.type === 'OUT' || data.type === 'SPOILAGE') ? -Math.abs(data.quantity) : data.quantity;
        return this.prisma.$transaction(async (prisma) => {
            const item = await prisma.cafeItem.findUnique({ where: { id: data.itemId } });
            if (!item)
                throw new Error('CafeItem not found');
            const transaction = await prisma.cafeInventoryTransaction.create({
                data: {
                    itemId: data.itemId,
                    quantity: data.quantity,
                    type: data.type,
                    notes: data.notes,
                },
            });
            const updatedItem = await prisma.cafeItem.update({
                where: { id: data.itemId },
                data: { stock: { increment: modQuantity } },
            });
            if (updatedItem.stock < 10) {
                this.notificationsService.broadcastToRole({
                    title: 'Inventory Low',
                    message: `${updatedItem.name} stock is critically low (${updatedItem.stock} remaining).`,
                    type: 'WARNING',
                    targetRole: 'MANAGER',
                }).catch(console.error);
            }
            return transaction;
        });
    }
    async getSuppliers() {
        return this.prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async createSupplier(data) {
        return this.prisma.supplier.create({
            data,
        });
    }
    async updateSupplier(id, data) {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }
    async getOrders() {
        return this.prisma.cafeOrder.findMany({
            include: { items: { include: { item: true } }, member: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createOrder(data) {
        let totalAmount = 0;
        for (const i of data.items) {
            totalAmount += i.price * i.quantity;
        }
        const orderCount = await this.prisma.cafeOrder.count();
        const orderNumber = `CAFE-${1000 + orderCount + 1}`;
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.cafeOrder.create({
                data: {
                    orderNumber,
                    totalAmount,
                    status: 'PENDING',
                    customerName: data.customerName,
                    memberId: data.memberId,
                    tableNumber: data.tableNumber,
                    items: {
                        create: data.items.map(item => ({
                            itemId: item.itemId,
                            quantity: item.quantity,
                            price: item.price,
                            notes: item.notes,
                        }))
                    }
                },
                include: { items: true },
            });
            for (const orderItem of data.items) {
                const updatedItem = await prisma.cafeItem.update({
                    where: { id: orderItem.itemId },
                    data: { stock: { decrement: orderItem.quantity } }
                });
                if (updatedItem.stock < 10) {
                    this.notificationsService.broadcastToRole({
                        title: 'Inventory Low',
                        message: `${updatedItem.name} stock is critically low (${updatedItem.stock} remaining).`,
                        type: 'WARNING',
                        targetRole: 'MANAGER',
                    }).catch(console.error);
                }
                await prisma.cafeInventoryTransaction.create({
                    data: {
                        itemId: orderItem.itemId,
                        quantity: orderItem.quantity,
                        type: 'OUT',
                        notes: `Order #${orderNumber}`
                    }
                });
            }
            return order;
        });
    }
    async updateOrderStatus(id, data) {
        return this.prisma.cafeOrder.update({
            where: { id },
            data: {
                status: data.status,
                prepTime: data.prepTime !== undefined ? Number(data.prepTime) : undefined,
            },
        });
    }
    async getReportsSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrders = await this.prisma.cafeOrder.findMany({
            where: {
                createdAt: { gte: today },
                status: 'COMPLETED'
            },
            include: { items: { include: { item: true } } }
        });
        const totalSalesToday = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrdersToday = todaysOrders.length;
        const itemSales = {};
        todaysOrders.forEach(order => {
            order.items.forEach(orderItem => {
                if (!itemSales[orderItem.itemId]) {
                    itemSales[orderItem.itemId] = {
                        name: orderItem.item.name,
                        quantity: 0
                    };
                }
                itemSales[orderItem.itemId].quantity += orderItem.quantity;
            });
        });
        const topSellingItems = Object.values(itemSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        return {
            totalSalesToday,
            totalOrdersToday,
            topSellingItems,
        };
    }
    async submitChecklist(data) {
        return this.prisma.kitchenChecklist.create({
            data: {
                type: data.type,
                completedBy: data.completedBy,
                items: JSON.stringify(data.items),
                notes: data.notes
            }
        });
    }
    async getChecklists() {
        return this.prisma.kitchenChecklist.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async submitPrepLog(data) {
        return this.prisma.foodPrepLog.create({
            data: {
                itemName: data.itemName,
                quantity: parseInt(data.quantity, 10),
                preparedBy: data.preparedBy,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                notes: data.notes
            }
        });
    }
    async getPrepLogs() {
        return this.prisma.foodPrepLog.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async submitHygieneLog(data) {
        return this.prisma.hygieneLog.create({
            data: {
                area: data.area,
                cleanedBy: data.cleanedBy,
                status: data.status,
                notes: data.notes
            }
        });
    }
    async getHygieneLogs() {
        return this.prisma.hygieneLog.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async getCafeExpenses() {
        return this.prisma.expense.findMany({
            where: {
                category: {
                    name: {
                        in: ['CAFE', 'KITCHEN', 'Cafe', 'Kitchen', 'CAFE_EXPENSE', 'KITCHEN_EXPENSE']
                    }
                }
            },
            include: {
                category: true,
                recordedBy: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createCafeExpense(dto) {
        let category = await this.prisma.expenseCategory.findFirst({
            where: { name: dto.categoryName }
        });
        if (!category) {
            category = await this.prisma.expenseCategory.create({
                data: { name: dto.categoryName, description: 'Cafe/Kitchen Expense' }
            });
        }
        return this.prisma.expense.create({
            data: {
                amount: dto.amount,
                description: dto.description,
                categoryId: category.id,
                recordedById: dto.recordedById
            }
        });
    }
};
exports.CafeService = CafeService;
exports.CafeService = CafeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], CafeService);
//# sourceMappingURL=cafe.service.js.map