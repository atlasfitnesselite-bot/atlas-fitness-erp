import { PrismaService } from '../prisma/prisma.service';
export declare class CreateDepartmentDto {
    name: string;
    code: string;
    description?: string;
    status?: string;
    managerId?: string;
}
export declare class DepartmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDepartments(): Promise<{
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
        code: string;
        managerId: string | null;
    }[]>;
    getDepartmentById(id: string): Promise<{
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
        code: string;
        managerId: string | null;
    }>;
    createDepartment(data: CreateDepartmentDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        code: string;
        managerId: string | null;
    }>;
    updateDepartment(id: string, data: CreateDepartmentDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        code: string;
        managerId: string | null;
    }>;
    deleteDepartment(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        code: string;
        managerId: string | null;
    }>;
}
