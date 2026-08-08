import {
  IsString,
  IsOptional,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MedicalInfoDto } from './medical-info.dto';
import { FitnessAssessmentDto } from './fitness-assessment.dto';
import { MeasurementDto } from './measurement.dto';
import { DocumentDto } from './document.dto';
import { NoteDto } from './note.dto';

class AddressDto {
  @IsString()
  type: string;

  @IsString()
  addressLine: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;
}

class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  altMobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ReferenceDto {
  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsString()
  leadSource?: string;
}

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  altMobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  references?: ReferenceDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInfoDto)
  medical?: MedicalInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FitnessAssessmentDto)
  fitnessAssessment?: FitnessAssessmentDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MeasurementDto)
  measurements?: MeasurementDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NoteDto)
  notes?: NoteDto[];
}
