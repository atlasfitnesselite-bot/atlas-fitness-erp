import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  memberId: string;

  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsNotEmpty()
  @IsString()
  status: string; // PAID, PENDING, OVERDUE
}
