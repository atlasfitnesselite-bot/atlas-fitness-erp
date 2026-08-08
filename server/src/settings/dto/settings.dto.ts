import { IsOptional, IsString, IsIn, IsArray } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyLogo?: string;

  @IsOptional()
  @IsString()
  companyContact?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;
}

export class UpdateThemeSettingsDto {
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'])
  mode?: string;
}

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}
