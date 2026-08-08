import { KioskService } from './kiosk.service';
import { MemberCheckInDto, EmployeeCheckInDto } from './dto/kiosk.dto';
export declare class KioskController {
    private readonly kioskService;
    constructor(kioskService: KioskService);
    memberCheckIn(dto: MemberCheckInDto): Promise<{
        success: boolean;
        memberName: string;
        message: string;
    }>;
    employeeCheckIn(dto: EmployeeCheckInDto): Promise<{
        success: boolean;
        employeeName: string;
        message: string;
    }>;
}
