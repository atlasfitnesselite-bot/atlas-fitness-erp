export declare class UpdateCompanySettingsDto {
    companyName?: string;
    companyLogo?: string;
    companyContact?: string;
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
