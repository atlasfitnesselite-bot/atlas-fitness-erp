import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum FitnessPlanType {
  WORKOUT = 'WORKOUT',
  DIET = 'DIET',
}

export class BookSessionDto {
  @IsString()
  @IsNotEmpty()
  trainerId: string;

  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateFitnessPlanDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @IsNotEmpty()
  trainerId: string;

  @IsEnum(FitnessPlanType)
  @IsNotEmpty()
  type: FitnessPlanType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;
}

export class CreateMeasurementDto {
  @IsOptional() chest?: number;
  @IsOptional() waist?: number;
  @IsOptional() hip?: number;
  @IsOptional() biceps?: number;
  @IsOptional() thigh?: number;
  @IsOptional() calf?: number;
  @IsOptional() neck?: number;
  @IsOptional() forearm?: number;
}

export class CreateCommissionDto {
  @IsString()
  @IsNotEmpty()
  trainerId: string;

  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @IsNotEmpty()
  amount: number;
}

export class CompleteSessionDto {
  @IsOptional()
  @IsNotEmpty()
  duration?: number;

  @IsOptional()
  @IsString()
  exercisesCompleted?: string;

  @IsOptional()
  @IsString()
  intensity?: string;

  @IsOptional()
  @IsString()
  clientFeedback?: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;
}
