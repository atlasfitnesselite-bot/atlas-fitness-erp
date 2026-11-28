import { DepartmentsService, CreateDepartmentDto } from './departments.service';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    getDepartments(): Promise<{
        employeeCount: number;
        _count: {
            employees: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
    createDepartment(data: CreateDepartmentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
    updateDepartment(id: string, data: CreateDepartmentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
    deleteDepartment(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        managerId: string | null;
        status: string;
        description: string | null;
        code: string;
    }>;
}
