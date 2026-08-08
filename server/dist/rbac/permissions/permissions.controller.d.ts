import { PermissionsService, CreatePermissionDto } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
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
