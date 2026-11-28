import { SettingsService } from './settings.service';
import { UpdateCompanySettingsDto, UpdateThemeSettingsDto, UpdateRolePermissionsDto } from './dto/settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getCompanySettings(): Promise<{
        id: string;
        companyName: string;
        companyLogo: string | null;
        companyContact: string | null;
        gstNumber: string | null;
        address: string | null;
        email: string | null;
        emailNotifications: boolean;
        razorpayKeyId: string | null;
        razorpayKeySecret: string | null;
        smtpHost: string | null;
        smtpPort: number | null;
        smtpUser: string | null;
        smtpPass: string | null;
        timezone: string;
        dateFormat: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    } | {
        companyName: string;
        timezone: string;
        dateFormat: string;
        companyLogo: null;
        companyContact: null;
    }>;
    updateCompanySettings(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, dto: UpdateCompanySettingsDto): Promise<{
        id: string;
        companyName: string;
        companyLogo: string | null;
        companyContact: string | null;
        gstNumber: string | null;
        address: string | null;
        email: string | null;
        emailNotifications: boolean;
        razorpayKeyId: string | null;
        razorpayKeySecret: string | null;
        smtpHost: string | null;
        smtpPort: number | null;
        smtpUser: string | null;
        smtpPass: string | null;
        timezone: string;
        dateFormat: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getThemeSettings(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        primaryColor: string;
        secondaryColor: string;
        mode: string;
    }>;
    updateThemeSettings(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, dto: UpdateThemeSettingsDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    })[]>;
    updateRolePermissions(id: string, dto: UpdateRolePermissionsDto): Promise<({
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
    }) | null>;
}
