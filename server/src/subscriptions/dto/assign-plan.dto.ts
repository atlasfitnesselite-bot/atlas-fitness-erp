import { IsNotEmpty, IsString, IsDateString, IsEnum } from 'class-validator';

export class AssignPlanDto {
  @IsNotEmpty()
  @IsString()
  memberId: string;

  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  status: string; // ACTIVE, EXPIRED, CANCELLED
}
