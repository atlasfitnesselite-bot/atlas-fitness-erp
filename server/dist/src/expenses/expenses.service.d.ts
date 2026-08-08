import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseCategoryDto, CreateExpenseDto } from './dto/expenses.dto';
import { EventsGateway } from '../events/events.gateway';
export declare class ExpensesService {
    private readonly prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    getCategories(): Promise<{
        id: string;
        name: string;
        description: string | null;
    }[]>;
    createCategory(dto: CreateExpenseCategoryDto): Promise<{
        id: string;
        name: string;
        description: string | null;
    }>;
    getExpenses(): Promise<({
        category: {
            id: string;
            name: string;
            description: string | null;
        };
        recordedBy: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        amount: number;
        categoryId: string;
        recordedById: string;
    })[]>;
    createExpense(dto: CreateExpenseDto, recordedById: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        amount: number;
        categoryId: string;
        recordedById: string;
    }>;
}
