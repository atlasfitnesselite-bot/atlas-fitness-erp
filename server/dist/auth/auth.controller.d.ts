import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password?: string;
}
declare class RegisterDto {
    email: string;
    password?: string;
    name?: string;
    role?: string;
}
declare class RefreshDto {
    token: string;
}
declare class ForgotPasswordDto {
    email: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: LoginDto, req: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | undefined;
            roles: string[];
        };
    }>;
    register(body: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        isActive: boolean;
        resetToken: string | null;
        resetTokenExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        success: boolean;
    }>;
    launchKiosk(body: {
        deviceCode: string;
    }): Promise<{
        access_token: string;
        device: {
            id: string;
            name: string;
            createdAt: Date;
            status: string;
            code: string;
            lastActive: Date | null;
            branch: string | null;
            managerExitPin: string | null;
        };
    }>;
    refresh(body: RefreshDto): Promise<{
        success: boolean;
        access_token: string;
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
        token?: undefined;
    } | {
        success: boolean;
        message: string;
        token: any;
    }>;
    resetPassword(body: Record<string, string>): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
