import { PrismaService } from '../prisma/prisma.service';
export declare class FacilitiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMaintenanceTickets(): Promise<{
        equipment: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        resolvedAt: Date | null;
        priority: string;
        issue: string;
        reportedBy: string;
    }[]>;
    createMaintenanceTicket(data: {
        equipment: string;
        issue: string;
        priority: string;
        reportedBy: string;
    }): Promise<{
        equipment: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        resolvedAt: Date | null;
        priority: string;
        issue: string;
        reportedBy: string;
    }>;
    resolveMaintenanceTicket(id: string): Promise<{
        equipment: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        resolvedAt: Date | null;
        priority: string;
        issue: string;
        reportedBy: string;
    }>;
    getCleaningZones(): Promise<void>;
    createCleaningZone(data: {
        name: string;
        shift: string;
        tasks: {
            name: string;
        }[];
    }): Promise<void>;
    toggleCleaningTask(id: string, isCompleted: boolean): Promise<void>;
}
