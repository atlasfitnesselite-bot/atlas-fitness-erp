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
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
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
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
    createDepartment(data: CreateDepartmentDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
    updateDepartment(id: string, data: CreateDepartmentDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
    deleteDepartment(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
}
