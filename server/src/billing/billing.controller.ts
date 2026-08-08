import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Roles('OWNER', 'MANAGER')
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
  @Put('invoices/:id/pay')
  payInvoice(@Param('id') id: string, @Body() payInvoiceDto: PayInvoiceDto) {
    return this.billingService.payInvoice(id, payInvoiceDto);
  }

  @Roles('OWNER', 'MANAGER')
  @Delete('invoices/:id')
  deleteInvoice(@Param('id') id: string) {
    return this.billingService.deleteInvoice(id);
  }
}
