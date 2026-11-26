import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { PdfService } from './pdf.service';
import { EmailService } from './email.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Computes GST, CGST, SGST, and totalAmount. Uses nullish coalescing so 0% GST is preserved.
   */
  private calculateInvoiceTotals(params: {
    amount: number;
    gstRate?: number;
    discount?: number;
    discountType?: string;
    lateFee?: number;
  }) {
    const amount = Number(params.amount || 0);
    const gstRate = params.gstRate ?? 18;
    const discount = Number(params.discount || 0);
    const lateFee = Number(params.lateFee || 0);

    let discountVal = 0;
    if (discount > 0) {
      discountVal =
        params.discountType === 'PERCENTAGE'
          ? (amount * discount) / 100
          : discount;
    }

    const taxableAmount = Math.max(0, amount - discountVal);
    const gstAmount = (taxableAmount * gstRate) / 100;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const totalAmount = taxableAmount + gstAmount + lateFee;

    return { gstRate, gstAmount, cgst, sgst, totalAmount };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const last = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    const lastSeq = last?.invoiceNumber
      ? parseInt(last.invoiceNumber.split('-')[2] || '0', 10)
      : 0;
    const nextSeq = (Number.isNaN(lastSeq) ? 0 : lastSeq) + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  async createInvoice(data: CreateInvoiceDto) {
    const totals = this.calculateInvoiceTotals({
      amount: data.amount,
      gstRate: data.gstRate,
      discount: data.discount,
      discountType: data.discountType,
      lateFee: data.lateFee,
    });

    const normalizedStatus = (data.status || 'PENDING').toUpperCase();
    // Fix old-website bug: if created as PAID without explicit paidAmount, record full totalAmount.
    let paidAmount = Number(data.paidAmount || 0);
    if (normalizedStatus === 'PAID' && paidAmount === 0) {
      paidAmount = totals.totalAmount;
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        memberId: data.memberId,
        subscriptionId: data.subscriptionId || null,
        planId: data.planId || null,
        memberGstNumber: data.memberGstNumber,
        memberPanNumber: data.memberPanNumber,
        memberAddress: data.memberAddress,
        amount: data.amount,
        gstRate: totals.gstRate,
        gstAmount: totals.gstAmount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        lateFee: data.lateFee || 0,
        discount: data.discount || 0,
        discountType: data.discountType || 'AMOUNT',
        totalAmount: totals.totalAmount,
        paidAmount,
        paidDate: normalizedStatus === 'PAID' ? new Date() : null,
        dueDate: new Date(data.dueDate),
        status: normalizedStatus,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
      include: { member: true, subscription: true, plan: true },
    });
  }

  async getInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        member: true,
        subscription: true,
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { member: true, subscription: true, plan: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateInvoice(id: string, data: Partial<CreateInvoiceDto>) {
    const existing = await this.getInvoiceById(id);

    const amount = data.amount ?? existing.amount;
    const gstRate = data.gstRate ?? existing.gstRate;
    const discount = data.discount ?? existing.discount;
    const discountType = data.discountType ?? existing.discountType ?? 'AMOUNT';
    const lateFee = data.lateFee ?? existing.lateFee;

    const totals = this.calculateInvoiceTotals({
      amount,
      gstRate,
      discount,
      discountType,
      lateFee,
    });

    const status = data.status ? data.status.toUpperCase() : existing.status;
    let paidAmount = data.paidAmount ?? existing.paidAmount;
    if (status === 'PAID' && paidAmount < totals.totalAmount) {
      paidAmount = totals.totalAmount;
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        planId: data.planId !== undefined ? data.planId : existing.planId,
        memberGstNumber: data.memberGstNumber ?? existing.memberGstNumber,
        memberPanNumber: data.memberPanNumber ?? existing.memberPanNumber,
        memberAddress: data.memberAddress ?? existing.memberAddress,
        amount,
        gstRate: totals.gstRate,
        gstAmount: totals.gstAmount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        lateFee,
        discount,
        discountType,
        totalAmount: totals.totalAmount,
        paidAmount,
        status,
        paidDate:
          status === 'PAID' && !existing.paidDate ? new Date() : existing.paidDate,
        dueDate: data.dueDate ? new Date(data.dueDate) : existing.dueDate,
        paymentMethod: data.paymentMethod ?? existing.paymentMethod,
        notes: data.notes ?? existing.notes,
      },
      include: { member: true, subscription: true, plan: true },
    });
  }

  async payInvoice(id: string, payInvoiceDto: PayInvoiceDto) {
    const invoice = await this.getInvoiceById(id);
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already fully paid');
    }

    const effectiveTotal =
      invoice.totalAmount > 0 ? invoice.totalAmount : invoice.amount;
    const remaining = Math.max(0, effectiveTotal - (invoice.paidAmount || 0));
    const paymentAmt =
      payInvoiceDto.amount !== undefined && payInvoiceDto.amount > 0
        ? Math.min(payInvoiceDto.amount, remaining)
        : remaining;

    const newPaidAmount = (invoice.paidAmount || 0) + paymentAmt;
    const newStatus = newPaidAmount >= effectiveTotal - 0.01 ? 'PAID' : 'PARTIAL';

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: newStatus,
        paidAmount: newPaidAmount,
        paidDate: new Date(),
        paymentMethod: payInvoiceDto.paymentMethod,
        transactionReference: payInvoiceDto.transactionReference,
        razorpayOrderId: payInvoiceDto.razorpayOrderId ?? invoice.razorpayOrderId,
        razorpayPaymentId:
          payInvoiceDto.razorpayPaymentId ?? invoice.razorpayPaymentId,
      },
      include: { member: true, subscription: true, plan: true },
    });
  }

  async deleteInvoice(id: string) {
    await this.getInvoiceById(id);
    await this.prisma.invoice.delete({ where: { id } });
    return { success: true, message: 'Invoice deleted successfully' };
  }

  async getBillingSummary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [totalRevenueAgg, todayAgg, pendingInvoices, overdueCount] =
      await Promise.all([
        this.prisma.invoice.aggregate({ _sum: { paidAmount: true } }),
        this.prisma.invoice.aggregate({
          where: { paidDate: { gte: todayStart, lt: tomorrowStart } },
          _sum: { paidAmount: true },
        }),
        this.prisma.invoice.findMany({
          where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
          select: { totalAmount: true, amount: true, paidAmount: true },
        }),
        this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      ]);

    const pendingAmount = pendingInvoices.reduce((sum, inv) => {
      const total = inv.totalAmount > 0 ? inv.totalAmount : inv.amount;
      return sum + Math.max(0, total - (inv.paidAmount || 0));
    }, 0);

    return {
      totalRevenue: totalRevenueAgg._sum.paidAmount || 0,
      todayCollections: todayAgg._sum.paidAmount || 0,
      pendingAmount,
      overdueCount,
    };
  }

  async generatePdfBuffer(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.getInvoiceById(id);
    const settings = await this.prisma.companySettings.findFirst();
    const buffer = await this.pdfService.generateInvoicePdf(invoice, settings);
    const filename = `Invoice_${invoice.invoiceNumber || invoice.id.slice(0, 8)}.pdf`;
    return { buffer, filename };
  }

  private async getRazorpayConfig() {
    const settings = await this.prisma.companySettings.findFirst({
      where: {
        razorpayKeyId: { not: null },
        razorpayKeySecret: { not: null },
      },
    });

    const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
    const keySecret =
      settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new BadRequestException(
        'Razorpay keys are not configured in Company Settings or environment variables',
      );
    }

    return {
      keyId,
      keySecret,
      instance: new Razorpay({ key_id: keyId, key_secret: keySecret }),
    };
  }

  async createRazorpayOrder(invoiceId: string) {
    const invoice = await this.getInvoiceById(invoiceId);
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    const effectiveTotal =
      invoice.totalAmount > 0 ? invoice.totalAmount : invoice.amount;
    const balanceDue = Math.max(0, effectiveTotal - (invoice.paidAmount || 0));
    if (balanceDue <= 0) {
      throw new BadRequestException('No balance due on this invoice');
    }

    const { keyId, instance } = await this.getRazorpayConfig();

    const order = await instance.orders.create({
      amount: Math.round(balanceDue * 100),
      currency: 'INR',
      receipt: invoice.invoiceNumber || invoice.id.slice(0, 20),
      payment_capture: true,
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { razorpayOrderId: order.id },
    });

    return { success: true, order, key: keyId };
  }

  async verifyRazorpayPayment(body: {
    invoiceId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { keySecret } = await this.getRazorpayConfig();
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest('hex');

    if (expected !== body.razorpay_signature) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    const invoice = await this.payInvoice(body.invoiceId, {
      paymentMethod: 'RAZORPAY',
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
      transactionReference: body.razorpay_payment_id,
    });

    return { success: true, message: 'Payment verified successfully', invoice };
  }

  async sendInvoiceEmail(id: string) {
    const invoice = await this.getInvoiceById(id);
    const { buffer, filename } = await this.generatePdfBuffer(id);
    return this.emailService.sendInvoiceEmail(invoice, buffer, filename);
  }
}
