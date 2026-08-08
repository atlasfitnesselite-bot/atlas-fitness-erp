export declare class CreateExpenseCategoryDto {
    name: string;
    description?: string;
}
export declare class CreateExpenseDto {
    categoryId: string;
    amount: number;
    description: string;
    date?: string;
}
