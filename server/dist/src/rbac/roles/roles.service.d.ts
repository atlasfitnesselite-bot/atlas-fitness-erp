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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    })[]>;
    createRole(data: CreateRoleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    updateRole(id: string, data: CreateRoleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    deleteRole(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
}
