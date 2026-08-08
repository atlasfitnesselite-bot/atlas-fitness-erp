import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseCategoryDto, CreateExpenseDto } from './dto/expenses.dto';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('categories')
  @Roles('OWNER', 'MANAGER')
  async getCategories() {
    return this.expensesService.getCategories();
  }

  @Post('categories')
  @Roles('OWNER', 'MANAGER')
  async createCategory(@Body() dto: CreateExpenseCategoryDto) {
    return this.expensesService.createCategory(dto);
  }

  @Get()
  @Roles('OWNER', 'MANAGER')
  async getExpenses() {
    return this.expensesService.getExpenses();
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  async createExpense(
    @Body() dto: CreateExpenseDto,
    @Req() req: { user: { id: string; email: string; roles: string[] } }
  ) {
    return this.expensesService.createExpense(dto, req.user.id);
  }
}
