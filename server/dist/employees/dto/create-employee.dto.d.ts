export declare class CreateEmployeeDto {
    employeeId: string;
    userId?: string;
    password?: string;
    roleName?: string;
    baseSalary?: number;
    ptCommissionPercentage?: number;
    pin?: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    gender?: string;
    dateOfBirth?: string;
    dob?: string;
    bloodGroup?: string;
    maritalStatus?: string;
    nationality?: string;
    mobile?: string;
    email: string;
    departmentId?: string;
    designationId?: string;
    employmentTypeId?: string;
    joiningDate: string;
    probationEnd?: string;
    confirmationDate?: string;
    managerId?: string;
    workLocation?: string;
    status?: string;
    addresses?: {
        type: string;
        addressLine: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    }[];
    emergencyContacts?: {
        name: string;
        relationship: string;
        mobile: string;
        email?: string;
        address?: string;
    }[];
    salaryInfo?: {
        structure: string;
        basicSalary: number;
        allowances?: number;
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        upi?: string;
    };
    govDocs?: {
        aadhaarNumber?: string;
        panNumber?: string;
        passport?: string;
        drivingLicense?: string;
    };
}
