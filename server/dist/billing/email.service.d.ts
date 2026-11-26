import { PrismaService } from '../prisma/prisma.service';
export declare class EmailService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getTransporterAndSender;
    sendInvoiceEmail(invoice: any, pdfBuffer: Buffer, filename: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendWelcomeEmail(member: {
        firstName: string;
        lastName?: string;
        email?: string | null;
        memberId: string;
    }): Promise<void>;
    sendExpiryReminder(member: {
        firstName: string;
        email?: string | null;
        memberId: string;
    }, planName: string, daysLeft: number): Promise<void>;
}
