import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RegisterDto {
    email: string;
    password: string;
    name?: string;
    role?: string;
}
declare class RefreshDto {
    token: string;
}
declare class ForgotPasswordDto {
    email: string;
}
declare class ResetPasswordDto {
    token: string;
    newPassword?: string;
    password?: string;
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
            avatar: string | null;
            roles: string[];
        };
    }>;
    register(body: RegisterDto): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        resetToken: string | null;
        resetTokenExpiry: Date | null;
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
            createdAt: Date;
            name: string;
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
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
