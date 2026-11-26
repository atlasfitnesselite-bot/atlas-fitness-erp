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
let EmailService = class EmailService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
            companyName: settings?.companyName || 'Atlas Fitness',
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
        await config.transporter.sendMail({
            from: config.from,
            to: invoice.member.email,
            subject: `Invoice ${invoice.invoiceNumber || ''} - ${config.companyName}`,
            text: `Hello ${invoice.member.firstName},\n\nPlease find attached your invoice (${invoice.invoiceNumber || invoice.id}).\n\nThank you!`,
            attachments: [{ filename, content: pdfBuffer }],
        });
        return { success: true, message: `Invoice sent to ${invoice.member.email}` };
    }
    async sendWelcomeEmail(member) {
        if (!member.email)
            return;
        const config = await this.getTransporterAndSender();
        if (!config || !config.emailNotifications)
            return;
        try {
            await config.transporter.sendMail({
                from: config.from,
                to: member.email,
                subject: `Welcome to ${config.companyName}!`,
                text: `Hello ${member.firstName} ${member.lastName || ''},\n\nWelcome to ${config.companyName}! Your Member ID is ${member.memberId}.\n\nWe are excited to have you train with us!`,
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
        try {
            await config.transporter.sendMail({
                from: config.from,
                to: member.email,
                subject: `Membership Expiry Reminder - ${config.companyName}`,
                text: `Hello ${member.firstName},\n\nYour ${planName} membership (${member.memberId}) expires in ${daysLeft} day(s). Please renew to continue uninterrupted access.\n\nThank you,\n${config.companyName}`,
            });
        }
        catch (err) {
            console.error('Expiry reminder email failed:', err);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map