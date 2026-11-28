import { AttendanceService } from './attendance.service';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { AttendanceReportsService } from './attendance-reports.service';
import { CheckInOutDto, UpdateSettingsDto, CreateCorrectionDto, UpdateCorrectionDto } from './dto/attendance.dto';
declare class SelfCheckInOutDto {
    offlineTimestamp?: string;
    location?: string;
    device?: string;
}
export declare class AttendanceController {
    private readonly attendanceService;
    private readonly attendanceAnalyticsService;
    private readonly attendanceReportsService;
    constructor(attendanceService: AttendanceService, attendanceAnalyticsService: AttendanceAnalyticsService, attendanceReportsService: AttendanceReportsService);
    getDashboardAnalytics(date?: string): Promise<{
        presentToday: number;
        absentToday: number;
        pendingRequests: number;
        systemHealth: number;
        totalEmployees: number;
        presentCount: number;
        absentCount: number;
        lateCount: number;
        onBreakCount: number;
        clockedOutCount: number;
        onLeaveCount: number;
        holidayCount: number;
        weeklyOffCount: number;
        workingEmployees: number;
        avgWorkingHours: number;
        overtimeEmployees: number;
        pendingCorrections: number;
        shiftDistribution: {
            name: string;
            count: number;
            color: string;
        }[];
        attendances: ({
            employee: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    managerId: string | null;
                    status: string;
                    description: string | null;
                    code: string;
                } | null;
            } & {
                id: string;
                email: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                employeeId: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                gender: string | null;
                dateOfBirth: Date | null;
                bloodGroup: string | null;
                maritalStatus: string | null;
                nationality: string | null;
                mobile: string | null;
                departmentId: string | null;
                designationId: string | null;
                employmentTypeId: string | null;
                joiningDate: Date;
                probationEnd: Date | null;
                confirmationDate: Date | null;
                managerId: string | null;
                workLocation: string | null;
                status: string;
                hashedPin: string | null;
            };
        } & {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        })[];
    }>;
    getAttendanceTrend(startDate?: string, endDate?: string): Promise<{
        date: string;
        present: number;
        absent: number;
    }[]>;
    getPayrollSummary(month: string, year: string): Promise<({
        employee: {
            id: string;
            email: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string | null;
            departmentId: string | null;
            designationId: string | null;
            employmentTypeId: string | null;
            joiningDate: Date;
            probationEnd: Date | null;
            confirmationDate: Date | null;
            managerId: string | null;
            workLocation: string | null;
            status: string;
            hashedPin: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        year: number;
        lateMinutes: number;
        month: number;
        workingDays: number;
        presentDays: number;
        absentDays: number;
        paidLeave: number;
        unpaidLeave: number;
        lateCount: number;
        overtimeHours: number;
        holidayWork: number;
        weeklyOffWork: number;
        breakHours: number;
        totalWorkingHrs: number;
        salaryDays: number;
    })[]>;
    getLateReports(startDate: string, endDate: string): Promise<({
        employee: {
            id: string;
            email: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string | null;
            departmentId: string | null;
            designationId: string | null;
            employmentTypeId: string | null;
            joiningDate: Date;
            probationEnd: Date | null;
            confirmationDate: Date | null;
            managerId: string | null;
            workLocation: string | null;
            status: string;
            hashedPin: string | null;
        };
        attendance: {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        employeeId: string;
        lateMinutes: number;
        attendanceId: string;
        graceApplied: number;
        penaltyApplied: boolean;
    })[]>;
    getOvertimeReports(startDate: string, endDate: string): Promise<({
        employee: {
            id: string;
            email: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string | null;
            departmentId: string | null;
            designationId: string | null;
            employmentTypeId: string | null;
            joiningDate: Date;
            probationEnd: Date | null;
            confirmationDate: Date | null;
            managerId: string | null;
            workLocation: string | null;
            status: string;
            hashedPin: string | null;
        };
        attendance: {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: string;
        hours: number;
        attendanceId: string;
        approvedById: string | null;
    })[]>;
    getBreakReports(startDate: string, endDate: string): Promise<({
        employee: {
            id: string;
            email: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string | null;
            departmentId: string | null;
            designationId: string | null;
            employmentTypeId: string | null;
            joiningDate: Date;
            probationEnd: Date | null;
            confirmationDate: Date | null;
            managerId: string | null;
            workLocation: string | null;
            status: string;
            hashedPin: string | null;
        };
        attendance: {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        employeeId: string;
        startTime: Date;
        endTime: Date | null;
        attendanceId: string;
        duration: number;
        exceededBy: number;
    })[]>;
    getTimeline(employeeId: string, limit?: string): Promise<({
        attendance: {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        employeeId: string;
        device: string | null;
        type: string;
        method: string;
        location: string | null;
        timestamp: Date;
        attendanceId: string | null;
    })[]>;
    getKioskEmployees(): Promise<{
        designation: {
            name: string;
        } | null;
        id: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
    }[]>;
    checkIn(data: CheckInOutDto): Promise<{
        success: boolean;
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            department: string | undefined;
            designation: string | undefined;
        };
        time: Date;
        type: string;
    }>;
    checkOut(data: CheckInOutDto): Promise<{
        success: boolean;
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            department: string | undefined;
            designation: string | undefined;
        };
        time: Date;
        type: string;
    }>;
    breakStart(data: CheckInOutDto): Promise<{
        success: boolean;
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            department: string | undefined;
            designation: string | undefined;
        };
        time: Date;
        type: string;
    }>;
    breakEnd(data: CheckInOutDto): Promise<{
        success: boolean;
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            department: string | undefined;
            designation: string | undefined;
        };
        time: Date;
        type: string;
    }>;
    selfClockIn(req: {
        user?: {
            id?: string;
        };
    }, data: SelfCheckInOutDto): Promise<{
        success: boolean;
        time: Date;
        type: string;
    }>;
    selfClockOut(req: {
        user?: {
            id?: string;
        };
    }, data: SelfCheckInOutDto): Promise<{
        success: boolean;
        time: Date;
        type: string;
    }>;
    selfStatus(req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        status: string;
        attendance: null;
    } | {
        status: string;
        attendance: {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        };
    }>;
    getAttendance(search?: string, departmentId?: string, status?: string, startDate?: string, endDate?: string, page?: string, limit?: string): Promise<{
        total: number;
        items: ({
            employee: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    managerId: string | null;
                    status: string;
                    description: string | null;
                    code: string;
                } | null;
                designation: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    status: string;
                    description: string | null;
                    level: string | null;
                } | null;
            } & {
                id: string;
                email: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                employeeId: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                gender: string | null;
                dateOfBirth: Date | null;
                bloodGroup: string | null;
                maritalStatus: string | null;
                nationality: string | null;
                mobile: string | null;
                departmentId: string | null;
                designationId: string | null;
                employmentTypeId: string | null;
                joiningDate: Date;
                probationEnd: Date | null;
                confirmationDate: Date | null;
                managerId: string | null;
                workLocation: string | null;
                status: string;
                hashedPin: string | null;
            };
        } & {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        })[];
        page: number;
        limit: number;
    }>;
    getDailyReport(date?: string): Promise<{
        date: Date;
        totalEmployees: number;
        present: number;
        absent: number;
        late: number;
        onBreak: number;
        halfDay: number;
        attendancePercentage: number;
        items: ({
            employee: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    managerId: string | null;
                    status: string;
                    description: string | null;
                    code: string;
                } | null;
                designation: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    status: string;
                    description: string | null;
                    level: string | null;
                } | null;
            } & {
                id: string;
                email: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                employeeId: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                gender: string | null;
                dateOfBirth: Date | null;
                bloodGroup: string | null;
                maritalStatus: string | null;
                nationality: string | null;
                mobile: string | null;
                departmentId: string | null;
                designationId: string | null;
                employmentTypeId: string | null;
                joiningDate: Date;
                probationEnd: Date | null;
                confirmationDate: Date | null;
                managerId: string | null;
                workLocation: string | null;
                status: string;
                hashedPin: string | null;
            };
        } & {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            status: string;
            date: Date;
            clockIn: Date | null;
            clockOut: Date | null;
            breakStart: Date | null;
            breakEnd: Date | null;
            workingHours: number;
            breakDuration: number;
            lateMinutes: number;
        })[];
    }>;
    getWeeklyReport(startDate?: string): Promise<({
        employee: {
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                managerId: string | null;
                status: string;
                description: string | null;
                code: string;
            } | null;
        } & {
            id: string;
            email: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string | null;
            departmentId: string | null;
            designationId: string | null;
            employmentTypeId: string | null;
            joiningDate: Date;
            probationEnd: Date | null;
            confirmationDate: Date | null;
            managerId: string | null;
            workLocation: string | null;
            status: string;
            hashedPin: string | null;
        };
    } & {
        overtime: number;
        earlyExit: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: string;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        breakStart: Date | null;
        breakEnd: Date | null;
        workingHours: number;
        breakDuration: number;
        lateMinutes: number;
    })[]>;
    getMonthlyReport(month?: string, year?: string): Promise<({
        employee: {
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                managerId: string | null;
                status: string;
                description: string | null;
                code: string;
            } | null;
            designation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                status: string;
                description: string | null;
                level: string | null;
            } | null;
        } & {
            id: string;
            email: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string | null;
            departmentId: string | null;
            designationId: string | null;
            employmentTypeId: string | null;
            joiningDate: Date;
            probationEnd: Date | null;
            confirmationDate: Date | null;
            managerId: string | null;
            workLocation: string | null;
            status: string;
            hashedPin: string | null;
        };
    } & {
        overtime: number;
        earlyExit: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: string;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        breakStart: Date | null;
        breakEnd: Date | null;
        workingHours: number;
        breakDuration: number;
        lateMinutes: number;
    })[]>;
    getSettings(): Promise<{
        id: string;
        timezone: string;
        dateFormat: string;
        createdAt: Date;
        updatedAt: Date;
        breakDuration: number;
        lateThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        officeStartTime: string;
        officeEndTime: string;
        graceTime: number;
        autoLogoutTime: number;
        deviceName: string;
        timeFormat: string;
    }>;
    updateSettings(data: UpdateSettingsDto): Promise<{
        id: string;
        timezone: string;
        dateFormat: string;
        createdAt: Date;
        updatedAt: Date;
        breakDuration: number;
        lateThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        officeStartTime: string;
        officeEndTime: string;
        graceTime: number;
        autoLogoutTime: number;
        deviceName: string;
        timeFormat: string;
    }>;
    getCorrections(status?: string): Promise<({
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
        employeeId: string;
        status: string;
        type: string;
        correctedDate: Date;
        correctedTime: Date;
        attendanceId: string | null;
        requestedById: string;
        approvedById: string | null;
        originalTime: Date | null;
    })[]>;
    requestCorrection(req: {
        user?: {
            id?: string;
        };
    }, data: CreateCorrectionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
        employeeId: string;
        status: string;
        type: string;
        correctedDate: Date;
        correctedTime: Date;
        attendanceId: string | null;
        requestedById: string;
        approvedById: string | null;
        originalTime: Date | null;
    }>;
    handleCorrection(id: string, req: {
        user?: {
            id?: string;
        };
    }, data: UpdateCorrectionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
        employeeId: string;
        status: string;
        type: string;
        correctedDate: Date;
        correctedTime: Date;
        attendanceId: string | null;
        requestedById: string;
        approvedById: string | null;
        originalTime: Date | null;
    }>;
    getEmployeeAttendance(employeeId: string): Promise<({
        corrections: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reason: string;
            employeeId: string;
            status: string;
            type: string;
            correctedDate: Date;
            correctedTime: Date;
            attendanceId: string | null;
            requestedById: string;
            approvedById: string | null;
            originalTime: Date | null;
        }[];
        logs: {
            id: string;
            createdAt: Date;
            employeeId: string;
            device: string | null;
            type: string;
            method: string;
            location: string | null;
            timestamp: Date;
            attendanceId: string | null;
        }[];
    } & {
        overtime: number;
        earlyExit: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: string;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        breakStart: Date | null;
        breakEnd: Date | null;
        workingHours: number;
        breakDuration: number;
        lateMinutes: number;
    })[]>;
}
export {};
