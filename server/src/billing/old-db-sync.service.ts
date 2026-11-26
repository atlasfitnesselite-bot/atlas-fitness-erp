import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from 'pg';

@Injectable()
export class OldDbSyncService {
  private readonly logger = new Logger(OldDbSyncService.name);
  private isSyncing = false;

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/5 * * * *')
  async scheduledSync() {
    if (process.env.ENABLE_OLD_DB_SYNC !== 'true' || !process.env.OLD_DATABASE_URL) {
      return;
    }
    await this.syncFromOldDb();
  }

  private splitName(fullName: string) {
    const parts = (fullName || 'Member').trim().split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: '-' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }

  /**
   * One-way read-only sync from the old gym-billing-system database into the new database.
   * Inserts new records and updates payment status on existing PENDING/PARTIAL invoices & cafe orders.
   */
  async syncFromOldDb() {
    if (this.isSyncing) {
      return { skipped: true, message: 'Sync already in progress' };
    }
    const oldUrl = process.env.OLD_DATABASE_URL;
    if (!oldUrl) {
      return { skipped: true, message: 'OLD_DATABASE_URL not configured' };
    }

    this.isSyncing = true;
    const client = new Client({
      connectionString: oldUrl,
      ssl: oldUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    });

    try {
      await client.connect();

      const [plansRes, membersRes, invoicesRes, productsRes, ordersRes, orderItemsRes] =
        await Promise.all([
          client.query('SELECT * FROM plans'),
          client.query('SELECT * FROM members'),
          client.query('SELECT * FROM invoices'),
          client.query('SELECT * FROM cafeteria_products'),
          client.query('SELECT * FROM cafeteria_orders'),
          client.query('SELECT * FROM cafeteria_order_items'),
        ]);

      // 1. Plans
      const existingPlans = await this.prisma.membershipPlan.findMany();
      const planIdMap = new Map<string, string>();
      for (const p of plansRes.rows) {
        const match = existingPlans.find((ep) => ep.id === p.id || ep.name === p.name);
        if (match) {
          planIdMap.set(p.id, match.id);
        } else {
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

      // 2. Members & Subscriptions
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

      const memberIdMap = new Map<string, string>();
      const newMembersBatch: any[] = [];
      const newSubsBatch: any[] = [];

      for (const m of membersRes.rows) {
        let targetId = byMemberId.get(m.memberId);
        if (!targetId) {
          const { firstName, lastName } = this.splitName(m.name);
          let mobile = (m.phone || '').trim() || `LEGACY-${m.memberId}`;
          if (usedMobiles.has(mobile)) mobile = `${mobile}-${m.memberId}`;
          usedMobiles.add(mobile);

          let email = m.email ? String(m.email).trim() : null;
          if (email && usedEmails.has(email)) email = null;
          if (email) usedEmails.add(email);

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
        memberIdMap.set(m.id, targetId as string);

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

      // 3. Invoices (insert new + sync paymentStatus/paidAmount updates from old DB)
      const existingInvoices = await this.prisma.invoice.findMany({
        select: { id: true, invoiceNumber: true, status: true, paidAmount: true },
      });
      const existingInvMap = new Map(
        existingInvoices
          .filter((i) => i.invoiceNumber)
          .map((i) => [i.invoiceNumber as string, i]),
      );

      const newInvoicesBatch: any[] = [];
      let updatedInvoices = 0;

      for (const inv of invoicesRes.rows) {
        const mappedMemberId = memberIdMap.get(inv.memberId);
        if (!mappedMemberId) continue;

        const fixedPaidAmount =
          inv.paymentStatus === 'PAID' && (!inv.paidAmount || Number(inv.paidAmount) === 0)
            ? Number(inv.totalAmount)
            : Number(inv.paidAmount || 0);

        const existing = inv.invoiceNumber ? existingInvMap.get(inv.invoiceNumber) : null;
        if (existing) {
          if (
            existing.status !== inv.paymentStatus ||
            Math.abs((existing.paidAmount || 0) - fixedPaidAmount) > 0.01
          ) {
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
          gstRate: 18,
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

      // 4. Cafeteria Products & Orders
      const existingCafe = await this.prisma.cafeItem.findMany({ select: { id: true, name: true } });
      const cafeMap = new Map<string, string>();
      const newCafeBatch: any[] = [];
      for (const prod of productsRes.rows) {
        const match = existingCafe.find((c) => c.id === prod.id || c.name === prod.name);
        if (match) {
          cafeMap.set(prod.id, match.id);
        } else {
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
            if (!itemId) return null;
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
            items: { create: items as any[] },
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
    } catch (err: any) {
      this.logger.error('Old DB sync failed', err?.message || err);
      return { success: false, error: err?.message || 'Sync failed' };
    } finally {
      this.isSyncing = false;
      await client.end().catch(() => {});
    }
  }
}
