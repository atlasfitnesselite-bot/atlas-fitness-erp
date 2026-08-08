import { FacilitiesService } from './facilities.service';
export declare class FacilitiesController {
    private readonly facilitiesService;
    constructor(facilitiesService: FacilitiesService);
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
    createMaintenanceTicket(data: any): Promise<{
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
    createCleaningZone(data: any): Promise<void>;
    toggleCleaningTask(id: string, isCompleted: boolean): Promise<void>;
}
