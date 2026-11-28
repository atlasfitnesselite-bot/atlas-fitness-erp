import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { BillingService } from './billing.service';
import { OldDbSyncService } from './old-db-sync.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly oldDbSyncService: OldDbSyncService,
  ) {}

  @Roles('OWNER', 'MANAGER')
  @Post('sync-old-db')
  syncOldDb() {
    return this.oldDbSyncService.syncFromOldDb();
  }

  @Get('summary')
  getSummary() {
    return this.billingService.getBillingSummary();
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Post('invoices')
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.billingService.createInvoice(createInvoiceDto);
  }

  @Get('invoices')
  getInvoices() {
    return this.billingService.getInvoices();
  }

  @Get('invoices/:id')
  getInvoiceById(@Param('id') id: string) {
    return this.billingService.getInvoiceById(id);
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Put('invoices/:id')
  updateInvoice(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateInvoiceDto>,
  ) {
    return this.billingService.updateInvoice(id, updateDto);
  }

  @Get('invoices/:id/download')
  async downloadInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.billingService.generatePdfBuffer(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Post('invoices/:id/send-email')
  sendInvoiceEmail(@Param('id') id: string) {
    return this.billingService.sendInvoiceEmail(id);
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Put('invoices/:id/pay')
  payInvoice(@Param('id') id: string, @Body() payInvoiceDto: PayInvoiceDto) {
    return this.billingService.payInvoice(id, payInvoiceDto);
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Post('payments')
  collectPayment(
    @Body()
    body: {
      invoiceId: string;
      amount?: number;
      method?: string;
      paymentMethod?: string;
      transactionReference?: string;
    },
  ) {
    return this.billingService.payInvoice(body.invoiceId, {
      amount: body.amount,
      paymentMethod: body.paymentMethod || body.method || 'CASH',
      transactionReference: body.transactionReference,
    });
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Post('razorpay/create')
  createRazorpayOrder(@Body() body: { invoiceId: string }) {
    return this.billingService.createRazorpayOrder(body.invoiceId);
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Post('razorpay/verify')
  verifyRazorpayPayment(
    @Body()
    body: {
      invoiceId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    return this.billingService.verifyRazorpayPayment(body);
  }

  @Roles('OWNER', 'MANAGER')
  @Delete('invoices/:id')
  deleteInvoice(@Param('id') id: string) {
    return this.billingService.deleteInvoice(id);
  }

  @Roles('OWNER', 'MANAGER')
  @Post('verify-pin')
  verifyPin(@Req() req: { user: { id: string } }, @Body('pin') pin: string) {
    return this.billingService.verifyRevenuePin(req.user.id, pin);
  }

  @Roles('OWNER', 'MANAGER')
  @Post('change-pin')
  changePin(
    @Req() req: { user: { id: string } },
    @Body('currentPin') currentPin: string,
    @Body('newPin') newPin: string,
  ) {
    return this.billingService.changeRevenuePin(req.user.id, currentPin, newPin);
  }
}
