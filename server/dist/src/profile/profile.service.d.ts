import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto, UpdatePreferencesDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        themeSettings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            primaryColor: string;
            secondaryColor: string;
            mode: string;
        } | null;
        userPreferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            language: string;
            emailAlerts: boolean;
            pushAlerts: boolean;
        } | null;
        employee: {
            department: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                code: string;
                managerId: string | null;
            } | null;
            designation: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                level: string | null;
            } | null;
            profilePicture: string | null;
        } | null;
        id: string;
        email: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        userRoles: ({
            role: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        language: string;
        emailAlerts: boolean;
        pushAlerts: boolean;
    }>;
}
