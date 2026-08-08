export declare class SetPayrollStructureDto {
    baseSalary: number;
    standardAllowances?: Record<string, any>;
    standardDeductions?: Record<string, any>;
    ptCommissionPercentage?: number;
}
export declare class GenerateSalarySlipDto {
    month: number;
    year: number;
}
