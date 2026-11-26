import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class PayInvoiceDto {
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;
}
