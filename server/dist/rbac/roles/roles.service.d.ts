import { PrismaService } from '../../prisma/prisma.service';
export declare class CreateRoleDto {
    name: string;
    description?: string;
}
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    getRoles(): Promise<({
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                description: string | null;
                action: string;
                resource: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    })[]>;
    createRole(data: CreateRoleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
    updateRole(id: string, data: CreateRoleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
    deleteRole(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
}
