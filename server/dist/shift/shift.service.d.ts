import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateShiftDto, UpdateShiftDto, CreateShiftAssignmentDto, UpdateShiftAssignmentDto, CreateShiftRotationDto, CreateShiftRequestDto, ApproveShiftRequestDto, CreateWeeklyOffDto, CreateShiftExceptionDto } from './dto/shift.dto';
export declare class ShiftService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    seedDefaultShifts(): Promise<void>;
    findAll(query: {
        status?: string;
        type?: string;
        search?: string;
    }): Promise<({
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
        color: string;
        startTime: string;
        endTime: string;
        gracePeriod: number;
        lateThreshold: number;
        earlyExitThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        overtimeEligibility: boolean;
    })[]>;
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
        color: string;
        startTime: string;
        endTime: string;
        gracePeriod: number;
        lateThreshold: number;
        earlyExitThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        overtimeEligibility: boolean;
    }>;
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
        color: string;
        startTime: string;
        endTime: string;
        gracePeriod: number;
        lateThreshold: number;
        earlyExitThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
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
        color: string;
        startTime: string;
        endTime: string;
        gracePeriod: number;
        lateThreshold: number;
        earlyExitThreshold: number;
        minWorkingHours: number;
        maxWorkingHours: number;
        overtimeEligibility: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    bulkAssign(dto: CreateShiftAssignmentDto): Promise<{
        employeeId: string;
        status: string;
    }[]>;
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
            color: string;
            startTime: string;
            endTime: string;
            gracePeriod: number;
            lateThreshold: number;
            earlyExitThreshold: number;
            minWorkingHours: number;
            maxWorkingHours: number;
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
            color: string;
            startTime: string;
            endTime: string;
            gracePeriod: number;
            lateThreshold: number;
            earlyExitThreshold: number;
            minWorkingHours: number;
            maxWorkingHours: number;
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
    getRequests(query: {
        status?: string;
        employeeId?: string;
    }, user?: any): Promise<({
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
    createRequest(userId: string, dto: CreateShiftRequestDto): Promise<{
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
    approveRequest(id: string, approverId: string, dto: ApproveShiftRequestDto): Promise<{
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
    rejectRequest(id: string, approverId: string, dto: ApproveShiftRequestDto): Promise<{
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
    getHistory(): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        details: string;
        performedById: string | null;
    }[]>;
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
    getCalendar(year: number, month: number): Promise<({
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
            color: string;
            startTime: string;
            endTime: string;
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
}
