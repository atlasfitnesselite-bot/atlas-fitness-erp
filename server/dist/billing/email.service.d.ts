import { PrismaService } from '../prisma/prisma.service';
export declare class EmailService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private resolveLogoAttachment;
    private wrapHtmlLayout;
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
    sendPtAssignmentEmail(params: {
        memberName: string;
        memberEmail?: string | null;
        memberCode?: string;
        trainerName: string;
        trainerEmail?: string | null;
        trainerMobile?: string | null;
        packageName: string;
        sessionsTotal: number;
        slotStart?: string | null;
        slotEnd?: string | null;
        slotLocked?: boolean;
        startDate: Date;
        expiryDate: Date;
    }): Promise<{
        sent: boolean;
        reason?: string;
    }>;
    sendPasswordResetEmail(toEmail: string, name: string, resetUrl: string): Promise<{
        sent: boolean;
        reason?: undefined;
    } | {
        sent: boolean;
        reason: any;
    }>;
}
