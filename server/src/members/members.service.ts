import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { EmailService } from '../billing/email.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createMemberDto: CreateMemberDto, userId: string) {
    // 1. Check for duplicate mobile
    const existingMobile = await this.prisma.member.findUnique({
      where: { mobile: createMemberDto.mobile },
    });
    if (existingMobile) {
      throw new ConflictException(
        'A member with this mobile number already exists',
      );
    }

    // 2. Check for duplicate email (if provided)
    if (createMemberDto.email) {
      const existingEmail = await this.prisma.member.findUnique({
        where: { email: createMemberDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('A member with this email already exists');
      }
    }

    // 3. Generate unique Member ID continuing from existing AFE-XXX sequence
    const afeMembers = await this.prisma.member.findMany({
      where: { memberId: { startsWith: 'AFE-' } },
      select: { memberId: true },
    });
    let maxNum = 0;
    for (const m of afeMembers) {
      const num = parseInt(m.memberId.replace('AFE-', ''), 10);
      if (!Number.isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    const nextNum = maxNum + 1;
    const memberId = `AFE-${nextNum.toString().padStart(3, '0')}`;

    // 4. Extract nested relations & optional plan assignment
    const {
      addresses,
      emergencyContacts,
      references,
      reference,
      medical,
      fitnessAssessment,
      measurements,
      documents,
      notes,
      planId,
      planStartDate,
      ...memberData
    } = createMemberDto as any;

    const refs = references || reference;

    // 5. Create Member with relationships
    const member = await this.prisma.member.create({
      data: {
        ...memberData,
        memberId,
        addresses:
          addresses && addresses.length > 0
            ? {
                create: addresses,
              }
            : undefined,
        emergencyContacts:
          emergencyContacts && emergencyContacts.length > 0
            ? {
                create: emergencyContacts,
              }
            : undefined,
        references:
          refs && (Array.isArray(refs) ? refs.length > 0 : true)
            ? {
                create: Array.isArray(refs) ? refs[0] : refs,
              }
            : undefined,
        medical:
          medical && (Array.isArray(medical) ? medical.length > 0 : true)
            ? {
                create: Array.isArray(medical) ? medical[0] : medical,
              }
            : undefined,
        fitnessAssessment:
          fitnessAssessment && (Array.isArray(fitnessAssessment) ? fitnessAssessment.length > 0 : true)
            ? {
                create: Array.isArray(fitnessAssessment) ? fitnessAssessment[0] : fitnessAssessment,
              }
            : undefined,
        measurements:
          measurements && measurements.length > 0
            ? {
                create: measurements,
              }
            : undefined,
        documents:
          documents && documents.length > 0
            ? {
                create: documents,
              }
            : undefined,
        notes:
          notes && notes.length > 0
            ? {
                create: notes.map((n: any) => ({ ...n, authorId: userId })),
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

    if (planId) {
      const plan = await this.prisma.membershipPlan.findUnique({ where: { id: planId } });
      if (plan) {
        const start = planStartDate ? new Date(planStartDate) : new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + plan.durationInMonths);
        await this.prisma.memberSubscription.create({
          data: {
            memberId: member.id,
            planId: plan.id,
            startDate: start,
            endDate: end,
            status: 'ACTIVE',
          },
        });
      }
    }

    void this.emailService.sendWelcomeEmail(member);
    return member;
  }

  async findAll(
    query: {
      search?: string;
      status?: string;
      gender?: string;
      branch?: string;
      page?: string | number;
      limit?: string | number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      search,
      status,
      gender,
      branch,
      page = 1,
      limit = 50,
      sortBy = 'memberId',
      sortOrder = 'asc',
    } = query;

    const allowedSortFields = new Set(['memberId', 'firstName', 'joiningDate', 'createdAt', 'status']);
    const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : 'memberId';
    const safeSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.MemberWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (branch) where.branch = branch;

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take,
        orderBy: { [safeSortBy]: safeSortOrder },
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    void this.emailService.sendWelcomeEmail(member);
    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto, userId: string) {
    // Basic update for now, doesn't handle nested updates perfectly yet,
    // but works for basic fields
    const member = await this.findOne(id);

    const {
      addresses,
      emergencyContacts,
      references,
      medical,
      fitnessAssessment,
      measurements,
      documents,
      notes,
      ...memberData
    } = updateMemberDto;

    // Track if status changed
    const statusChanged =
      memberData.status && memberData.status !== member.status;
    const oldStatus = member.status;

    // Build timeline event
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
        statusHistory:
          statusChanged && memberData.status
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

  async remove(id: string, _userId?: string) {
    // Instead of actual deletion, we could archive, but requirements say Delete API.
    // We will do actual delete with cascade, or just archive. We'll do actual delete for now.
    await this.findOne(id);

    return this.prisma.member.delete({
      where: { id },
    });
  }

  async getTimeline(id: string) {
    return this.prisma.memberTimeline.findMany({
      where: { memberId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addDocument(memberId: string, data: any) {
    return this.prisma.memberDocument.create({
      data: {
        memberId,
        ...data,
      },
    });
  }

  async deleteDocument(memberId: string, docId: string) {
    return this.prisma.memberDocument.delete({
      where: { id: docId, memberId },
    });
  }

  async addNote(memberId: string, data: any) {
    return this.prisma.memberNote.create({
      data: {
        memberId,
        ...data,
      },
    });
  }

  async deleteNote(memberId: string, noteId: string) {
    return this.prisma.memberNote.delete({
      where: { id: noteId, memberId },
    });
  }

  async getNotes(memberId: string) {
    return this.prisma.memberNote.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMeasurements(memberId: string) {
    return this.prisma.memberMeasurement.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
    });
  }

  async addMeasurement(memberId: string, data: any) {
    return this.prisma.memberMeasurement.create({
      data: {
        memberId,
        ...data,
      },
    });
  }

  async issueAccessCard(id: string, accessCardId: string) {
    const existing = await this.prisma.member.findUnique({ where: { accessCardId } });
    if (existing && existing.id !== id) {
      throw new ConflictException('Access card already assigned to another member');
    }
    return this.prisma.member.update({
      where: { id },
      data: { accessCardId },
    });
  }

  async freezeSubscription(memberId: string, subId: string, frozenUntil: Date) {
    const subscription = await this.prisma.memberSubscription.findUnique({
      where: { id: subId, memberId },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

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

  async transferSubscription(memberId: string, subId: string, targetMemberId: string) {
    const subscription = await this.prisma.memberSubscription.findUnique({
      where: { id: subId, memberId },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    const targetMember = await this.prisma.member.findUnique({ where: { id: targetMemberId } });
    if (!targetMember) throw new NotFoundException('Target member not found');

    return this.prisma.memberSubscription.update({
      where: { id: subId },
      data: {
        memberId: targetMemberId,
      },
    });
  }

  async updateSubscriptionAgreement(memberId: string, subId: string, agreementUrl: string) {
    const subscription = await this.prisma.memberSubscription.findUnique({
      where: { id: subId, memberId },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    return this.prisma.memberSubscription.update({
      where: { id: subId },
      data: {
        agreementUrl,
      },
    });
  }

  async getInvoices(memberId: string) {
    return this.prisma.invoice.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAttendance(memberId: string) {
    return this.prisma.memberCheckIn.findMany({
      where: { memberId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
