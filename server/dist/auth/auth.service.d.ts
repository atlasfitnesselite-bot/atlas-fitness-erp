import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../billing/email.service';
interface LoginUser {
    id: string;
    email: string;
    name?: string;
    employee?: {
        profilePicture?: string | null;
    } | null;
    userRoles?: {
        role: {
            name: string;
        };
    }[];
}
interface RegisterDto {
    email: string;
    password?: string;
    name?: string;
    role?: string;
}
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, pass: string): Promise<any>;
    findUserByEmail(email: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        password: string;
        isActive: boolean;
        resetToken: string | null;
        resetTokenExpiry: Date | null;
    } | null>;
    login(user: LoginUser): {
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | undefined;
            avatar: string | null;
            roles: string[];
        };
    };
    recordLogin(userId: string, ipAddress: string, userAgent: string, status: string): Promise<void>;
    register(data: RegisterDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        resetToken: string | null;
        resetTokenExpiry: Date | null;
    }>;
    launchKiosk(deviceCode: string): Promise<{
        access_token: string;
        device: {
            id: string;
            createdAt: Date;
            name: string;
            status: string;
            code: string;
            lastActive: Date | null;
            branch: string | null;
            managerExitPin: string | null;
        };
    }>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    refreshToken(token: string): Promise<{
        success: boolean;
        access_token: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(data: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
