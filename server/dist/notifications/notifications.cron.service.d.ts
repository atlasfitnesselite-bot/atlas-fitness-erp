import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
export declare class NotificationCronService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    handleMembershipExpiry(): Promise<void>;
    handlePtSessionReminders(): Promise<void>;
    handleBirthdayWishes(): Promise<void>;
    handleCleaningPending(): Promise<void>;
    handleLateStaff(): Promise<void>;
    handleLowInventory(): Promise<void>;
    handleEquipmentFaults(): Promise<void>;
    notifySalaryProcessed(employeeId: string, month: string, amount: number): Promise<void>;
}
