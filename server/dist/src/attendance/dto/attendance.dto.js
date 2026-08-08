"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCorrectionDto = exports.CreateCorrectionDto = exports.UpdateSettingsDto = exports.CheckInOutDto = void 0;
class CheckInOutDto {
    employeeId;
    pin;
    method;
    device;
    location;
    offlineTimestamp;
}
exports.CheckInOutDto = CheckInOutDto;
class UpdateSettingsDto {
    officeStartTime;
    officeEndTime;
    graceTime;
    lateThreshold;
    breakDuration;
    minWorkingHours;
    maxWorkingHours;
    autoLogoutTime;
    deviceName;
    timezone;
    dateFormat;
    timeFormat;
}
exports.UpdateSettingsDto = UpdateSettingsDto;
class CreateCorrectionDto {
    employeeId;
    correctedDate;
    type;
    correctedTime;
    reason;
}
exports.CreateCorrectionDto = CreateCorrectionDto;
class UpdateCorrectionDto {
    status;
    reason;
}
exports.UpdateCorrectionDto = UpdateCorrectionDto;
//# sourceMappingURL=attendance.dto.js.map