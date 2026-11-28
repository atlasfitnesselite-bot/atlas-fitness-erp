import { PrismaService } from '../prisma/prisma.service';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getEmployeeByUserId(userId: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        userId: string | null;
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
    } | null>;
    getTasks(filters: {
        status?: string;
        priority?: string;
        assignedTo?: string;
        category?: string;
    }): Promise<({
        assignee: {
            id: string;
            employeeId: string;
            userId: string | null;
            firstName: string;
            lastName: string;
        } | null;
        assigner: {
            id: string;
            email: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    })[]>;
    createTask(data: any, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
    updateTask(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
    completeTask(id: string, data: {
        photoProof?: string;
        remarks?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
    deleteTask(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
}
