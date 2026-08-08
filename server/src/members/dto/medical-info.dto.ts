import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class MedicalInfoDto {
  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  bmi?: number;

  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsBoolean()
  asthma?: boolean;

  @IsOptional()
  @IsBoolean()
  diabetes?: boolean;

  @IsOptional()
  @IsBoolean()
  heartDisease?: boolean;

  @IsOptional()
  @IsString()
  recentSurgery?: string;

  @IsOptional()
  @IsString()
  injuries?: string;

  @IsOptional()
  @IsString()
  medications?: string;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  doctorContact?: string;

  @IsOptional()
  @IsString()
  medicalNotes?: string;
}
