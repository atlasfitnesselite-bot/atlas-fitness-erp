import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CheckInOutDto, UpdateSettingsDto, CreateCorrectionDto, UpdateCorrectionDto } from './dto/attendance.dto';
export declare class AttendanceService {
    private prisma;
    private eventsGateway;
    private notificationsService;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway, notificationsService: NotificationsService);
    private getLocalDateString;
    private getNormalizedDate;
    getSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        timezone: string;
        dateFormat: string;
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
        createdAt: Date;
        updatedAt: Date;
        timezone: string;
        dateFormat: string;
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
    private logEmployeeTimeline;
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
    selfClockIn(userId: string, data: any): Promise<{
        success: boolean;
        time: Date;
        type: string;
    }>;
    selfClockOut(userId: string, data: any): Promise<{
        success: boolean;
        time: Date;
        type: string;
    }>;
    selfStatus(userId: string): Promise<{
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
            status: string;
            employeeId: string;
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
    getAttendanceRecords(query: {
        search?: string;
        departmentId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        total: number;
        items: ({
            employee: {
                department: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    description: string | null;
                    code: string;
                    managerId: string | null;
                } | null;
                designation: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    description: string | null;
                    level: string | null;
                } | null;
            } & {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                userId: string | null;
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
                hashedPin: string | null;
            };
        } & {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            employeeId: string;
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
    getEmployeeAttendance(employeeId: string): Promise<({
        corrections: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            employeeId: string;
            type: string;
            reason: string;
            attendanceId: string | null;
            requestedById: string;
            approvedById: string | null;
            correctedDate: Date;
            originalTime: Date | null;
            correctedTime: Date;
        }[];
        logs: {
            id: string;
            createdAt: Date;
            device: string | null;
            employeeId: string;
            type: string;
            timestamp: Date;
            method: string;
            location: string | null;
            attendanceId: string | null;
        }[];
    } & {
        overtime: number;
        earlyExit: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        breakStart: Date | null;
        breakEnd: Date | null;
        workingHours: number;
        breakDuration: number;
        lateMinutes: number;
    })[]>;
    getDailyReport(dateStr?: string): Promise<{
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
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    description: string | null;
                    code: string;
                    managerId: string | null;
                } | null;
                designation: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    description: string | null;
                    level: string | null;
                } | null;
            } & {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                userId: string | null;
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
                hashedPin: string | null;
            };
        } & {
            overtime: number;
            earlyExit: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            employeeId: string;
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
    getWeeklyReport(startDateStr?: string): Promise<({
        employee: {
            department: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                code: string;
                managerId: string | null;
            } | null;
        } & {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            userId: string | null;
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
            hashedPin: string | null;
        };
    } & {
        overtime: number;
        earlyExit: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        breakStart: Date | null;
        breakEnd: Date | null;
        workingHours: number;
        breakDuration: number;
        lateMinutes: number;
    })[]>;
    getMonthlyReport(month?: number, year?: number): Promise<({
        employee: {
            department: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                code: string;
                managerId: string | null;
            } | null;
            designation: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                level: string | null;
            } | null;
        } & {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            userId: string | null;
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
            hashedPin: string | null;
        };
    } & {
        overtime: number;
        earlyExit: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        breakStart: Date | null;
        breakEnd: Date | null;
        workingHours: number;
        breakDuration: number;
        lateMinutes: number;
    })[]>;
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
        status: string;
        employeeId: string;
        type: string;
        reason: string;
        attendanceId: string | null;
        requestedById: string;
        approvedById: string | null;
        correctedDate: Date;
        originalTime: Date | null;
        correctedTime: Date;
    })[]>;
    createCorrection(requestedById: string, data: CreateCorrectionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        reason: string;
        attendanceId: string | null;
        requestedById: string;
        approvedById: string | null;
        correctedDate: Date;
        originalTime: Date | null;
        correctedTime: Date;
    }>;
    handleCorrectionApproval(id: string, approvedById: string, data: UpdateCorrectionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        reason: string;
        attendanceId: string | null;
        requestedById: string;
        approvedById: string | null;
        correctedDate: Date;
        originalTime: Date | null;
        correctedTime: Date;
    }>;
}
