import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(data: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        memberId: data.memberId,
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        status: data.status,
      },
    });
  }

  async getInvoices() {
    return this.prisma.invoice.findMany({
      include: {
        member: true,
        subscription: true,
      },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { member: true, subscription: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async payInvoice(id: string, payInvoiceDto: PayInvoiceDto) {
    const invoice = await this.getInvoiceById(id);
    
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentMethod: payInvoiceDto.paymentMethod,
        transactionReference: payInvoiceDto.transactionReference,
      },
    });
  }

  async deleteInvoice(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }
}
