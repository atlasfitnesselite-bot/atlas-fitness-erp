import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  private async getTransporterAndSender() {
    const settings = await this.prisma.companySettings.findFirst();
    const host = settings?.smtpHost || process.env.SMTP_HOST;
    const port = settings?.smtpPort || Number(process.env.SMTP_PORT || 587);
    const user = settings?.smtpUser || process.env.SMTP_USER;
    const pass = settings?.smtpPass || process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return null;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return {
      transporter,
      from: settings?.email || user,
      companyName: settings?.companyName || 'Atlas Fitness',
      emailNotifications: settings?.emailNotifications ?? true,
    };
  }

  async sendInvoiceEmail(invoice: any, pdfBuffer: Buffer, filename: string) {
    if (!invoice.member?.email) {
      throw new BadRequestException('Member does not have an email address');
    }
    const config = await this.getTransporterAndSender();
    if (!config) {
      throw new BadRequestException(
        'SMTP settings are not configured in Company Settings or environment variables',
      );
    }

    await config.transporter.sendMail({
      from: config.from,
      to: invoice.member.email,
      subject: `Invoice ${invoice.invoiceNumber || ''} - ${config.companyName}`,
      text: `Hello ${invoice.member.firstName},\n\nPlease find attached your invoice (${invoice.invoiceNumber || invoice.id}).\n\nThank you!`,
      attachments: [{ filename, content: pdfBuffer }],
    });

    return { success: true, message: `Invoice sent to ${invoice.member.email}` };
  }

  async sendWelcomeEmail(member: {
    firstName: string;
    lastName?: string;
    email?: string | null;
    memberId: string;
  }) {
    if (!member.email) return;
    const config = await this.getTransporterAndSender();
    if (!config || !config.emailNotifications) return;

    try {
      await config.transporter.sendMail({
        from: config.from,
        to: member.email,
        subject: `Welcome to ${config.companyName}!`,
        text: `Hello ${member.firstName} ${member.lastName || ''},\n\nWelcome to ${config.companyName}! Your Member ID is ${member.memberId}.\n\nWe are excited to have you train with us!`,
      });
    } catch (err) {
      console.error('Welcome email failed:', err);
    }
  }

  async sendExpiryReminder(
    member: { firstName: string; email?: string | null; memberId: string },
    planName: string,
    daysLeft: number,
  ) {
    if (!member.email) return;
    const config = await this.getTransporterAndSender();
    if (!config || !config.emailNotifications) return;

    try {
      await config.transporter.sendMail({
        from: config.from,
        to: member.email,
        subject: `Membership Expiry Reminder - ${config.companyName}`,
        text: `Hello ${member.firstName},\n\nYour ${planName} membership (${member.memberId}) expires in ${daysLeft} day(s). Please renew to continue uninterrupted access.\n\nThank you,\n${config.companyName}`,
      });
    } catch (err) {
      console.error('Expiry reminder email failed:', err);
    }
  }

  async sendPtAssignmentEmail(params: {
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
  }): Promise<{ sent: boolean; reason?: string }> {
    if (!params.memberEmail) {
      return { sent: false, reason: 'Member has no email address' };
    }
    const config = await this.getTransporterAndSender();
    if (!config) {
      return { sent: false, reason: 'SMTP settings not configured' };
    }

    const slotText =
      params.slotStart && params.slotEnd
        ? `${params.slotStart} - ${params.slotEnd} (1 hr 25 mins daily)${params.slotLocked ? ' [Locked by Admin]' : ''}`
        : 'To be scheduled with your trainer (1 hr 25 mins daily)';

    const text = [
      `Hello ${params.memberName}${params.memberCode ? ` (${params.memberCode})` : ''},`,
      '',
      `Your Personal Trainer has been assigned at ${config.companyName}!`,
      '',
      `Personal Trainer: ${params.trainerName}`,
      params.trainerMobile ? `Trainer Contact: ${params.trainerMobile}` : null,
      params.trainerEmail ? `Trainer Email: ${params.trainerEmail}` : null,
      `Package: ${params.packageName} (${params.sessionsTotal} sessions)`,
      `Daily Time Slot: ${slotText}`,
      `Start Date: ${new Date(params.startDate).toLocaleDateString()}`,
      `Expiry Date: ${new Date(params.expiryDate).toLocaleDateString()}`,
      '',
      `Thank you,\n${config.companyName}`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    try {
      await config.transporter.sendMail({
        from: config.from,
        to: params.memberEmail,
        subject: `Personal Trainer Assigned - ${config.companyName}`,
        text,
      });
      return { sent: true };
    } catch (err: any) {
      console.error('PT assignment email failed:', err);
      return { sent: false, reason: err?.message || 'Failed to send email' };
    }
  }
}
