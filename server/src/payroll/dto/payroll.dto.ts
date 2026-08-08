import { IsNumber, IsOptional, IsObject, IsNotEmpty, ValidateNested } from 'class-validator';

export class SetPayrollStructureDto {
  @IsNumber()
  @IsNotEmpty()
  baseSalary: number;

  @IsOptional()
  @IsObject()
  standardAllowances?: Record<string, any>;

  @IsOptional()
  @IsObject()
  standardDeductions?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  ptCommissionPercentage?: number;
}

export class GenerateSalarySlipDto {
  @IsNumber()
  @IsNotEmpty()
  month: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;
}
