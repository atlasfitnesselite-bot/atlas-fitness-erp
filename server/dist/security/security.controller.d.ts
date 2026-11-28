import { PrismaService } from '../prisma/prisma.service';
export declare class SecurityController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getLoginHistory(): Promise<({
        user: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
    getAuditLogs(): Promise<({
        user: {
            email: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        action: string;
        resource: string;
        details: string | null;
    })[]>;
}
