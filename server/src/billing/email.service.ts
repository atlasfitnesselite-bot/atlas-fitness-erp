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
}
