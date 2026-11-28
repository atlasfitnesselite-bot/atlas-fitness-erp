import { EmploymentTypesService, CreateEmploymentTypeDto } from './employment-types.service';
export declare class EmploymentTypesController {
    private readonly employmentTypesService;
    constructor(employmentTypesService: EmploymentTypesService);
    getEmploymentTypes(): Promise<{
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
    }[]>;
    getEmploymentTypeById(id: string): Promise<{
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
    }>;
    createEmploymentType(data: CreateEmploymentTypeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
    }>;
    updateEmploymentType(id: string, data: CreateEmploymentTypeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
    }>;
    deleteEmploymentType(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        description: string | null;
    }>;
}
