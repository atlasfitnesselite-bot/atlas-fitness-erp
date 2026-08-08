"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllDocuments(userId, role) {
        if (role === 'OWNER' || role === 'MANAGER' || role === 'ADMIN') {
            const companyDocs = await this.prisma.companyDocument.findMany({
                orderBy: { createdAt: 'desc' }
            });
            const employeeDocs = await this.prisma.employeeDocument.findMany({
                include: { employee: true },
                orderBy: { createdAt: 'desc' }
            });
            const memberDocs = await this.prisma.memberDocument.findMany({
                include: { member: true },
                orderBy: { createdAt: 'desc' }
            });
            return { companyDocs, employeeDocs, memberDocs };
        }
        else {
            const employee = await this.prisma.employee.findFirst({
                where: { userId }
            });
            const companyDocs = await this.prisma.companyDocument.findMany({
                orderBy: { createdAt: 'desc' }
            });
            let employeeDocs = [];
            if (employee) {
                employeeDocs = await this.prisma.employeeDocument.findMany({
                    where: { employeeId: employee.id },
                    include: { employee: true },
                    orderBy: { createdAt: 'desc' }
                });
            }
            return { companyDocs, employeeDocs, memberDocs: [] };
        }
    }
    async uploadDocument(file, userId, data) {
        const fileUrl = `/uploads/documents/${file.filename}`;
        const fileSize = file.size;
        const mimeType = file.mimetype;
        if (data.type === 'COMPANY') {
            return this.prisma.companyDocument.create({
                data: {
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    fileName: file.originalname,
                    fileUrl,
                    fileSize,
                    mimeType,
                    uploadedBy: userId
                }
            });
        }
        else if (data.type === 'EMPLOYEE') {
            if (!data.ownerId)
                throw new common_1.BadRequestException('Employee ID is required');
            return this.prisma.employeeDocument.create({
                data: {
                    employeeId: data.ownerId,
                    name: data.title,
                    category: data.category,
                    fileName: file.originalname,
                    fileUrl,
                    fileSize,
                    mimeType
                }
            });
        }
        else if (data.type === 'MEMBER') {
            if (!data.ownerId)
                throw new common_1.BadRequestException('Member ID is required');
            return this.prisma.memberDocument.create({
                data: {
                    memberId: data.ownerId,
                    title: data.title,
                    type: 'DOCUMENT',
                    category: data.category,
                    fileUrl,
                    fileSize,
                    mimeType,
                    uploadedById: userId
                }
            });
        }
        throw new common_1.BadRequestException('Invalid document type');
    }
    async deleteDocument(id, type) {
        if (type === 'COMPANY') {
            return this.prisma.companyDocument.delete({ where: { id } });
        }
        else if (type === 'EMPLOYEE') {
            return this.prisma.employeeDocument.delete({ where: { id } });
        }
        else if (type === 'MEMBER') {
            return this.prisma.memberDocument.delete({ where: { id } });
        }
        throw new common_1.BadRequestException('Invalid document type');
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map