export class CheckInOutDto {
  employeeId: string;
  pin: string;
  method?: string; // PIN, QR, RFID, FACE
  device?: string;
  location?: string;
  offlineTimestamp?: string;
}

export class UpdateSettingsDto {
  officeStartTime?: string;
  officeEndTime?: string;
  graceTime?: number;
  lateThreshold?: number;
  breakDuration?: number;
  minWorkingHours?: number;
  maxWorkingHours?: number;
  autoLogoutTime?: number;
  deviceName?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export class CreateCorrectionDto {
  employeeId: string;
  correctedDate: string; // YYYY-MM-DD
  type: string; // CLOCK_IN, CLOCK_OUT
  correctedTime: string; // DateTime ISO string or HH:mm
  reason: string;
}

export class UpdateCorrectionDto {
  status: string; // APPROVED, REJECTED
  reason?: string; // Rejection/approval comments
}
