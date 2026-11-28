import { DesignationsService, CreateDesignationDto } from './designations.service';
export declare class DesignationsController {
    private readonly designationsService;
    constructor(designationsService: DesignationsService);
    getDesignations(): Promise<{
        employeeCount: number;
        _count: {
            employees: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
        level: string | null;
    }[]>;
    getDesignationById(id: string): Promise<{
        employeeCount: number;
        _count: {
            employees: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
        level: string | null;
    }>;
    createDesignation(data: CreateDesignationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
        level: string | null;
    }>;
    updateDesignation(id: string, data: CreateDesignationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
        level: string | null;
    }>;
    deleteDesignation(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
        level: string | null;
    }>;
}
