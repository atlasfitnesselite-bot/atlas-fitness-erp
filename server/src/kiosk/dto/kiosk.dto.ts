import { IsNotEmpty, IsString } from 'class-validator';

export class MemberCheckInDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // can be memberId or mobile
}

export class EmployeeCheckInDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  pin: string;
}
