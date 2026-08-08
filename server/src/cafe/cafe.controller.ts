import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CafeService } from './cafe.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('cafe')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CafeController {
  constructor(private readonly cafeService: CafeService) {}

  // --- Menu & Inventory ---
  @Get('menu')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getMenu() {
    return this.cafeService.getMenu();
  }

  @Post('menu')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  createMenuItem(@Body() data: any) {
    return this.cafeService.createMenuItem(data);
  }

  @Put('menu/:id')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  updateMenuItem(@Param('id') id: string, @Body() data: any) {
    return this.cafeService.updateMenuItem(id, data);
  }

  @Get('inventory/transactions')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getInventoryTransactions() {
    return this.cafeService.getInventoryTransactions();
  }

  @Post('inventory/stock')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  updateStock(@Body() data: { itemId: string, quantity: number, type: string, notes?: string }) {
    return this.cafeService.updateStock(data);
  }

  // --- Suppliers ---
  @Get('suppliers')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getSuppliers() {
    return this.cafeService.getSuppliers();
  }

  @Post('suppliers')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  createSupplier(@Body() data: any) {
    return this.cafeService.createSupplier(data);
  }

  @Put('suppliers/:id')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  updateSupplier(@Param('id') id: string, @Body() data: any) {
    return this.cafeService.updateSupplier(id, data);
  }

  // --- Orders ---
  @Get('orders')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getOrders() {
    return this.cafeService.getOrders();
  }

  @Post('orders')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  createOrder(@Body() data: any) {
    return this.cafeService.createOrder(data);
  }

  @Put('orders/:id/status')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  updateOrderStatus(@Param('id') id: string, @Body() data: { status: string, prepTime?: number }) {
    return this.cafeService.updateOrderStatus(id, data);
  }

  // --- Reports ---
  @Get('reports/summary')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getReportsSummary() {
    return this.cafeService.getReportsSummary();
  }

  // --- Checklists & Logs (Existing) ---
  @Post('checklists')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  submitChecklist(@Body() data: any) {
    return this.cafeService.submitChecklist(data);
  }

  @Get('checklists')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getChecklists() {
    return this.cafeService.getChecklists();
  }

  @Post('prep-logs')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  submitPrepLog(@Body() data: any) {
    return this.cafeService.submitPrepLog(data);
  }

  @Get('prep-logs')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getPrepLogs() {
    return this.cafeService.getPrepLogs();
  }

  @Post('hygiene-logs')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  submitHygieneLog(@Body() data: any) {
    return this.cafeService.submitHygieneLog(data);
  }

  @Get('hygiene-logs')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getHygieneLogs() {
    return this.cafeService.getHygieneLogs();
  }

  // --- Expenses ---
  @Get('expenses')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  getCafeExpenses() {
    return this.cafeService.getCafeExpenses();
  }

  @Post('expenses')
  @Roles('OWNER', 'MANAGER', 'CAFE')
  createCafeExpense(@Body() data: { amount: number, description: string, categoryName: string, recordedById: string }) {
    return this.cafeService.createCafeExpense(data);
  }
}
