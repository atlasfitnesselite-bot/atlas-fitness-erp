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
        userId: string;
        createdAt: Date;
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
        userId: string | null;
        createdAt: Date;
        action: string;
        resource: string;
        details: string | null;
    })[]>;
}
