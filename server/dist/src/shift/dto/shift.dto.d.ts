export declare class CreateShiftDto {
    name: string;
    code: string;
    color?: string;
    description?: string;
    type?: string;
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
export declare class UpdateShiftDto {
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
export declare class CreateShiftAssignmentDto {
    employeeIds: string[];
    shiftId: string;
    startDate: string;
    endDate?: string;
    replaceExisting?: boolean;
}
export declare class UpdateShiftAssignmentDto {
    shiftId?: string;
    startDate?: string;
    endDate?: string;
}
export declare class CreateShiftRotationDto {
    name: string;
    frequency: string;
    rotationCycle?: number;
    startDate: string;
    employeeIds: string[];
    shiftSequence: string[];
}
export declare class CreateShiftRequestDto {
    requestedShiftId?: string;
    currentShiftId?: string;
    targetDate: string;
    type: string;
    targetEmployeeId?: string;
    reason: string;
}
export declare class ApproveShiftRequestDto {
    managerComment?: string;
}
export declare class CreateWeeklyOffDto {
    employeeId?: string;
    departmentId?: string;
    days: string[];
}
export declare class CreateShiftExceptionDto {
    employeeId?: string;
    shiftId?: string;
    date: string;
    reason: string;
    type?: string;
}
