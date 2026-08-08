export declare class UpdateProfileDto {
    name?: string;
    email?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class UpdatePreferencesDto {
    language?: string;
    emailAlerts?: boolean;
    pushAlerts?: boolean;
}
