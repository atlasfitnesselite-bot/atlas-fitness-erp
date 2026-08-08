export declare class CheckInOutDto {
    employeeId: string;
    pin: string;
    method?: string;
    device?: string;
    location?: string;
    offlineTimestamp?: string;
}
export declare class UpdateSettingsDto {
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
export declare class CreateCorrectionDto {
    employeeId: string;
    correctedDate: string;
    type: string;
    correctedTime: string;
    reason: string;
}
export declare class UpdateCorrectionDto {
    status: string;
    reason?: string;
}
