import { IsOptional, IsNumber, IsDateString } from 'class-validator';

export class MeasurementDto {
  @IsOptional()
  @IsNumber()
  chest?: number;

  @IsOptional()
  @IsNumber()
  waist?: number;

  @IsOptional()
  @IsNumber()
  hip?: number;

  @IsOptional()
  @IsNumber()
  neck?: number;

  @IsOptional()
  @IsNumber()
  biceps?: number;

  @IsOptional()
  @IsNumber()
  forearm?: number;

  @IsOptional()
  @IsNumber()
  thigh?: number;

  @IsOptional()
  @IsNumber()
  calf?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
