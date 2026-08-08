import { MedicalInfoDto } from './medical-info.dto';
import { FitnessAssessmentDto } from './fitness-assessment.dto';
import { MeasurementDto } from './measurement.dto';
import { DocumentDto } from './document.dto';
import { NoteDto } from './note.dto';
declare class AddressDto {
    type: string;
    addressLine: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}
declare class EmergencyContactDto {
    name: string;
    relationship: string;
    mobile: string;
    altMobile?: string;
    email?: string;
    address?: string;
    priority?: number;
    notes?: string;
}
declare class ReferenceDto {
    referredBy?: string;
    leadSource?: string;
}
export declare class CreateMemberDto {
    firstName: string;
    lastName: string;
    profilePicture?: string;
    gender?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    nationality?: string;
    maritalStatus?: string;
    occupation?: string;
    aadhaarNumber?: string;
    passportNumber?: string;
    mobile: string;
    altMobile?: string;
    email?: string;
    branch?: string;
    status?: string;
    addresses?: AddressDto[];
    emergencyContacts?: EmergencyContactDto[];
    references?: ReferenceDto[];
    medical?: MedicalInfoDto;
    fitnessAssessment?: FitnessAssessmentDto;
    measurements?: MeasurementDto[];
    documents?: DocumentDto[];
    notes?: NoteDto[];
}
export {};
