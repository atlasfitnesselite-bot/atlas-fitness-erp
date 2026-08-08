"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateShiftExceptionDto = exports.CreateWeeklyOffDto = exports.ApproveShiftRequestDto = exports.CreateShiftRequestDto = exports.CreateShiftRotationDto = exports.UpdateShiftAssignmentDto = exports.CreateShiftAssignmentDto = exports.UpdateShiftDto = exports.CreateShiftDto = void 0;
class CreateShiftDto {
    name;
    code;
    color;
    description;
    type;
    startTime;
    endTime;
    breakDuration;
    gracePeriod;
    lateThreshold;
    earlyExitThreshold;
    minWorkingHours;
    maxWorkingHours;
    overtimeEligibility;
    status;
}
exports.CreateShiftDto = CreateShiftDto;
class UpdateShiftDto {
    name;
    code;
    color;
    description;
    type;
    startTime;
    endTime;
    breakDuration;
    gracePeriod;
    lateThreshold;
    earlyExitThreshold;
    minWorkingHours;
    maxWorkingHours;
    overtimeEligibility;
    status;
}
exports.UpdateShiftDto = UpdateShiftDto;
class CreateShiftAssignmentDto {
    employeeIds;
    shiftId;
    startDate;
    endDate;
    replaceExisting;
}
exports.CreateShiftAssignmentDto = CreateShiftAssignmentDto;
class UpdateShiftAssignmentDto {
    shiftId;
    startDate;
    endDate;
}
exports.UpdateShiftAssignmentDto = UpdateShiftAssignmentDto;
class CreateShiftRotationDto {
    name;
    frequency;
    rotationCycle;
    startDate;
    employeeIds;
    shiftSequence;
}
exports.CreateShiftRotationDto = CreateShiftRotationDto;
class CreateShiftRequestDto {
    requestedShiftId;
    currentShiftId;
    targetDate;
    type;
    targetEmployeeId;
    reason;
}
exports.CreateShiftRequestDto = CreateShiftRequestDto;
class ApproveShiftRequestDto {
    managerComment;
}
exports.ApproveShiftRequestDto = ApproveShiftRequestDto;
class CreateWeeklyOffDto {
    employeeId;
    departmentId;
    days;
}
exports.CreateWeeklyOffDto = CreateWeeklyOffDto;
class CreateShiftExceptionDto {
    employeeId;
    shiftId;
    date;
    reason;
    type;
}
exports.CreateShiftExceptionDto = CreateShiftExceptionDto;
//# sourceMappingURL=shift.dto.js.map