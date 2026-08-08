import { PrismaService } from '../prisma/prisma.service';
import { MemberCheckInDto, EmployeeCheckInDto } from './dto/kiosk.dto';
import { EventsGateway } from '../events/events.gateway';
export declare class KioskService {
    private readonly prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
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
