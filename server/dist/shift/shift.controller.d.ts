import { ShiftService } from './shift.service';
import { CreateShiftDto, UpdateShiftDto, CreateShiftAssignmentDto, UpdateShiftAssignmentDto, CreateShiftRotationDto, CreateShiftRequestDto, ApproveShiftRequestDto, CreateWeeklyOffDto, CreateShiftExceptionDto } from './dto/shift.dto';
export declare class ShiftController {
    private readonly shiftService;
    constructor(shiftService: ShiftService);
    getDashboard(): Promise<{
        totalShifts: number;
        totalAssignments: number;
        assignedEmployees: number;
        unassignedEmployees: number;
        pendingRequests: number;
        shiftDistribution: {
            id: string;
            name: string;
            color: string;
            count: number;
        }[];
        recentHistory: {
            id: string;
            createdAt: Date;
            action: string;
            details: string;
            performedById: string | null;
        }[];
    }>;
    getCalendar(year: string, month: string): Promise<({
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
            attendances: {
                status: string;
                date: Date;
                lateMinutes: number;
            }[];
        };
        shift: {
            id: string;
            name: string;
            type: string;
            startTime: string;
            endTime: string;
            color: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        shiftId: string;
        startDate: Date;
        endDate: Date | null;
    })[]>;
    getHistory(): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        details: string;
        performedById: string | null;
    }[]>;
    findAll(status?: string, type?: string, search?: string): Promise<({
        _count: {
            assignments: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        code: string;
        type: string;
        breakDuration: number;
        lateThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        startTime: string;
        endTime: string;
        color: string;
        gracePeriod: number;
        earlyExitThreshold: number;
        overtimeEligibility: boolean;
    })[]>;
    create(dto: CreateShiftDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        code: string;
        type: string;
        breakDuration: number;
        lateThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        startTime: string;
        endTime: string;
        color: string;
        gracePeriod: number;
        earlyExitThreshold: number;
        overtimeEligibility: boolean;
    }>;
    update(id: string, dto: UpdateShiftDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        code: string;
        type: string;
        breakDuration: number;
        lateThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        startTime: string;
        endTime: string;
        color: string;
        gracePeriod: number;
        earlyExitThreshold: number;
        overtimeEligibility: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getAllAssignments(): Promise<({
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
        };
        shift: {
            id: string;
            name: string;
            type: string;
            color: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        shiftId: string;
        startDate: Date;
        endDate: Date | null;
    })[]>;
    bulkAssign(dto: CreateShiftAssignmentDto): Promise<{
        employeeId: string;
        status: string;
    }[]>;
    updateAssignment(id: string, dto: UpdateShiftAssignmentDto): Promise<{
        employee: {
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
        shift: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            description: string | null;
            code: string;
            type: string;
            breakDuration: number;
            lateThreshold: number;
            minWorkingHours: number;
            maxWorkingHours: number;
            startTime: string;
            endTime: string;
            color: string;
            gracePeriod: number;
            earlyExitThreshold: number;
            overtimeEligibility: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        shiftId: string;
        startDate: Date;
        endDate: Date | null;
    }>;
    removeAssignment(id: string): Promise<{
        message: string;
    }>;
    getAssignmentsByEmployee(employeeId: string): Promise<({
        shift: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            description: string | null;
            code: string;
            type: string;
            breakDuration: number;
            lateThreshold: number;
            minWorkingHours: number;
            maxWorkingHours: number;
            startTime: string;
            endTime: string;
            color: string;
            gracePeriod: number;
            earlyExitThreshold: number;
            overtimeEligibility: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        shiftId: string;
        startDate: Date;
        endDate: Date | null;
    })[]>;
    getRotations(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        startDate: Date;
        frequency: string;
        rotationCycle: number;
        nextRotationDate: Date;
        employeeIds: string;
        shiftSequence: string;
    }[]>;
    createRotation(dto: CreateShiftRotationDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        startDate: Date;
        frequency: string;
        rotationCycle: number;
        nextRotationDate: Date;
        employeeIds: string;
        shiftSequence: string;
    }>;
    getRequests(status?: string, employeeId?: string, req?: any): Promise<({
        employee: {
            id: string;
            employeeId: string;
            firstName: string;
            lastName: string;
        };
        currentShift: {
            id: string;
            name: string;
            color: string;
        } | null;
        requestedShift: {
            id: string;
            name: string;
            color: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        reason: string;
        approvedById: string | null;
        requestedShiftId: string | null;
        currentShiftId: string | null;
        targetDate: Date;
        targetEmployeeId: string | null;
        managerComment: string | null;
    })[]>;
    createRequest(dto: CreateShiftRequestDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        reason: string;
        approvedById: string | null;
        requestedShiftId: string | null;
        currentShiftId: string | null;
        targetDate: Date;
        targetEmployeeId: string | null;
        managerComment: string | null;
    }>;
    approveRequest(id: string, dto: ApproveShiftRequestDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        reason: string;
        approvedById: string | null;
        requestedShiftId: string | null;
        currentShiftId: string | null;
        targetDate: Date;
        targetEmployeeId: string | null;
        managerComment: string | null;
    }>;
    rejectRequest(id: string, dto: ApproveShiftRequestDto, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        employeeId: string;
        type: string;
        reason: string;
        approvedById: string | null;
        requestedShiftId: string | null;
        currentShiftId: string | null;
        targetDate: Date;
        targetEmployeeId: string | null;
        managerComment: string | null;
    }>;
    createWeeklyOff(dto: CreateWeeklyOffDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        days: string;
        employeeId: string | null;
        departmentId: string | null;
    }>;
    createException(dto: CreateShiftExceptionDto): Promise<{
        id: string;
        createdAt: Date;
        employeeId: string | null;
        type: string;
        reason: string;
        date: Date;
        shiftId: string | null;
    }>;
    findOne(id: string): Promise<{
        assignments: ({
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
            employeeId: string;
            shiftId: string;
            startDate: Date;
            endDate: Date | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        code: string;
        type: string;
        breakDuration: number;
        lateThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        startTime: string;
        endTime: string;
        color: string;
        gracePeriod: number;
        earlyExitThreshold: number;
        overtimeEligibility: boolean;
    }>;
}
