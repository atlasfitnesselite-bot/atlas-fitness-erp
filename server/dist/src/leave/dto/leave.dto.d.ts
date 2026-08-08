export declare class CreateLeaveTypeDto {
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
export declare class UpdateLeaveTypeDto {
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
export declare class CreateLeaveRequestDto {
    employeeId: string;
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    isHalfDay?: boolean;
    reason: string;
    attachmentUrl?: string;
}
export declare class ApproveLeaveRequestDto {
    managerId: string;
    status: string;
    comments?: string;
}
export declare class CreateHolidayDto {
    name: string;
    date: string;
    description?: string;
    departmentId?: string;
    status?: string;
}
export declare class UpdateHolidayDto {
    name?: string;
    date?: string;
    description?: string;
    departmentId?: string;
    status?: string;
}
export declare class AdjustLeaveBalanceDto {
    employeeId: string;
    leaveTypeId: string;
    year: number;
    allocated?: number;
    used?: number;
    carriedForward?: number;
}
