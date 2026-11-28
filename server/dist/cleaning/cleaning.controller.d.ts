import { CleaningService } from './cleaning.service';
export declare class CleaningController {
    private readonly cleaningService;
    constructor(cleaningService: CleaningService);
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    })[]>;
    createArea(data: {
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
    getChecklists(date?: string, areaId?: string, status?: string, assignedTo?: string): Promise<({
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
    }, req: any): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
