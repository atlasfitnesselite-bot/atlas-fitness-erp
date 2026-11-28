import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CheckInOutDto {
  @IsString()
  employeeId: string;

  @IsString()
  pin: string;

  @IsOptional()
  @IsString()
  method?: string; // PIN, QR, RFID, FACE

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  offlineTimestamp?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  officeStartTime?: string;

  @IsOptional()
  @IsString()
  officeEndTime?: string;

  @IsOptional()
  @IsNumber()
  graceTime?: number;

  @IsOptional()
  @IsNumber()
  lateThreshold?: number;

  @IsOptional()
  @IsNumber()
  breakDuration?: number;

  @IsOptional()
  @IsNumber()
  minWorkingHours?: number;

  @IsOptional()
  @IsNumber()
  maxWorkingHours?: number;

  @IsOptional()
  @IsNumber()
  autoLogoutTime?: number;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  timeFormat?: string;
}

export class CreateCorrectionDto {
  @IsString()
  employeeId: string;

  @IsString()
  correctedDate: string; // YYYY-MM-DD

  @IsString()
  type: string; // CLOCK_IN, CLOCK_OUT

  @IsString()
  correctedTime: string; // DateTime ISO string or HH:mm

  @IsString()
  reason: string;
}

export class UpdateCorrectionDto {
  @IsString()
  status: string; // APPROVED, REJECTED

  @IsOptional()
  @IsString()
  reason?: string; // Rejection/approval comments
}
