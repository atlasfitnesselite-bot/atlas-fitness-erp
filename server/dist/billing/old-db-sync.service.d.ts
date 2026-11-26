import { PrismaService } from '../prisma/prisma.service';
export declare class OldDbSyncService {
    private readonly prisma;
    private readonly logger;
    private isSyncing;
    constructor(prisma: PrismaService);
    scheduledSync(): Promise<void>;
    private splitName;
    syncFromOldDb(): Promise<{
        skipped: boolean;
        message: string;
        success?: undefined;
        summary?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        summary: {
            newMembers: number;
            newSubscriptions: number;
            newInvoices: number;
            updatedInvoices: number;
            newCafeProducts: number;
            newCafeOrders: number;
        };
        skipped?: undefined;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        skipped?: undefined;
        message?: undefined;
        summary?: undefined;
    }>;
}
