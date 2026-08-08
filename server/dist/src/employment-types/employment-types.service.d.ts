import { PrismaService } from '../prisma/prisma.service';
export declare class CreateEmploymentTypeDto {
    name: string;
    description?: string;
    status?: string;
}
export declare class EmploymentTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    getEmploymentTypes(): Promise<{
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
    }[]>;
    getEmploymentTypeById(id: string): Promise<{
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
    }>;
    createEmploymentType(data: CreateEmploymentTypeDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
    }>;
    updateEmploymentType(id: string, data: CreateEmploymentTypeDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
    }>;
    deleteEmploymentType(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
    }>;
}
