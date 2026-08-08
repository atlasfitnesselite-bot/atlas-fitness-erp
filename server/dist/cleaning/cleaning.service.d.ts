import { PrismaService } from '../prisma/prisma.service';
export declare class CleaningService {
    private prisma;
    constructor(prisma: PrismaService);
    getAreas(): Promise<({
        checklists: ({
            assignee: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            shift: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            date: Date;
            areaId: string;
            assignedTo: string | null;
            verifiedBy: string | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    })[]>;
    createArea(data: {
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    getChecklists(filters: {
        date?: string;
        areaId?: string;
        status?: string;
        assignedTo?: string;
    }): Promise<({
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            checklistId: string;
            taskName: string;
            isCompleted: boolean;
            completedAt: Date | null;
            photoProof: string | null;
            remarks: string | null;
        }[];
        area: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        shift: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        date: Date;
        areaId: string;
        assignedTo: string | null;
        verifiedBy: string | null;
    })[]>;
    createChecklist(data: {
        areaId: string;
        date: string;
        shift: string;
        assignedTo?: string;
        tasks: string[];
    }): Promise<{
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            checklistId: string;
            taskName: string;
            isCompleted: boolean;
            completedAt: Date | null;
            photoProof: string | null;
            remarks: string | null;
        }[];
        area: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        assignee: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        shift: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        date: Date;
        areaId: string;
        assignedTo: string | null;
        verifiedBy: string | null;
    }>;
    updateChecklistStatus(id: string, data: {
        status: string;
        verifiedBy?: string;
    }): Promise<{
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            checklistId: string;
            taskName: string;
            isCompleted: boolean;
            completedAt: Date | null;
            photoProof: string | null;
            remarks: string | null;
        }[];
        area: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        shift: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        date: Date;
        areaId: string;
        assignedTo: string | null;
        verifiedBy: string | null;
    }>;
    updateTask(id: string, data: {
        isCompleted?: boolean;
        photoProof?: string;
        remarks?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        checklistId: string;
        taskName: string;
        isCompleted: boolean;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
    }>;
}
