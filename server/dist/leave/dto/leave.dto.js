"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustLeaveBalanceDto = exports.UpdateHolidayDto = exports.CreateHolidayDto = exports.ApproveLeaveRequestDto = exports.CreateLeaveRequestDto = exports.UpdateLeaveTypeDto = exports.CreateLeaveTypeDto = void 0;
class CreateLeaveTypeDto {
    name;
    code;
    description;
    isPaid;
    maxDaysPerYear;
    carryForwardAllowed;
    encashmentAllowed;
    requiresApproval;
    status;
}
exports.CreateLeaveTypeDto = CreateLeaveTypeDto;
class UpdateLeaveTypeDto {
    name;
    code;
    description;
    isPaid;
    maxDaysPerYear;
    carryForwardAllowed;
    encashmentAllowed;
    requiresApproval;
    status;
}
exports.UpdateLeaveTypeDto = UpdateLeaveTypeDto;
class CreateLeaveRequestDto {
    employeeId;
    leaveTypeId;
    fromDate;
    toDate;
    isHalfDay;
    reason;
    attachmentUrl;
}
exports.CreateLeaveRequestDto = CreateLeaveRequestDto;
class ApproveLeaveRequestDto {
    managerId;
    status;
    comments;
}
exports.ApproveLeaveRequestDto = ApproveLeaveRequestDto;
class CreateHolidayDto {
    name;
    date;
    description;
    departmentId;
    status;
}
exports.CreateHolidayDto = CreateHolidayDto;
class UpdateHolidayDto {
    name;
    date;
    description;
    departmentId;
    status;
}
exports.UpdateHolidayDto = UpdateHolidayDto;
class AdjustLeaveBalanceDto {
    employeeId;
    leaveTypeId;
    year;
    allocated;
    used;
    carriedForward;
}
exports.AdjustLeaveBalanceDto = AdjustLeaveBalanceDto;
//# sourceMappingURL=leave.dto.js.map