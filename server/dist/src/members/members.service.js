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
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MembersService = class MembersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMemberDto, userId) {
        const existingMobile = await this.prisma.member.findUnique({
            where: { mobile: createMemberDto.mobile },
        });
        if (existingMobile) {
            throw new common_1.ConflictException('A member with this mobile number already exists');
        }
        if (createMemberDto.email) {
            const existingEmail = await this.prisma.member.findUnique({
                where: { email: createMemberDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('A member with this email already exists');
            }
        }
        const count = await this.prisma.member.count();
        const memberId = `MEM-${(count + 1).toString().padStart(4, '0')}`;
        const { addresses, emergencyContacts, references, reference, medical, fitnessAssessment, measurements, documents, notes, ...memberData } = createMemberDto;
        const refs = references || reference;
        const member = await this.prisma.member.create({
            data: {
                ...memberData,
                memberId,
                addresses: addresses && addresses.length > 0
                    ? {
                        create: addresses,
                    }
                    : undefined,
                emergencyContacts: emergencyContacts && emergencyContacts.length > 0
                    ? {
                        create: emergencyContacts,
                    }
                    : undefined,
                references: refs && (Array.isArray(refs) ? refs.length > 0 : true)
                    ? {
                        create: Array.isArray(refs) ? refs[0] : refs,
                    }
                    : undefined,
                medical: medical && (Array.isArray(medical) ? medical.length > 0 : true)
                    ? {
                        create: Array.isArray(medical) ? medical[0] : medical,
                    }
                    : undefined,
                fitnessAssessment: fitnessAssessment && (Array.isArray(fitnessAssessment) ? fitnessAssessment.length > 0 : true)
                    ? {
                        create: Array.isArray(fitnessAssessment) ? fitnessAssessment[0] : fitnessAssessment,
                    }
                    : undefined,
                measurements: measurements && measurements.length > 0
                    ? {
                        create: measurements,
                    }
                    : undefined,
                documents: documents && documents.length > 0
                    ? {
                        create: documents,
                    }
                    : undefined,
                notes: notes && notes.length > 0
                    ? {
                        create: notes.map((n) => ({ ...n, authorId: userId })),
                    }
                    : undefined,
                timeline: {
                    create: [
                        {
                            event: 'Profile Created',
                            description: `Member profile was created manually.`,
                        },
                    ],
                },
                statusHistory: {
                    create: [
                        {
                            newStatus: memberData.status || 'ACTIVE',
                            reason: 'Initial Registration',
                            changedById: userId,
                        },
                    ],
                },
            },
            include: {
                addresses: true,
                emergencyContacts: true,
                references: true,
                medical: true,
                fitnessAssessment: true,
                measurements: true,
                documents: true,
                notes: true,
            },
        });
        return member;
    }
    async findAll(query = {}) {
        const { search, status, gender, branch, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { memberId: { contains: search } },
                { mobile: { contains: search } },
                { email: { contains: search } },
            ];
        }
        if (status)
            where.status = status;
        if (gender)
            where.gender = gender;
        if (branch)
            where.branch = branch;
        const [members, total] = await Promise.all([
            this.prisma.member.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.member.count({ where }),
        ]);
        return {
            data: members,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }
    async findOne(id) {
        const member = await this.prisma.member.findUnique({
            where: { id },
            include: {
                addresses: true,
                emergencyContacts: true,
                references: true,
                medical: true,
                fitnessAssessment: true,
                measurements: {
                    orderBy: { date: 'desc' },
                },
                documents: true,
                notes: {
                    orderBy: { createdAt: 'desc' },
                },
                subscriptions: {
                    include: { plan: true },
                },
                ptPackages: true,
            },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with ID ${id} not found`);
        }
        return member;
    }
    async update(id, updateMemberDto, userId) {
        const member = await this.findOne(id);
        const { addresses, emergencyContacts, references, medical, fitnessAssessment, measurements, documents, notes, ...memberData } = updateMemberDto;
        const statusChanged = memberData.status && memberData.status !== member.status;
        const oldStatus = member.status;
        let timelineEvent = 'Profile Updated';
        let timelineDesc = 'Member profile was updated.';
        if (statusChanged) {
            timelineEvent = 'Status Changed';
            timelineDesc = `Status changed from ${oldStatus} to ${memberData.status}`;
        }
        const updated = await this.prisma.member.update({
            where: { id },
            data: {
                ...memberData,
                timeline: {
                    create: {
                        event: timelineEvent,
                        description: timelineDesc,
                    },
                },
                statusHistory: statusChanged && memberData.status
                    ? {
                        create: {
                            oldStatus,
                            newStatus: memberData.status,
                            reason: 'Manual Update',
                            changedById: userId,
                        },
                    }
                    : undefined,
            },
        });
        return updated;
    }
    async remove(id, _userId) {
        await this.findOne(id);
        return this.prisma.member.delete({
            where: { id },
        });
    }
    async getTimeline(id) {
        return this.prisma.memberTimeline.findMany({
            where: { memberId: id },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addDocument(memberId, data) {
        return this.prisma.memberDocument.create({
            data: {
                memberId,
                ...data,
            },
        });
    }
    async deleteDocument(memberId, docId) {
        return this.prisma.memberDocument.delete({
            where: { id: docId, memberId },
        });
    }
    async addNote(memberId, data) {
        return this.prisma.memberNote.create({
            data: {
                memberId,
                ...data,
            },
        });
    }
    async deleteNote(memberId, noteId) {
        return this.prisma.memberNote.delete({
            where: { id: noteId, memberId },
        });
    }
    async getNotes(memberId) {
        return this.prisma.memberNote.findMany({
            where: { memberId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMeasurements(memberId) {
        return this.prisma.memberMeasurement.findMany({
            where: { memberId },
            orderBy: { date: 'desc' },
        });
    }
    async addMeasurement(memberId, data) {
        return this.prisma.memberMeasurement.create({
            data: {
                memberId,
                ...data,
            },
        });
    }
    async issueAccessCard(id, accessCardId) {
        const existing = await this.prisma.member.findUnique({ where: { accessCardId } });
        if (existing && existing.id !== id) {
            throw new common_1.ConflictException('Access card already assigned to another member');
        }
        return this.prisma.member.update({
            where: { id },
            data: { accessCardId },
        });
    }
    async freezeSubscription(memberId, subId, frozenUntil) {
        const subscription = await this.prisma.memberSubscription.findUnique({
            where: { id: subId, memberId },
        });
        if (!subscription)
            throw new common_1.NotFoundException('Subscription not found');
        const now = new Date();
        const diffTime = Math.abs(frozenUntil.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const newEndDate = new Date(subscription.endDate);
        newEndDate.setDate(newEndDate.getDate() + diffDays);
        return this.prisma.memberSubscription.update({
            where: { id: subId },
            data: {
                isFrozen: true,
                status: 'FROZEN',
                frozenDate: now,
                frozenUntil: frozenUntil,
                endDate: newEndDate,
            },
        });
    }
    async transferSubscription(memberId, subId, targetMemberId) {
        const subscription = await this.prisma.memberSubscription.findUnique({
            where: { id: subId, memberId },
        });
        if (!subscription)
            throw new common_1.NotFoundException('Subscription not found');
        const targetMember = await this.prisma.member.findUnique({ where: { id: targetMemberId } });
        if (!targetMember)
            throw new common_1.NotFoundException('Target member not found');
        return this.prisma.memberSubscription.update({
            where: { id: subId },
            data: {
                memberId: targetMemberId,
            },
        });
    }
    async updateSubscriptionAgreement(memberId, subId, agreementUrl) {
        const subscription = await this.prisma.memberSubscription.findUnique({
            where: { id: subId, memberId },
        });
        if (!subscription)
            throw new common_1.NotFoundException('Subscription not found');
        return this.prisma.memberSubscription.update({
            where: { id: subId },
            data: {
                agreementUrl,
            },
        });
    }
    async getInvoices(memberId) {
        return this.prisma.invoice.findMany({
            where: { memberId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAttendance(memberId) {
        return this.prisma.memberCheckIn.findMany({
            where: { memberId },
            orderBy: { timestamp: 'desc' },
        });
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembersService);
//# sourceMappingURL=members.service.js.map