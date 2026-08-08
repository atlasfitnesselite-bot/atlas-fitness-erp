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
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        level: string | null;
    }>;
    createDesignation(data: CreateDesignationDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        level: string | null;
    }>;
    updateDesignation(id: string, data: CreateDesignationDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        level: string | null;
    }>;
    deleteDesignation(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        level: string | null;
    }>;
}
