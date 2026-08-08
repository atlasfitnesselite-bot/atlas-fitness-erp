import { PrismaService } from '../../prisma/prisma.service';
export declare class CreatePermissionDto {
    action: string;
    resource: string;
    description?: string;
}
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPermissions(): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        action: string;
        resource: string;
    }[]>;
    createPermission(data: CreatePermissionDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        action: string;
        resource: string;
    }>;
    updatePermission(id: string, data: CreatePermissionDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        action: string;
        resource: string;
    }>;
    deletePermission(id: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        action: string;
        resource: string;
    }>;
}
