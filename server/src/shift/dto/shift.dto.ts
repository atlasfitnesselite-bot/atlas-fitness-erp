export class CreateShiftDto {
  name: string;
  code: string;
  color?: string;
  description?: string;
  type?: string; // MORNING, EVENING, NIGHT, SPLIT, WEEKEND, HOLIDAY, CUSTOM
  startTime: string;
  endTime: string;
  breakDuration?: number;
  gracePeriod?: number;
  lateThreshold?: number;
  earlyExitThreshold?: number;
  minWorkingHours?: number;
  maxWorkingHours?: number;
  overtimeEligibility?: boolean;
  status?: string;
}

export class UpdateShiftDto {
  name?: string;
  code?: string;
  color?: string;
  description?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  breakDuration?: number;
  gracePeriod?: number;
  lateThreshold?: number;
  earlyExitThreshold?: number;
  minWorkingHours?: number;
  maxWorkingHours?: number;
  overtimeEligibility?: boolean;
  status?: string;
}

export class CreateShiftAssignmentDto {
  employeeIds: string[]; // Bulk support
  shiftId: string;
  startDate: string; // ISO Date String or YYYY-MM-DD
  endDate?: string;
  replaceExisting?: boolean;
}

export class UpdateShiftAssignmentDto {
  shiftId?: string;
  startDate?: string;
  endDate?: string;
}

export class CreateShiftRotationDto {
  name: string;
  frequency: string; // WEEKLY, MONTHLY, CUSTOM
  rotationCycle?: number;
  startDate: string;
  employeeIds: string[];
  shiftSequence: string[];
}

export class CreateShiftRequestDto {
  requestedShiftId?: string;
  currentShiftId?: string;
  targetDate: string;
  type: string; // CHANGE, SWAP, TEMPORARY
  targetEmployeeId?: string;
  reason: string;
}

export class ApproveShiftRequestDto {
  managerComment?: string;
}

export class CreateWeeklyOffDto {
  employeeId?: string;
  departmentId?: string;
  days: string[]; // e.g. ["Sunday", "Saturday"]
}

export class CreateShiftExceptionDto {
  employeeId?: string;
  shiftId?: string;
  date: string;
  reason: string;
  type?: string; // HOLIDAY, EMERGENCY, SPECIAL_EVENT
}
