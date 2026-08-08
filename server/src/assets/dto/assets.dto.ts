import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  @IsNotEmpty()
  purchaseDate: string;

  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  vendor?: string;
}

export class UpdateMaintenanceDto {
  @IsDateString()
  @IsNotEmpty()
  lastMaintenanceDate: string;

  @IsDateString()
  @IsNotEmpty()
  nextMaintenanceDate: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
