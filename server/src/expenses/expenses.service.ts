import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseCategoryDto, CreateExpenseDto } from './dto/expenses.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async getCategories() {
    try {
      return await this.prisma.expenseCategory.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch expense categories');
    }
  }

  async createCategory(dto: CreateExpenseCategoryDto) {
    try {
      return await this.prisma.expenseCategory.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create expense category');
    }
  }

  async getExpenses() {
    try {
      return await this.prisma.expense.findMany({
        include: {
          category: true,
          recordedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch expenses');
    }
  }

  async createExpense(dto: CreateExpenseDto, recordedById: string) {
    try {
      const expense = await this.prisma.expense.create({
        data: {
          categoryId: dto.categoryId,
          amount: dto.amount,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : new Date(),
          recordedById,
        },
      });

      this.eventsGateway.server.emit('new_expense', { amount: dto.amount, description: dto.description });

      return expense;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create expense');
    }
  }
}
