import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanySettingsDto, UpdateThemeSettingsDto } from './dto/settings.dto';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    updateCompanySettings(userId: string, dto: UpdateCompanySettingsDto): Promise<{
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
    getThemeSettings(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        primaryColor: string;
        secondaryColor: string;
        mode: string;
    }>;
    updateThemeSettings(userId: string, dto: UpdateThemeSettingsDto): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }) | null>;
}
