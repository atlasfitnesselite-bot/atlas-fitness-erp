import { ProfileService } from './profile.service';
import { UpdateProfileDto, ChangePasswordDto, UpdatePreferencesDto } from './dto/update-profile.dto';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<{
        themeSettings: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            primaryColor: string;
            secondaryColor: string;
            mode: string;
        } | null;
        userPreferences: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            language: string;
            emailAlerts: boolean;
            pushAlerts: boolean;
        } | null;
        employee: {
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                managerId: string | null;
                status: string;
                description: string | null;
                code: string;
            } | null;
            designation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                status: string;
                description: string | null;
                level: string | null;
            } | null;
            profilePicture: string | null;
        } | null;
        id: string;
        email: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        userRoles: ({
            role: {
                name: string;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            roleId: string;
        })[];
    }>;
    updateProfile(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string;
    }>;
    changePassword(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updatePreferences(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, dto: UpdatePreferencesDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        language: string;
        emailAlerts: boolean;
        pushAlerts: boolean;
    }>;
}
