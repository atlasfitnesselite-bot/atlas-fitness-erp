import { ExpensesService } from './expenses.service';
import { CreateExpenseCategoryDto, CreateExpenseDto } from './dto/expenses.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
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
    createExpense(dto: CreateExpenseDto, req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<{
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
