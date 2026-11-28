"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = __importStar(require("nodemailer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let EmailService = class EmailService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveLogoAttachment() {
        const logoPath = path.join(process.cwd(), 'assets', 'atlas-logo.png');
        if (fs.existsSync(logoPath)) {
            return {
                filename: 'atlas-logo.png',
                path: logoPath,
                cid: 'atlas-logo',
            };
        }
        return null;
    }
    wrapHtmlLayout(title, subtitle, bodyHtml, config, hasLogo) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:24px 12px;">
            <tr>
              <td align="center">
                <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#0f172a 0%,#991b1b 100%);padding:22px 28px;color:#ffffff;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;">
                            ${hasLogo ? `<img src="cid:atlas-logo" alt="${config.companyName}" style="max-height:42px;width:auto;vertical-align:middle;margin-right:12px;" />` : ''}
                            <span style="font-size:20px;font-weight:700;vertical-align:middle;letter-spacing:0.3px;">${config.companyName}</span>
                          </td>
                          <td align="right" style="vertical-align:middle;">
                            <span style="display:inline-block;background:rgba(255,255,255,0.16);padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">
                              ${title}
                            </span>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:10px 0 0 0;font-size:13px;color:#e2e8f0;">${subtitle}</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:26px 28px;">
                      ${bodyHtml}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#f8fafc;padding:18px 28px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
                      <p style="margin:0 0 4px 0;font-weight:700;color:#334155;">${config.companyName}</p>
                      ${config.address ? `<p style="margin:0 0 2px 0;">${config.address}</p>` : ''}
                      <p style="margin:0 0 2px 0;">
                        ${[config.companyContact ? `Phone: ${config.companyContact}` : null, `Email: ${config.from}`].filter(Boolean).join(' &nbsp;|&nbsp; ')}
                      </p>
                      ${config.gstNumber ? `<p style="margin:0;">GSTIN: ${config.gstNumber}</p>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    }
    async getTransporterAndSender() {
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
            companyName: settings?.companyName || 'Atlas Fitness Elite',
            address: settings?.address || '123 Fitness Ave, Gym City',
            companyContact: settings?.companyContact || '9876543210',
            gstNumber: settings?.gstNumber || '29ABCDE1234F1Z5',
            emailNotifications: settings?.emailNotifications ?? true,
        };
    }
    async sendInvoiceEmail(invoice, pdfBuffer, filename) {
        if (!invoice.member?.email) {
            throw new common_1.BadRequestException('Member does not have an email address');
        }
        const config = await this.getTransporterAndSender();
        if (!config) {
            throw new common_1.BadRequestException('SMTP settings are not configured in Company Settings or environment variables');
        }
        const memberName = `${invoice.member.firstName || ''} ${invoice.member.lastName && invoice.member.lastName !== '-' ? invoice.member.lastName : ''}`.trim();
        const invNo = invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase();
        const total = Number(invoice.totalAmount > 0 ? invoice.totalAmount : invoice.amount || 0);
        const paid = Number(invoice.paidAmount || 0);
        const balance = Math.max(0, total - paid);
        const gstRate = Number(invoice.gstRate ?? 0);
        const description = invoice.plan?.name
            ? `Membership Plan - ${invoice.plan.name}`
            : invoice.notes || 'Fitness Membership / Personal Training';
        const statusColor = invoice.status === 'PAID'
            ? '#15803d'
            : invoice.status === 'OVERDUE'
                ? '#dc2626'
                : '#b45309';
        const bodyHtml = `
      <p style="margin:0 0 14px 0;font-size:15px;">Dear <strong>${memberName || 'Member'}</strong>,</p>
      <p style="margin:0 0 18px 0;font-size:14px;color:#475569;line-height:1.5;">
        Thank you for choosing <strong>${config.companyName}</strong>. Please find your official invoice summary below. The detailed PDF copy is attached to this email.
      </p>

      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;border-radius:6px;">
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Invoice Number</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;text-align:right;">${invNo}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Member ID</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:600;text-align:right;">${invoice.member.memberId || '-'}</td>
        </tr>
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Description</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:600;text-align:right;">${description}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Base Amount</td>
          <td style="border-bottom:1px solid #e2e8f0;text-align:right;">₹${Number(invoice.amount || 0).toFixed(2)}</td>
        </tr>
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">GST (${gstRate}%)</td>
          <td style="border-bottom:1px solid #e2e8f0;text-align:right;">${gstRate > 0 ? `₹${Number(invoice.gstAmount || 0).toFixed(2)}` : '₹0.00 (No GST)'}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;font-size:14px;">Grand Total</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;font-size:14px;text-align:right;">₹${total.toFixed(2)}</td>
        </tr>
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#15803d;font-weight:600;">Paid Amount</td>
          <td style="border-bottom:1px solid #e2e8f0;color:#15803d;font-weight:600;text-align:right;">₹${paid.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Balance Due</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;text-align:right;">₹${balance.toFixed(2)}</td>
        </tr>
        <tr style="background-color:#f8fafc;">
          <td style="color:#64748b;">Payment Status</td>
          <td style="text-align:right;font-weight:700;color:${statusColor};">${invoice.status}</td>
        </tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:13px;color:#475569;">
        Due Date: <strong>${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</strong>
        ${invoice.paymentMethod ? ` &nbsp;|&nbsp; Payment Mode: <strong>${invoice.paymentMethod}</strong>` : ''}
      </p>
    `;
        const logo = this.resolveLogoAttachment();
        const attachments = [{ filename, content: pdfBuffer }];
        if (logo)
            attachments.push(logo);
        await config.transporter.sendMail({
            from: `"${config.companyName}" <${config.from}>`,
            to: invoice.member.email,
            subject: `${gstRate > 0 ? 'Tax Invoice' : 'Payment Receipt'} ${invNo} - ${config.companyName}`,
            text: `Hello ${memberName},\n\nPlease find attached your ${gstRate > 0 ? 'Tax Invoice' : 'Payment Receipt'} (${invNo}) for ${description}.\nTotal: INR ${total.toFixed(2)} | Paid: INR ${paid.toFixed(2)} | Balance: INR ${balance.toFixed(2)} | Status: ${invoice.status}.\n\nThank you,\n${config.companyName}`,
            html: this.wrapHtmlLayout(gstRate > 0 ? 'Tax Invoice' : 'Payment Receipt', `Invoice ${invNo} • ${description}`, bodyHtml, config, Boolean(logo)),
            attachments,
        });
        return { success: true, message: `Invoice sent to ${invoice.member.email}` };
    }
    async sendWelcomeEmail(member) {
        if (!member.email)
            return;
        const config = await this.getTransporterAndSender();
        if (!config || !config.emailNotifications)
            return;
        const fullName = `${member.firstName} ${member.lastName && member.lastName !== '-' ? member.lastName : ''}`.trim();
        const bodyHtml = `
      <p style="margin:0 0 14px 0;font-size:15px;">Welcome aboard, <strong>${fullName}</strong>! 💪</p>
      <p style="margin:0 0 18px 0;font-size:14px;color:#475569;line-height:1.6;">
        We are thrilled to welcome you to <strong>${config.companyName}</strong>. Your membership profile has been activated and you are all set to begin your fitness journey with us!
      </p>

      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Member Name</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;text-align:right;">${fullName}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Member ID</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;color:#dc2626;text-align:right;">${member.memberId}</td>
        </tr>
        <tr style="background-color:#f8fafc;">
          <td style="color:#64748b;">Gym Location</td>
          <td style="text-align:right;">${config.address || config.companyName}</td>
        </tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:13px;color:#475569;line-height:1.5;">
        Keep your Member ID (<strong>${member.memberId}</strong>) handy at the reception desk for quick check-ins and personal training updates.
      </p>
    `;
        const logo = this.resolveLogoAttachment();
        try {
            await config.transporter.sendMail({
                from: `"${config.companyName}" <${config.from}>`,
                to: member.email,
                subject: `Welcome to ${config.companyName}! (ID: ${member.memberId})`,
                text: `Hello ${fullName},\n\nWelcome to ${config.companyName}! Your Member ID is ${member.memberId}.\n\nWe are excited to have you train with us!`,
                html: this.wrapHtmlLayout('Welcome', 'Your Fitness Journey Starts Today', bodyHtml, config, Boolean(logo)),
                attachments: logo ? [logo] : [],
            });
        }
        catch (err) {
            console.error('Welcome email failed:', err);
        }
    }
    async sendExpiryReminder(member, planName, daysLeft) {
        if (!member.email)
            return;
        const config = await this.getTransporterAndSender();
        if (!config || !config.emailNotifications)
            return;
        const bodyHtml = `
      <p style="margin:0 0 14px 0;font-size:15px;">Hello <strong>${member.firstName}</strong>,</p>
      <p style="margin:0 0 18px 0;font-size:14px;color:#475569;line-height:1.6;">
        This is a friendly reminder that your gym membership plan at <strong>${config.companyName}</strong> is expiring soon. Please renew on time to enjoy uninterrupted access.
      </p>

      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Member ID</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;text-align:right;">${member.memberId}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Current Plan</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:600;text-align:right;">${planName}</td>
        </tr>
        <tr style="background-color:#fef2f2;">
          <td style="color:#b91c1c;font-weight:600;">Expires In</td>
          <td style="color:#b91c1c;font-weight:700;text-align:right;">${daysLeft} Day(s)</td>
        </tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:13px;color:#475569;">
        Visit the front desk or call us at <strong>${config.companyContact}</strong> to renew your plan.
      </p>
    `;
        const logo = this.resolveLogoAttachment();
        try {
            await config.transporter.sendMail({
                from: `"${config.companyName}" <${config.from}>`,
                to: member.email,
                subject: `Membership Renewal Reminder (${daysLeft} Day(s) Left) - ${config.companyName}`,
                text: `Hello ${member.firstName},\n\nYour ${planName} membership (${member.memberId}) expires in ${daysLeft} day(s). Please renew to continue uninterrupted access.\n\nThank you,\n${config.companyName}`,
                html: this.wrapHtmlLayout('Renewal Reminder', `Your ${planName} Plan Expires in ${daysLeft} Day(s)`, bodyHtml, config, Boolean(logo)),
                attachments: logo ? [logo] : [],
            });
        }
        catch (err) {
            console.error('Expiry reminder email failed:', err);
        }
    }
    async sendPtAssignmentEmail(params) {
        if (!params.memberEmail) {
            return { sent: false, reason: 'Member has no email address' };
        }
        const config = await this.getTransporterAndSender();
        if (!config) {
            return { sent: false, reason: 'SMTP settings not configured' };
        }
        const slotText = params.slotStart && params.slotEnd
            ? `${params.slotStart} - ${params.slotEnd} (1 hr 25 mins daily)${params.slotLocked ? ' [Locked by Admin]' : ''}`
            : 'To be scheduled with your trainer (1 hr 25 mins daily)';
        const bodyHtml = `
      <p style="margin:0 0 14px 0;font-size:15px;">Hello <strong>${params.memberName}</strong>,</p>
      <p style="margin:0 0 18px 0;font-size:14px;color:#475569;line-height:1.6;">
        Your Personal Training program at <strong>${config.companyName}</strong> has been confirmed! Here are your assigned trainer and daily schedule details:
      </p>

      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Member ID</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;text-align:right;">${params.memberCode || '-'}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Personal Trainer</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;color:#dc2626;text-align:right;">${params.trainerName}</td>
        </tr>
        ${params.trainerMobile ? `
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Trainer Contact</td>
          <td style="border-bottom:1px solid #e2e8f0;text-align:right;">${params.trainerMobile}</td>
        </tr>` : ''}
        ${params.trainerEmail ? `
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Trainer Email</td>
          <td style="border-bottom:1px solid #e2e8f0;text-align:right;">${params.trainerEmail}</td>
        </tr>` : ''}
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">PT Package</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:600;text-align:right;">${params.packageName} (${params.sessionsTotal} Sessions)</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Daily Time Slot</td>
          <td style="border-bottom:1px solid #e2e8f0;font-weight:700;text-align:right;">${slotText}</td>
        </tr>
        <tr style="background-color:#f8fafc;">
          <td style="border-bottom:1px solid #e2e8f0;color:#64748b;">Start Date</td>
          <td style="border-bottom:1px solid #e2e8f0;text-align:right;">${new Date(params.startDate).toLocaleDateString('en-IN')}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Expiry Date</td>
          <td style="text-align:right;">${new Date(params.expiryDate).toLocaleDateString('en-IN')}</td>
        </tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:13px;color:#475569;">
        Please arrive 5–10 minutes prior to your scheduled 1 hr 25 min slot. Let&apos;s crush your fitness goals!
      </p>
    `;
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
            `Start Date: ${new Date(params.startDate).toLocaleDateString('en-IN')}`,
            `Expiry Date: ${new Date(params.expiryDate).toLocaleDateString('en-IN')}`,
            '',
            `Thank you,\n${config.companyName}`,
        ]
            .filter((line) => line !== null)
            .join('\n');
        const logo = this.resolveLogoAttachment();
        try {
            await config.transporter.sendMail({
                from: `"${config.companyName}" <${config.from}>`,
                to: params.memberEmail,
                subject: `Personal Trainer Assigned (${params.trainerName}) - ${config.companyName}`,
                text,
                html: this.wrapHtmlLayout('Personal Training', `Trainer: ${params.trainerName} • ${params.packageName}`, bodyHtml, config, Boolean(logo)),
                attachments: logo ? [logo] : [],
            });
            return { sent: true };
        }
        catch (err) {
            console.error('PT assignment email failed:', err);
            return { sent: false, reason: err?.message || 'Failed to send email' };
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map