export class CreateLeaveTypeDto {
  name: string;
  code: string;
  description?: string;
  isPaid?: boolean;
  maxDaysPerYear?: number;
  carryForwardAllowed?: boolean;
  encashmentAllowed?: boolean;
  requiresApproval?: boolean;
  status?: string;
}

export class UpdateLeaveTypeDto {
  name?: string;
  code?: string;
  description?: string;
  isPaid?: boolean;
  maxDaysPerYear?: number;
  carryForwardAllowed?: boolean;
  encashmentAllowed?: boolean;
  requiresApproval?: boolean;
  status?: string;
}

export class CreateLeaveRequestDto {
  employeeId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  isHalfDay?: boolean;
  reason: string;
  attachmentUrl?: string;
}

export class ApproveLeaveRequestDto {
  managerId: string;
  status: string; // APPROVED, REJECTED, MODIFIED
  comments?: string;
}

export class CreateHolidayDto {
  name: string;
  date: string;
  description?: string;
  departmentId?: string;
  status?: string;
}

export class UpdateHolidayDto {
  name?: string;
  date?: string;
  description?: string;
  departmentId?: string;
  status?: string;
}

export class AdjustLeaveBalanceDto {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allocated?: number;
  used?: number;
  carriedForward?: number;
}
