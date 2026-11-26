export declare class UpdateCompanySettingsDto {
    companyName?: string;
    companyLogo?: string;
    companyContact?: string;
    gstNumber?: string;
    address?: string;
    email?: string;
    emailNotifications?: boolean;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    timezone?: string;
    dateFormat?: string;
}
export declare class UpdateThemeSettingsDto {
    primaryColor?: string;
    secondaryColor?: string;
    mode?: string;
}
export declare class UpdateRolePermissionsDto {
    permissionIds: string[];
}
