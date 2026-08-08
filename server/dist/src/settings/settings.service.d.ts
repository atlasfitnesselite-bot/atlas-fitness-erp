import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanySettingsDto, UpdateThemeSettingsDto } from './dto/settings.dto';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCompanySettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        companyName: string;
        companyLogo: string | null;
        companyContact: string | null;
        timezone: string;
        dateFormat: string;
    } | {
        companyName: string;
        timezone: string;
        dateFormat: string;
        companyLogo: null;
        companyContact: null;
    }>;
    updateCompanySettings(userId: string, dto: UpdateCompanySettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        companyName: string;
        companyLogo: string | null;
        companyContact: string | null;
        timezone: string;
        dateFormat: string;
    }>;
    getThemeSettings(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        primaryColor: string;
        secondaryColor: string;
        mode: string;
    }>;
    updateThemeSettings(userId: string, dto: UpdateThemeSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        primaryColor: string;
        secondaryColor: string;
        mode: string;
    }>;
    getAllRoles(): Promise<({
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
    updateRolePermissions(roleId: string, permissionIds: string[]): Promise<({
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
    }) | null>;
}
