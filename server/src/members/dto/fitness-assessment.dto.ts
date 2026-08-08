import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FitnessAssessmentDto {
  @IsOptional()
  @IsString()
  fitnessGoal?: string;

  @IsOptional()
  @IsNumber()
  bodyFatPercentage?: number;

  @IsOptional()
  @IsNumber()
  muscleMass?: number;

  @IsOptional()
  @IsNumber()
  visceralFat?: number;

  @IsOptional()
  @IsNumber()
  bmr?: number;

  @IsOptional()
  @IsNumber()
  tdee?: number;
}
