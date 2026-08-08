import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  emailAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  pushAlerts?: boolean;
}
