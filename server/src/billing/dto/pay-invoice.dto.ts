import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PayInvoiceDto {
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionReference?: string;
}
