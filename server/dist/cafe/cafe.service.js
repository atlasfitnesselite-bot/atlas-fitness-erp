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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CafeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
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
    async getOrderById(id) {
        const order = await this.prisma.cafeOrder.findUnique({
            where: { id },
            include: { items: { include: { item: true } }, member: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Cafe order not found');
        return order;
    }
    async payOrder(id, data) {
        const order = await this.getOrderById(id);
        if (order.paymentStatus === 'PAID') {
            throw new common_1.BadRequestException('Order is already fully paid');
        }
        const remaining = Math.max(0, order.totalAmount - (order.paidAmount || 0));
        const payAmt = data.amount !== undefined && data.amount > 0
            ? Math.min(data.amount, remaining)
            : remaining;
        const newPaid = (order.paidAmount || 0) + payAmt;
        const paymentStatus = newPaid >= order.totalAmount - 0.01 ? 'PAID' : 'PARTIAL';
        return this.prisma.cafeOrder.update({
            where: { id },
            data: {
                paidAmount: newPaid,
                paymentStatus,
                paymentMethod: data.paymentMethod || order.paymentMethod,
                razorpayOrderId: data.razorpayOrderId ?? order.razorpayOrderId,
                razorpayPaymentId: data.razorpayPaymentId ?? order.razorpayPaymentId,
                status: paymentStatus === 'PAID' && order.status === 'PENDING' ? 'COMPLETED' : order.status,
            },
            include: { items: { include: { item: true } }, member: true },
        });
    }
    async getRazorpayConfig() {
        const settings = await this.prisma.companySettings.findFirst({
            where: { razorpayKeyId: { not: null }, razorpayKeySecret: { not: null } },
        });
        const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
        const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            throw new common_1.BadRequestException('Razorpay keys not configured');
        }
        return {
            keyId,
            keySecret,
            instance: new razorpay_1.default({ key_id: keyId, key_secret: keySecret }),
        };
    }
    async createRazorpayOrder(orderId) {
        const order = await this.getOrderById(orderId);
        if (order.paymentStatus === 'PAID') {
            throw new common_1.BadRequestException('Order is already paid');
        }
        const balance = Math.max(0, order.totalAmount - (order.paidAmount || 0));
        if (balance <= 0) {
            throw new common_1.BadRequestException('No balance due on this order');
        }
        const { keyId, instance } = await this.getRazorpayConfig();
        const rzpOrder = await instance.orders.create({
            amount: Math.round(balance * 100),
            currency: 'INR',
            receipt: order.orderNumber,
            payment_capture: true,
        });
        await this.prisma.cafeOrder.update({
            where: { id: orderId },
            data: { razorpayOrderId: rzpOrder.id },
        });
        return { success: true, order: rzpOrder, key: keyId };
    }
    async verifyRazorpayPayment(orderId, body) {
        const { keySecret } = await this.getRazorpayConfig();
        const expected = crypto
            .createHmac('sha256', keySecret)
            .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
            .digest('hex');
        if (expected !== body.razorpay_signature) {
            throw new common_1.BadRequestException('Invalid Razorpay signature');
        }
        const updated = await this.payOrder(orderId, {
            paymentMethod: 'RAZORPAY',
            razorpayOrderId: body.razorpay_order_id,
            razorpayPaymentId: body.razorpay_payment_id,
        });
        return { success: true, order: updated };
    }
    async createOrder(data) {
        if (!data.items || data.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }
        const orderCount = await this.prisma.cafeOrder.count();
        const orderNumber = `CAFE-${1000 + orderCount + 1}`;
        return this.prisma.$transaction(async (prisma) => {
            let subtotal = 0;
            let totalGst = 0;
            const preparedItems = [];
            for (const i of data.items) {
                const qty = Math.max(1, Number(i.quantity || 1));
                const dbItem = await prisma.cafeItem.findUnique({ where: { id: i.itemId } });
                if (!dbItem) {
                    throw new Error(`Cafe item not found: ${i.itemId}`);
                }
                const unitPrice = i.price !== undefined ? Number(i.price) : dbItem.price;
                const itemGstRate = dbItem.gstRate ?? 0;
                const lineAmount = unitPrice * qty;
                subtotal += lineAmount;
                preparedItems.push({
                    itemId: dbItem.id,
                    productName: dbItem.name,
                    quantity: qty,
                    price: unitPrice,
                    gstRate: itemGstRate,
                    amount: lineAmount,
                    notes: i.notes,
                });
            }
            const rawDiscount = Number(data.discount || 0);
            const discountAmount = rawDiscount > 0
                ? data.discountType === 'PERCENTAGE'
                    ? (subtotal * rawDiscount) / 100
                    : rawDiscount
                : 0;
            const discountedSubtotal = Math.max(0, subtotal - discountAmount);
            const discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 0;
            for (const p of preparedItems) {
                totalGst += (p.amount * discountRatio * (p.gstRate ?? 0)) / 100;
            }
            const cgst = totalGst / 2;
            const sgst = totalGst / 2;
            const totalAmount = discountedSubtotal + totalGst;
            const isCashPaid = data.paymentMethod?.toUpperCase() === 'CASH';
            const paymentStatus = isCashPaid ? 'PAID' : 'PENDING';
            const paidAmount = isCashPaid ? totalAmount : 0;
            const order = await prisma.cafeOrder.create({
                data: {
                    orderNumber,
                    subtotal,
                    gstAmount: totalGst,
                    cgst,
                    sgst,
                    discount: discountAmount,
                    discountType: data.discountType || 'AMOUNT',
                    totalAmount,
                    paidAmount,
                    paymentStatus,
                    paymentMethod: data.paymentMethod,
                    status: 'PENDING',
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    memberId: data.memberId,
                    tableNumber: data.tableNumber,
                    items: {
                        create: preparedItems,
                    },
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