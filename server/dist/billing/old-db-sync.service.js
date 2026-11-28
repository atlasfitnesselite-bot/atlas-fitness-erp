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
var OldDbSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldDbSyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const pg_1 = require("pg");
let OldDbSyncService = OldDbSyncService_1 = class OldDbSyncService {
    prisma;
    logger = new common_1.Logger(OldDbSyncService_1.name);
    isSyncing = false;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scheduledSync() {
        if (process.env.ENABLE_OLD_DB_SYNC !== 'true' || !process.env.OLD_DATABASE_URL) {
            return;
        }
        await this.syncFromOldDb();
    }
    splitName(fullName) {
        const parts = (fullName || 'Member').trim().split(/\s+/);
        if (parts.length === 1)
            return { firstName: parts[0], lastName: '-' };
        return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
    }
    async syncFromOldDb() {
        if (this.isSyncing) {
            return { skipped: true, message: 'Sync already in progress' };
        }
        const oldUrl = process.env.OLD_DATABASE_URL;
        if (!oldUrl) {
            return { skipped: true, message: 'OLD_DATABASE_URL not configured' };
        }
        this.isSyncing = true;
        const client = new pg_1.Client({
            connectionString: oldUrl,
            ssl: oldUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
        });
        try {
            await client.connect();
            const [plansRes, membersRes, invoicesRes, productsRes, ordersRes, orderItemsRes] = await Promise.all([
                client.query('SELECT * FROM plans'),
                client.query('SELECT * FROM members'),
                client.query('SELECT * FROM invoices'),
                client.query('SELECT * FROM cafeteria_products'),
                client.query('SELECT * FROM cafeteria_orders'),
                client.query('SELECT * FROM cafeteria_order_items'),
            ]);
            const existingPlans = await this.prisma.membershipPlan.findMany();
            const planIdMap = new Map();
            for (const p of plansRes.rows) {
                const match = existingPlans.find((ep) => ep.id === p.id || ep.name === p.name);
                if (match) {
                    planIdMap.set(p.id, match.id);
                }
                else {
                    const created = await this.prisma.membershipPlan.create({
                        data: {
                            id: p.id,
                            name: p.name,
                            durationInMonths: Number(p.duration),
                            price: Number(p.price),
                            gstRate: p.gstRate !== null && p.gstRate !== undefined ? Number(p.gstRate) : 18,
                            description: p.description,
                            isActive: p.isActive ?? true,
                        },
                    });
                    planIdMap.set(p.id, created.id);
                }
            }
            const existingMembers = await this.prisma.member.findMany({
                select: { id: true, memberId: true, mobile: true, email: true },
            });
            const byMemberId = new Map(existingMembers.map((m) => [m.memberId, m.id]));
            const usedMobiles = new Set(existingMembers.map((m) => m.mobile));
            const usedEmails = new Set(existingMembers.map((m) => m.email).filter(Boolean));
            const existingSubs = await this.prisma.memberSubscription.findMany({
                select: { memberId: true, planId: true },
            });
            const subKeys = new Set(existingSubs.map((s) => `${s.memberId}:${s.planId}`));
            const memberIdMap = new Map();
            const newMembersBatch = [];
            const newSubsBatch = [];
            for (const m of membersRes.rows) {
                let targetId = byMemberId.get(m.memberId);
                if (!targetId) {
                    const { firstName, lastName } = this.splitName(m.name);
                    let mobile = (m.phone || '').trim() || `LEGACY-${m.memberId}`;
                    if (usedMobiles.has(mobile))
                        mobile = `${mobile}-${m.memberId}`;
                    usedMobiles.add(mobile);
                    let email = m.email ? String(m.email).trim() : null;
                    if (email && usedEmails.has(email))
                        email = null;
                    if (email)
                        usedEmails.add(email);
                    targetId = m.id;
                    newMembersBatch.push({
                        id: m.id,
                        memberId: m.memberId,
                        firstName,
                        lastName,
                        email,
                        mobile,
                        gender: m.gender || null,
                        dateOfBirth: m.dob ? new Date(m.dob) : null,
                        profilePicture: m.photo ? `/uploads/members/${m.photo.split('/').pop()}` : null,
                        height: m.height,
                        weight: m.weight,
                        workoutType: m.workoutType,
                        gstNumber: m.gstNumber,
                        panNumber: m.panNumber,
                        status: m.status || 'ACTIVE',
                        joiningDate: m.createdAt ? new Date(m.createdAt) : new Date(),
                    });
                }
                memberIdMap.set(m.id, targetId);
                const mappedPlanId = m.planId ? planIdMap.get(m.planId) : null;
                if (mappedPlanId && m.planStartDate && m.planEndDate) {
                    const key = `${targetId}:${mappedPlanId}`;
                    if (!subKeys.has(key)) {
                        subKeys.add(key);
                        newSubsBatch.push({
                            memberId: targetId,
                            planId: mappedPlanId,
                            startDate: new Date(m.planStartDate),
                            endDate: new Date(m.planEndDate),
                            status: m.status === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
                        });
                    }
                }
            }
            if (newMembersBatch.length > 0) {
                await this.prisma.member.createMany({ data: newMembersBatch, skipDuplicates: true });
            }
            if (newSubsBatch.length > 0) {
                await this.prisma.memberSubscription.createMany({ data: newSubsBatch, skipDuplicates: true });
            }
            const existingInvoices = await this.prisma.invoice.findMany({
                select: { id: true, invoiceNumber: true, status: true, paidAmount: true },
            });
            const existingInvMap = new Map(existingInvoices
                .filter((i) => i.invoiceNumber)
                .map((i) => [i.invoiceNumber, i]));
            const newInvoicesBatch = [];
            let updatedInvoices = 0;
            for (const inv of invoicesRes.rows) {
                const mappedMemberId = memberIdMap.get(inv.memberId);
                if (!mappedMemberId)
                    continue;
                const fixedPaidAmount = inv.paymentStatus === 'PAID' && (!inv.paidAmount || Number(inv.paidAmount) === 0)
                    ? Number(inv.totalAmount)
                    : Number(inv.paidAmount || 0);
                const existing = inv.invoiceNumber ? existingInvMap.get(inv.invoiceNumber) : null;
                if (existing) {
                    if (existing.status !== inv.paymentStatus ||
                        Math.abs((existing.paidAmount || 0) - fixedPaidAmount) > 0.01) {
                        await this.prisma.invoice.update({
                            where: { id: existing.id },
                            data: {
                                status: inv.paymentStatus || existing.status,
                                paidAmount: fixedPaidAmount,
                                paidDate: inv.paidDate ? new Date(inv.paidDate) : undefined,
                                paymentMethod: inv.paymentMethod || undefined,
                                razorpayPaymentId: inv.razorpayPaymentId || undefined,
                            },
                        });
                        updatedInvoices++;
                    }
                    continue;
                }
                newInvoicesBatch.push({
                    id: inv.id,
                    invoiceNumber: inv.invoiceNumber,
                    memberId: mappedMemberId,
                    planId: inv.planId ? planIdMap.get(inv.planId) || null : null,
                    memberGstNumber: inv.memberGstNumber,
                    memberPanNumber: inv.memberPanNumber,
                    memberAddress: inv.memberAddress,
                    amount: Number(inv.amount),
                    gstRate: inv.gstAmount > 0 && inv.amount > 0 ? Math.round((Number(inv.gstAmount) / Number(inv.amount)) * 100) : 0,
                    gstAmount: Number(inv.gstAmount || 0),
                    cgst: Number(inv.cgst || 0),
                    sgst: Number(inv.sgst || 0),
                    lateFee: Number(inv.lateFee || 0),
                    discount: Number(inv.discount || 0),
                    discountType: inv.discountType,
                    totalAmount: Number(inv.totalAmount),
                    paidAmount: fixedPaidAmount,
                    dueDate: new Date(inv.dueDate),
                    paidDate: inv.paidDate ? new Date(inv.paidDate) : null,
                    status: inv.paymentStatus || 'PENDING',
                    paymentMethod: inv.paymentMethod,
                    razorpayOrderId: inv.razorpayOrderId,
                    razorpayPaymentId: inv.razorpayPaymentId,
                    transactionReference: inv.razorpayPaymentId,
                    createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
                });
            }
            if (newInvoicesBatch.length > 0) {
                await this.prisma.invoice.createMany({ data: newInvoicesBatch, skipDuplicates: true });
            }
            const existingCafe = await this.prisma.cafeItem.findMany({ select: { id: true, name: true } });
            const cafeMap = new Map();
            const newCafeBatch = [];
            for (const prod of productsRes.rows) {
                const match = existingCafe.find((c) => c.id === prod.id || c.name === prod.name);
                if (match) {
                    cafeMap.set(prod.id, match.id);
                }
                else {
                    cafeMap.set(prod.id, prod.id);
                    newCafeBatch.push({
                        id: prod.id,
                        name: prod.name,
                        description: prod.description,
                        category: prod.category || 'BEVERAGE',
                        price: Number(prod.price),
                        gstRate: Number(prod.gstRate || 0),
                        images: Array.isArray(prod.images) ? prod.images : [],
                        imageUrl: Array.isArray(prod.images) ? prod.images[0] || null : null,
                        stock: Number(prod.stock || 0),
                        isAvailable: prod.isAvailable ?? true,
                    });
                }
            }
            if (newCafeBatch.length > 0) {
                await this.prisma.cafeItem.createMany({ data: newCafeBatch, skipDuplicates: true });
            }
            const existingOrders = await this.prisma.cafeOrder.findMany({
                select: { id: true, orderNumber: true, paymentStatus: true },
            });
            const existingOrdMap = new Map(existingOrders.map((o) => [o.orderNumber, o]));
            let newOrders = 0;
            for (const ord of ordersRes.rows) {
                const existingOrd = existingOrdMap.get(ord.orderNumber);
                if (existingOrd) {
                    if (existingOrd.paymentStatus !== ord.paymentStatus) {
                        await this.prisma.cafeOrder.update({
                            where: { id: existingOrd.id },
                            data: {
                                paymentStatus: ord.paymentStatus || existingOrd.paymentStatus,
                                paidAmount: Number(ord.paidAmount || 0),
                                paymentMethod: ord.paymentMethod || undefined,
                            },
                        });
                    }
                    continue;
                }
                const items = orderItemsRes.rows
                    .filter((it) => it.orderId === ord.id)
                    .map((it) => {
                    const itemId = cafeMap.get(it.productId);
                    if (!itemId)
                        return null;
                    return {
                        itemId,
                        productName: it.productName,
                        quantity: Number(it.quantity),
                        price: Number(it.price),
                        gstRate: Number(it.gstRate || 0),
                        amount: Number(it.amount || 0),
                    };
                })
                    .filter(Boolean);
                await this.prisma.cafeOrder.create({
                    data: {
                        id: ord.id,
                        orderNumber: ord.orderNumber,
                        subtotal: Number(ord.subtotal || 0),
                        gstAmount: Number(ord.gstAmount || 0),
                        cgst: Number(ord.cgst || 0),
                        sgst: Number(ord.sgst || 0),
                        discount: Number(ord.discount || 0),
                        discountType: ord.discountType,
                        totalAmount: Number(ord.totalAmount || 0),
                        paidAmount: Number(ord.paidAmount || 0),
                        paymentStatus: ord.paymentStatus || 'PENDING',
                        paymentMethod: ord.paymentMethod,
                        razorpayOrderId: ord.razorpayOrderId,
                        razorpayPaymentId: ord.razorpayPaymentId,
                        status: ord.paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING',
                        customerName: ord.customerName,
                        customerPhone: ord.customerPhone,
                        createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date(),
                        items: { create: items },
                    },
                });
                newOrders++;
            }
            const summary = {
                newMembers: newMembersBatch.length,
                newSubscriptions: newSubsBatch.length,
                newInvoices: newInvoicesBatch.length,
                updatedInvoices,
                newCafeProducts: newCafeBatch.length,
                newCafeOrders: newOrders,
            };
            if (Object.values(summary).some((v) => v > 0)) {
                this.logger.log(`Old DB Sync: ${JSON.stringify(summary)}`);
            }
            return { success: true, summary };
        }
        catch (err) {
            this.logger.error('Old DB sync failed', err?.message || err);
            return { success: false, error: err?.message || 'Sync failed' };
        }
        finally {
            this.isSyncing = false;
            await client.end().catch(() => { });
        }
    }
};
exports.OldDbSyncService = OldDbSyncService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OldDbSyncService.prototype, "scheduledSync", null);
exports.OldDbSyncService = OldDbSyncService = OldDbSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OldDbSyncService);
//# sourceMappingURL=old-db-sync.service.js.map