import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesOverview() {
    const expenses = await this.prisma.expense.aggregate({
      _sum: { amount: true }
    });

    const cafeOrders = await this.prisma.cafeOrder.aggregate({
      _sum: { totalAmount: true }
    });

    const invoices = await this.prisma.invoice.findMany({
      where: { status: 'PAID' },
      include: { subscription: { include: { plan: true } } }
    });

    let totalRevenue = 0;
    let ptSales = 0;
    const planSales: Record<string, number> = {};
    
    invoices.forEach(inv => {
      totalRevenue += inv.amount;
      if (inv.subscriptionId && inv.subscription?.plan) {
         const planName = inv.subscription.plan.name;
         planSales[planName] = (planSales[planName] || 0) + inv.amount;
      } else {
         ptSales += inv.amount;
      }
    });

    const activeMembersCount = await this.prisma.member.count({ where: { status: 'ACTIVE' } });
    
    const newMemberships = await this.prisma.memberSubscription.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });

    const merchandiseSales = cafeOrders._sum.totalAmount || 0;
    totalRevenue += merchandiseSales;
    
    const avgRevenuePerUser = activeMembersCount > 0 ? Math.round(totalRevenue / activeMembersCount) : 0;

    // Trend calculation
    const trendMap = new Map();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for(let i=5; i>=0; i--) {
       const d = new Date();
       d.setMonth(d.getMonth() - i);
       const key = `${d.getFullYear()}-${d.getMonth()}`;
       trendMap.set(key, 0);
       months.push(monthNames[d.getMonth()]);
    }
    
    invoices.forEach(inv => {
       const d = new Date(inv.createdAt);
       const key = `${d.getFullYear()}-${d.getMonth()}`;
       if (trendMap.has(key)) {
         trendMap.set(key, trendMap.get(key) + inv.amount);
       }
    });
    
    const cafeOrdersList = await this.prisma.cafeOrder.findMany();
    cafeOrdersList.forEach(co => {
       const d = new Date(co.createdAt);
       const key = `${d.getFullYear()}-${d.getMonth()}`;
       if (trendMap.has(key)) {
         trendMap.set(key, trendMap.get(key) + co.totalAmount);
       }
    });
    
    const trendData = Array.from(trendMap.values());
    
    const categories = Object.keys(planSales).map(name => ({
      name,
      val: `$${planSales[name].toLocaleString()}`,
      pct: totalRevenue > 0 ? `${Math.round((planSales[name] / totalRevenue) * 100)}%` : '0%'
    }));

    if (ptSales > 0) {
      categories.push({
        name: 'Personal Training',
        val: `$${ptSales.toLocaleString()}`,
        pct: totalRevenue > 0 ? `${Math.round((ptSales / totalRevenue) * 100)}%` : '0%'
      });
    }

    if (merchandiseSales > 0) {
      categories.push({
        name: 'Merchandise & Cafe',
        val: `$${merchandiseSales.toLocaleString()}`,
        pct: totalRevenue > 0 ? `${Math.round((merchandiseSales / totalRevenue) * 100)}%` : '0%'
      });
    }

    return {
      totalRevenue,
      newMemberships,
      avgRevenuePerUser,
      ptSales,
      merchandiseSales,
      expenses: expenses._sum.amount || 0,
      netIncome: totalRevenue - (expenses._sum.amount || 0),
      trendMonths: months,
      trendData,
      categories
    };
  }

  async generateComprehensiveReport(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly', dateString: string) {
    const targetDate = new Date(dateString);
    let startDate: Date;
    let endDate: Date;

    if (timeframe === 'daily') {
      startDate = new Date(targetDate.setHours(0, 0, 0, 0));
      endDate = new Date(targetDate.setHours(23, 59, 59, 999));
    } else if (timeframe === 'weekly') {
      const day = targetDate.getDay();
      const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(targetDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeframe === 'monthly') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(targetDate.getFullYear(), 0, 1);
      endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    const dateFilter = {
      gte: startDate,
      lte: endDate,
    };

    const [
      invoices,
      expenses,
      salarySlips,
      attendanceRecords,
      cafeOrders,
      ptSessions,
      cleaningTasks,
      faultReports,
      newMemberships,
      activeMembersCount
    ] = await Promise.all([
      this.prisma.invoice.findMany({ where: { status: 'PAID', createdAt: dateFilter } }),
      this.prisma.expense.findMany({ where: { date: dateFilter } }),
      this.prisma.salarySlip.findMany({ where: { createdAt: dateFilter } }),
      this.prisma.attendance.findMany({ where: { date: dateFilter } }),
      this.prisma.cafeOrder.findMany({ where: { createdAt: dateFilter } }),
      this.prisma.pTSession.findMany({ where: { date: dateFilter } }),
      this.prisma.cleaningTask.findMany({ where: { createdAt: dateFilter } }),
      this.prisma.faultReport.findMany({ where: { createdAt: dateFilter } }),
      this.prisma.memberSubscription.count({ where: { startDate: dateFilter } }),
      this.prisma.member.count({ where: { status: 'ACTIVE' } })
    ]);

    const revenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPayroll = salarySlips.reduce((sum, slip) => sum + slip.netPay, 0);
    
    const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const totalAbsent = attendanceRecords.filter(a => a.status === 'ABSENT' || a.status === 'LEAVE').length;

    const cafeRevenue = cafeOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const completedPTSessions = ptSessions.filter(s => s.status === 'COMPLETED').length;
    const cancelledPTSessions = ptSessions.filter(s => s.status === 'CANCELLED' || s.status === 'NO_SHOW').length;
    
    // PT Revenue estimation (invoices without a subscription linked)
    const ptInvoices = invoices.filter(inv => !inv.subscriptionId);
    const ptRevenue = ptInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const completedCleaning = cleaningTasks.filter(t => t.isCompleted).length;
    const totalCleaning = cleaningTasks.length;

    const resolvedFaults = faultReports.filter(f => f.status === 'RESOLVED').length;
    const totalFaults = faultReports.length;

    return {
      timeframe,
      startDate,
      endDate,
      metrics: {
        revenue,
        expenses: totalExpenses,
        payroll: totalPayroll,
        netIncome: revenue + cafeRevenue - totalExpenses - totalPayroll,
        attendance: {
          present: totalPresent,
          absent: totalAbsent,
        },
        cafe: {
          revenue: cafeRevenue,
          orders: cafeOrders.length,
        },
        pt: {
          revenue: ptRevenue,
          completedSessions: completedPTSessions,
          cancelledSessions: cancelledPTSessions,
        },
        cleaning: {
          completed: completedCleaning,
          total: totalCleaning,
          completionRate: totalCleaning > 0 ? (completedCleaning / totalCleaning) * 100 : 0
        },
        maintenance: {
          resolved: resolvedFaults,
          total: totalFaults,
          resolutionRate: totalFaults > 0 ? (resolvedFaults / totalFaults) * 100 : 0
        },
        members: {
          new: newMemberships,
          active: activeMembersCount,
        }
      }
    };
  }

  private resolveDateRange(params: {
    timeframe?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const tf = params.timeframe || 'monthly';
    if (tf === 'custom' && params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      return { start, end, timeframe: 'custom' };
    }

    const base = params.date ? new Date(params.date) : new Date();
    const start = new Date(base);
    const end = new Date(base);

    if (tf === 'yearly') {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }
    return { start, end, timeframe: tf };
  }

  /**
   * Generates a CA-Auditor-ready Financial, GST (B2B/B2C, CGST/SGST), Payment-Mode, and P&L report.
   */
  async getAuditorReport(params: {
    timeframe?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { start, end, timeframe } = this.resolveDateRange(params);

    const [company, invoices, cafeOrders, expenses, payrolls] = await Promise.all([
      this.prisma.companySettings.findFirst(),
      this.prisma.invoice.findMany({
        where: {
          OR: [
            { paidDate: { gte: start, lte: end } },
            { AND: [{ paidDate: null }, { createdAt: { gte: start, lte: end } }] },
          ],
        },
        include: { member: true, plan: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.cafeOrder.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { items: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.expense.findMany({
        where: { date: { gte: start, lte: end } },
        include: { category: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.salarySlip.findMany({
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);

    let invBase = 0;
    let invDiscount = 0;
    let invTaxable = 0;
    let invCgst = 0;
    let invSgst = 0;
    let invLateFee = 0;
    let invTotal = 0;
    let invPaid = 0;
    let invDue = 0;

    const b2b = { count: 0, taxable: 0, cgst: 0, sgst: 0, total: 0 };
    const b2c = { count: 0, taxable: 0, cgst: 0, sgst: 0, total: 0 };
    const paymentModes: Record<string, { count: number; amount: number }> = {};

    const invoiceLedger = invoices.map((inv) => {
      const base = Number(inv.amount || 0);
      const discVal =
        inv.discount > 0
          ? inv.discountType === 'PERCENTAGE'
            ? (base * inv.discount) / 100
            : inv.discount
          : 0;
      const taxable = Math.max(0, base - discVal);
      const cgst = Number(inv.cgst || 0);
      const sgst = Number(inv.sgst || 0);
      const lateFee = Number(inv.lateFee || 0);
      const total = Number(inv.totalAmount > 0 ? inv.totalAmount : taxable + cgst + sgst + lateFee);
      const paid = Number(inv.paidAmount || 0);
      const due = Math.max(0, total - paid);
      const isB2B = Boolean(inv.memberGstNumber && inv.memberGstNumber.trim());

      invBase += base;
      invDiscount += discVal;
      invTaxable += taxable;
      invCgst += cgst;
      invSgst += sgst;
      invLateFee += lateFee;
      invTotal += total;
      invPaid += paid;
      invDue += due;

      const bucket = isB2B ? b2b : b2c;
      bucket.count += 1;
      bucket.taxable += taxable;
      bucket.cgst += cgst;
      bucket.sgst += sgst;
      bucket.total += total;

      if (paid > 0) {
        const mode = (inv.paymentMethod || 'OTHER').toUpperCase();
        if (!paymentModes[mode]) paymentModes[mode] = { count: 0, amount: 0 };
        paymentModes[mode].count += 1;
        paymentModes[mode].amount += paid;
      }

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || inv.id.slice(0, 8).toUpperCase(),
        invoiceDate: inv.createdAt,
        paidDate: inv.paidDate,
        memberCode: inv.member?.memberId || 'N/A',
        memberName: inv.member
          ? `${inv.member.firstName} ${inv.member.lastName}`.trim()
          : 'Unknown',
        memberGstin: inv.memberGstNumber || '',
        supplyType: isB2B ? 'B2B' : 'B2C',
        planName: inv.plan?.name || 'Custom / Membership',
        base,
        discount: discVal,
        taxable,
        gstRate: inv.gstRate ?? 18,
        cgst,
        sgst,
        totalGst: cgst + sgst,
        lateFee,
        total,
        paid,
        due,
        status: inv.status,
        paymentMethod: inv.paymentMethod || 'N/A',
        transactionRef: inv.razorpayPaymentId || inv.transactionReference || '',
      };
    });

    let cafeTaxable = 0;
    let cafeCgst = 0;
    let cafeSgst = 0;
    let cafeTotal = 0;
    let cafePaid = 0;

    const cafeLedger = cafeOrders.map((ord) => {
      const subtotal = Number(ord.subtotal || ord.totalAmount || 0);
      const disc = Number(ord.discount || 0);
      const taxable = Math.max(0, subtotal - disc);
      const cgst = Number(ord.cgst || 0);
      const sgst = Number(ord.sgst || 0);
      const total = Number(ord.totalAmount || 0);
      const paid = Number(ord.paidAmount || 0);

      cafeTaxable += taxable;
      cafeCgst += cgst;
      cafeSgst += sgst;
      cafeTotal += total;
      cafePaid += paid;

      if (paid > 0) {
        const mode = (ord.paymentMethod || 'CASH').toUpperCase();
        if (!paymentModes[mode]) paymentModes[mode] = { count: 0, amount: 0 };
        paymentModes[mode].count += 1;
        paymentModes[mode].amount += paid;
      }

      return {
        orderNumber: ord.orderNumber,
        date: ord.createdAt,
        customerName: ord.customerName || 'Walk-in',
        taxable,
        cgst,
        sgst,
        total,
        paid,
        paymentStatus: ord.paymentStatus,
        paymentMethod: ord.paymentMethod || 'N/A',
      };
    });

    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalPayroll = payrolls.reduce((s, p) => s + Number(p.netPay || 0), 0);
    const totalOutflow = totalExpenses + totalPayroll;

    const totalTaxableRevenue = invTaxable + cafeTaxable;
    const totalCgst = invCgst + cafeCgst;
    const totalSgst = invSgst + cafeSgst;
    const totalGstLiability = totalCgst + totalSgst;
    const totalGrossInvoiced = invTotal + cafeTotal;
    const totalCollected = invPaid + cafePaid;
    const totalReceivable = invDue + Math.max(0, cafeTotal - cafePaid);

    return {
      company: {
        name: company?.companyName || 'Atlas Fitness',
        gstin: company?.gstNumber || 'Not Configured',
        address: company?.address || '',
        email: company?.email || '',
        phone: company?.companyContact || '',
      },
      period: { timeframe, startDate: start, endDate: end },
      summary: {
        membershipBase: invBase,
        membershipDiscount: invDiscount,
        membershipTaxable: invTaxable,
        cafeTaxable,
        totalTaxableRevenue,
        totalCgst,
        totalSgst,
        totalGstLiability,
        invLateFee,
        totalGrossInvoiced,
        totalCollected,
        totalReceivable,
        operatingExpenses: totalExpenses,
        payrollExpense: totalPayroll,
        totalOutflow,
        netAccrualProfit: totalTaxableRevenue - totalOutflow,
        netCashFlow: totalCollected - totalOutflow,
      },
      gstBreakdown: { b2b, b2c },
      paymentModes: Object.entries(paymentModes).map(([mode, v]) => ({
        mode,
        count: v.count,
        amount: v.amount,
      })),
      invoiceLedger,
      cafeLedger,
      expenseLedger: expenses.map((e) => ({
        date: e.date,
        category: e.category?.name || 'General',
        description: e.description || '',
        amount: e.amount,
      })),
    };
  }

  async exportAuditorCsv(params: {
    timeframe?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<string> {
    const r = await this.getAuditorReport(params);
    const s = r.summary;
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const lines: string[] = [];
    lines.push([esc('ATLAS FITNESS - CA AUDITOR & GST FINANCIAL REPORT')].join(','));
    lines.push([esc('Company'), esc(r.company.name), esc('GSTIN'), esc(r.company.gstin)].join(','));
    lines.push(
      [
        esc('Period'),
        esc(`${new Date(r.period.startDate).toLocaleDateString('en-IN')} to ${new Date(r.period.endDate).toLocaleDateString('en-IN')}`),
      ].join(','),
    );
    lines.push('');

    lines.push([esc('SECTION A: EXECUTIVE P&L & TAX SUMMARY (INR)')].join(','));
    lines.push([esc('Particulars'), esc('Amount (INR)')].join(','));
    lines.push([esc('Membership Gross Billing'), s.membershipBase.toFixed(2)].join(','));
    lines.push([esc('Less: Discounts Allowed'), s.membershipDiscount.toFixed(2)].join(','));
    lines.push([esc('Membership Net Taxable Value'), s.membershipTaxable.toFixed(2)].join(','));
    lines.push([esc('Cafeteria Net Taxable Sales'), s.cafeTaxable.toFixed(2)].join(','));
    lines.push([esc('Total Taxable Revenue'), s.totalTaxableRevenue.toFixed(2)].join(','));
    lines.push([esc('Output CGST'), s.totalCgst.toFixed(2)].join(','));
    lines.push([esc('Output SGST'), s.totalSgst.toFixed(2)].join(','));
    lines.push([esc('Total Output GST Liability'), s.totalGstLiability.toFixed(2)].join(','));
    lines.push([esc('Total Gross Invoiced (Incl. GST)'), s.totalGrossInvoiced.toFixed(2)].join(','));
    lines.push([esc('Total Actual Collections Received'), s.totalCollected.toFixed(2)].join(','));
    lines.push([esc('Accounts Receivable (Pending/Overdue)'), s.totalReceivable.toFixed(2)].join(','));
    lines.push([esc('Operating Expenses'), s.operatingExpenses.toFixed(2)].join(','));
    lines.push([esc('Staff Payroll'), s.payrollExpense.toFixed(2)].join(','));
    lines.push([esc('Net Accrual Profit (Excl. GST)'), s.netAccrualProfit.toFixed(2)].join(','));
    lines.push([esc('Net Cash Flow (Collections - Outflow)'), s.netCashFlow.toFixed(2)].join(','));
    lines.push('');

    lines.push([esc('SECTION B: GST B2B vs B2C SUMMARY')].join(','));
    lines.push([esc('Supply Type'), esc('Count'), esc('Taxable Value'), esc('CGST'), esc('SGST'), esc('Total Incl. GST')].join(','));
    lines.push([esc('B2B (With GSTIN)'), r.gstBreakdown.b2b.count, r.gstBreakdown.b2b.taxable.toFixed(2), r.gstBreakdown.b2b.cgst.toFixed(2), r.gstBreakdown.b2b.sgst.toFixed(2), r.gstBreakdown.b2b.total.toFixed(2)].join(','));
    lines.push([esc('B2C (Without GSTIN)'), r.gstBreakdown.b2c.count, r.gstBreakdown.b2c.taxable.toFixed(2), r.gstBreakdown.b2c.cgst.toFixed(2), r.gstBreakdown.b2c.sgst.toFixed(2), r.gstBreakdown.b2c.total.toFixed(2)].join(','));
    lines.push('');

    lines.push([esc('SECTION C: PAYMENT MODE RECONCILIATION')].join(','));
    lines.push([esc('Payment Mode'), esc('Transactions'), esc('Collected Amount (INR)')].join(','));
    for (const pm of r.paymentModes) {
      lines.push([esc(pm.mode), pm.count, pm.amount.toFixed(2)].join(','));
    }
    lines.push('');

    lines.push([esc('SECTION D: ITEMIZED INVOICE LEDGER')].join(','));
    lines.push([
      'Invoice #', 'Invoice Date', 'Paid Date', 'Member ID', 'Member Name', 'Member GSTIN',
      'Supply', 'Plan', 'Base', 'Discount', 'Taxable Value', 'GST %', 'CGST', 'SGST',
      'Total GST', 'Late Fee', 'Grand Total', 'Paid', 'Balance Due', 'Status', 'Method', 'Txn Ref',
    ].map(esc).join(','));

    for (const inv of r.invoiceLedger) {
      lines.push([
        esc(inv.invoiceNumber),
        esc(new Date(inv.invoiceDate).toLocaleDateString('en-IN')),
        esc(inv.paidDate ? new Date(inv.paidDate).toLocaleDateString('en-IN') : ''),
        esc(inv.memberCode),
        esc(inv.memberName),
        esc(inv.memberGstin),
        esc(inv.supplyType),
        esc(inv.planName),
        inv.base.toFixed(2),
        inv.discount.toFixed(2),
        inv.taxable.toFixed(2),
        inv.gstRate,
        inv.cgst.toFixed(2),
        inv.sgst.toFixed(2),
        inv.totalGst.toFixed(2),
        inv.lateFee.toFixed(2),
        inv.total.toFixed(2),
        inv.paid.toFixed(2),
        inv.due.toFixed(2),
        esc(inv.status),
        esc(inv.paymentMethod),
        esc(inv.transactionRef),
      ].join(','));
    }

    return '\uFEFF' + lines.join('\n');
  }

  async exportAuditorPdf(params: {
    timeframe?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Buffer> {
    const r = await this.getAuditorReport(params);
    const s = r.summary;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 35, layout: 'landscape', size: 'A4' });
        const chunks: Buffer[] = [];
        doc.on('data', (c: Buffer) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(16).fillColor('#DC2626').text(r.company.name, { align: 'center' });
        doc.fontSize(9).fillColor('#475569').text(`GSTIN: ${r.company.gstin} | ${r.company.address}`, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(13).fillColor('#0F172A').text('CA AUDITOR & GST FINANCIAL REPORT', { align: 'center' });
        doc.fontSize(9).fillColor('#475569').text(
          `Period: ${new Date(r.period.startDate).toLocaleDateString('en-IN')} to ${new Date(r.period.endDate).toLocaleDateString('en-IN')} | Generated: ${new Date().toLocaleDateString('en-IN')}`,
          { align: 'center' },
        );
        doc.moveDown(0.8);

        doc.fontSize(10.5).fillColor('#0F172A').text('Executive P&L & GST Summary', { underline: true });
        doc.fontSize(9).fillColor('#334155');
        doc.text(`Total Taxable Revenue: Rs. ${s.totalTaxableRevenue.toFixed(2)}  |  Output CGST: Rs. ${s.totalCgst.toFixed(2)}  |  Output SGST: Rs. ${s.totalSgst.toFixed(2)}  |  Total GST: Rs. ${s.totalGstLiability.toFixed(2)}`);
        doc.text(`Gross Invoiced: Rs. ${s.totalGrossInvoiced.toFixed(2)}  |  Collected: Rs. ${s.totalCollected.toFixed(2)}  |  Receivable: Rs. ${s.totalReceivable.toFixed(2)}`);
        doc.text(`Operating Expenses: Rs. ${s.operatingExpenses.toFixed(2)}  |  Payroll: Rs. ${s.payrollExpense.toFixed(2)}  |  Net Accrual Profit: Rs. ${s.netAccrualProfit.toFixed(2)}`);
        doc.moveDown(0.8);

        const drawHeader = (y: number) => {
          doc.rect(35, y, 770, 18).fill('#F1F5F9');
          doc.fillColor('#0F172A').fontSize(8);
          doc.text('Invoice #', 40, y + 5);
          doc.text('Date', 110, y + 5);
          doc.text('Member', 170, y + 5);
          doc.text('Type', 285, y + 5);
          doc.text('Taxable', 330, y + 5, { width: 65, align: 'right' });
          doc.text('CGST', 405, y + 5, { width: 55, align: 'right' });
          doc.text('SGST', 465, y + 5, { width: 55, align: 'right' });
          doc.text('Total', 525, y + 5, { width: 65, align: 'right' });
          doc.text('Paid', 595, y + 5, { width: 65, align: 'right' });
          doc.text('Due', 665, y + 5, { width: 60, align: 'right' });
          doc.text('Status', 735, y + 5);
        };

        let y = doc.y;
        drawHeader(y);
        y += 22;

        doc.fontSize(8).fillColor('#334155');
        for (const inv of r.invoiceLedger) {
          if (y > 540) {
            doc.addPage({ layout: 'landscape', margin: 35 });
            y = 40;
            drawHeader(y);
            y += 22;
            doc.fontSize(8).fillColor('#334155');
          }
          doc.text(inv.invoiceNumber, 40, y, { width: 68 });
          doc.text(new Date(inv.invoiceDate).toLocaleDateString('en-IN'), 110, y, { width: 58 });
          doc.text(inv.memberName.slice(0, 20), 170, y, { width: 112 });
          doc.text(inv.supplyType, 285, y, { width: 40 });
          doc.text(inv.taxable.toFixed(2), 330, y, { width: 65, align: 'right' });
          doc.text(inv.cgst.toFixed(2), 405, y, { width: 55, align: 'right' });
          doc.text(inv.sgst.toFixed(2), 465, y, { width: 55, align: 'right' });
          doc.text(inv.total.toFixed(2), 525, y, { width: 65, align: 'right' });
          doc.text(inv.paid.toFixed(2), 595, y, { width: 65, align: 'right' });
          doc.text(inv.due.toFixed(2), 665, y, { width: 60, align: 'right' });
          doc.text(inv.status, 735, y, { width: 65 });
          y += 16;
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
