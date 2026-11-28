import { IsOptional, IsString, IsNumber, IsArray, IsObject } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @IsOptional()
  @IsNumber()
  ptCommissionPercentage?: number;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  designationId?: string;

  @IsOptional()
  @IsString()
  employmentTypeId?: string;

  @IsOptional()
  @IsString()
  joiningDate: string;

  @IsOptional()
  @IsString()
  probationEnd?: string;

  @IsOptional()
  @IsString()
  confirmationDate?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsString()
  workLocation?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  addresses?: {
    type: string;
    addressLine: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }[];

  @IsOptional()
  @IsArray()
  emergencyContacts?: {
    name: string;
    relationship: string;
    mobile: string;
    email?: string;
    address?: string;
  }[];

  @IsOptional()
  @IsObject()
  salaryInfo?: {
    structure: string;
    basicSalary: number;
    allowances?: number;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upi?: string;
  };

  @IsOptional()
  @IsObject()
  govDocs?: {
    aadhaarNumber?: string;
    panNumber?: string;
    passport?: string;
    drivingLicense?: string;
  };
}
