import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../billing/email.service';
import { PdfService } from '../billing/pdf.service';
import { BookSessionDto, CreateFitnessPlanDto, CreateMeasurementDto, CreateCommissionDto, CompleteSessionDto } from './dto/pt.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PtService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService,
  ) {}

  async getSessions() {
    return this.prisma.pTSession.findMany({
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true } },
        member: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getSessionsByTrainer(trainerId: string) {
    return this.prisma.pTSession.findMany({
      where: { trainerId },
      include: {
        member: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async bookSession(dto: BookSessionDto) {
    const trainer = await this.prisma.employee.findUnique({
      where: { id: dto.trainerId },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');

    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.pTSession.create({
      data: {
        trainerId: dto.trainerId,
        memberId: dto.memberId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: 'SCHEDULED',
        notes: dto.notes,
      },
    });
  }

  async getFitnessPlans(memberId?: string) {
    const where = memberId ? { memberId } : {};
    return this.prisma.fitnessPlan.findMany({
      where,
      include: {
        trainer: true,
        member: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFitnessPlan(dto: CreateFitnessPlanDto) {
    const trainer = await this.prisma.employee.findUnique({
      where: { id: dto.trainerId },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');

    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.fitnessPlan.create({
      data: {
        memberId: dto.memberId,
        trainerId: dto.trainerId,
        type: dto.type,
        title: dto.title,
        content: typeof dto.content === 'string' ? dto.content : JSON.stringify(dto.content),
      },
    });
  }

  async updateFitnessPlan(id: string, dto: any) {
    const plan = await this.prisma.fitnessPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Fitness plan not found');

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) {
      data.content = typeof dto.content === 'string' ? dto.content : JSON.stringify(dto.content);
    }
    if (dto.trainerId !== undefined) data.trainerId = dto.trainerId;

    return this.prisma.fitnessPlan.update({
      where: { id },
      data,
    });
  }

  async deleteFitnessPlan(id: string) {
    const plan = await this.prisma.fitnessPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Fitness plan not found');

    return this.prisma.fitnessPlan.delete({
      where: { id },
    });
  }

  async updateSessionNotes(id: string, notes: string) {
    return this.prisma.pTSession.update({
      where: { id },
      data: { notes },
    });
  }

  async updateSessionFeedback(id: string, clientFeedback: string) {
    return this.prisma.pTSession.update({
      where: { id },
      data: { clientFeedback },
    });
  }

  async updateSessionStatus(id: string, status: string, notes?: string) {
    const session = await this.prisma.pTSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');

    const data: any = { status };
    if (notes !== undefined) data.notes = notes;

    return this.prisma.pTSession.update({
      where: { id },
      data,
    });
  }

  async completeSession(sessionId: string, dto: CompleteSessionDto) {
    const session = await this.prisma.pTSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const updatedSession = await this.prisma.pTSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        duration: dto.duration,
        exercisesCompleted: dto.exercisesCompleted,
        intensity: dto.intensity,
        clientFeedback: dto.clientFeedback,
        signatureUrl: dto.signatureUrl,
      },
    });

    const activePackage = await this.prisma.memberPTPackage.findFirst({
      where: {
        memberId: session.memberId,
        status: 'ACTIVE',
      },
      include: {
        package: true,
      },
      orderBy: {
        expiryDate: 'asc',
      }
    });

    if (activePackage && activePackage.sessionsRemaining > 0) {
      const remaining = activePackage.sessionsRemaining - 1;
      const packageStatus = remaining === 0 ? 'EXHAUSTED' : 'ACTIVE';

      await this.prisma.memberPTPackage.update({
        where: { id: activePackage.id },
        data: {
          sessionsRemaining: remaining,
          status: packageStatus,
        },
      });

      const trainer = await this.prisma.employee.findUnique({
        where: { id: session.trainerId },
        include: { payrollStructure: true },
      });

      if (trainer && trainer.payrollStructure && trainer.payrollStructure.ptCommissionPercentage > 0) {
        const commissionAmount = (activePackage.package.price / activePackage.sessionsTotal) * (trainer.payrollStructure.ptCommissionPercentage / 100);

        const now = new Date();
        await this.prisma.trainerCommission.create({
          data: {
            trainerId: session.trainerId,
            sourceId: session.id,
            amount: commissionAmount,
            status: 'PENDING',
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        });
      }
    }

    return updatedSession;
  }

  async getTrainerStats(userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found for this user');

    const sessions = await this.prisma.pTSession.findMany({
      where: { trainerId: employee.id },
    });

    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const cancelledSessions = sessions.filter(s => s.status === 'CANCELLED' || s.status === 'NO_SHOW').length;
    const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED' && new Date(s.date) >= new Date()).length;
    const totalClients = new Set(sessions.map(s => s.memberId)).size;

    const now = new Date();
    const sessionsThisMonth = sessions.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const commissions = await this.prisma.trainerCommission.findMany({
      where: { trainerId: employee.id },
    });

    const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);

    const noShowSessions = cancelledSessions; // assuming NO_SHOW is part of cancelled for formula
    const performanceScore = (completedSessions + noShowSessions) > 0 
      ? (completedSessions / (completedSessions + noShowSessions)) * 100 
      : 0;

    return {
      completedSessions,
      cancelledSessions,
      upcomingSessions,
      totalClients,
      totalEarnings,
      performanceScore,
      sessionsThisMonth
    };
  }

  private readonly PT_SLOT_MINUTES = 85; // 1 hour 25 minutes per session

  private toMinutes(hhmm: string): number {
    const [h, m] = (hhmm || '00:00').split(':').map((n) => parseInt(n, 10) || 0);
    return h * 60 + m;
  }

  private addMinutesToTime(hhmm: string, mins = this.PT_SLOT_MINUTES): string {
    const total = (this.toMinutes(hhmm) + mins) % (24 * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private slotsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
    const a1 = this.toMinutes(aStart);
    const a2 = this.toMinutes(aEnd);
    const b1 = this.toMinutes(bStart);
    const b2 = this.toMinutes(bEnd);
    return a1 < b2 && b1 < a2;
  }

  private getDayRange(date = new Date()) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    return { startOfDay, endOfDay };
  }

  private getMonthRange(monthStr?: string) {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
      const [y, m] = monthStr.split('-').map((n) => parseInt(n, 10));
      if (y > 2000 && m >= 1 && m <= 12) {
        year = y;
        month = m;
      }
    }
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    return {
      year,
      month,
      monthKey: `${year}-${String(month).padStart(2, '0')}`,
      startOfMonth,
      endOfMonth,
    };
  }

  async getTrainerDashboard(userId: string, query?: { trainerId?: string; month?: string }) {
    const employee = query?.trainerId
      ? await this.prisma.employee.findUnique({ where: { id: query.trainerId }, include: { payrollStructure: true } })
      : await this.prisma.employee.findUnique({ where: { userId }, include: { payrollStructure: true } });
    if (!employee) throw new NotFoundException('Trainer employee profile not found');

    const { startOfDay, endOfDay } = this.getDayRange();
    const { year, month, monthKey, startOfMonth, endOfMonth } = this.getMonthRange(query?.month);

    const [todayAttendance, activeAssignments, todaySessions, monthSessions, monthAttendance, commissions] =
      await Promise.all([
        this.prisma.attendance.findFirst({
          where: {
            employeeId: employee.id,
            date: { gte: startOfDay, lte: endOfDay },
          },
        }),
        this.prisma.memberPTPackage.findMany({
          where: { trainerId: employee.id, status: 'ACTIVE' },
          include: { member: true, package: true },
          orderBy: [{ preferredSlotStart: 'asc' }, { createdAt: 'desc' }],
        }),
        this.prisma.pTSession.findMany({
          where: {
            trainerId: employee.id,
            date: { gte: startOfDay, lte: endOfDay },
            status: 'COMPLETED',
          },
        }),
        this.prisma.pTSession.findMany({
          where: {
            trainerId: employee.id,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          include: { member: true },
          orderBy: { date: 'desc' },
        }),
        this.prisma.attendance.findMany({
          where: {
            employeeId: employee.id,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          orderBy: { date: 'desc' },
        }),
        this.prisma.trainerCommission.findMany({
          where: {
            trainerId: employee.id,
            month,
            year,
          },
        }),
      ]);

    const todaySessionByMember = new Map<string, (typeof todaySessions)[number]>();
    for (const s of todaySessions) {
      if (!todaySessionByMember.has(s.memberId)) {
        todaySessionByMember.set(s.memberId, s);
      }
    }

    const assignedClients = activeAssignments.map((a) => {
      const doneSession = todaySessionByMember.get(a.memberId);
      const slotStart = a.preferredSlotStart || doneSession?.startTime || null;
      const slotEnd = a.preferredSlotEnd || (slotStart ? this.addMinutesToTime(slotStart) : null);
      return {
        assignmentId: a.id,
        memberId: a.memberId,
        memberCode: a.member.memberId,
        memberName: `${a.member.firstName} ${a.member.lastName}`.trim(),
        mobile: a.member.mobile,
        packageName: a.package.name,
        sessionsTotal: a.sessionsTotal,
        sessionsRemaining: a.sessionsRemaining,
        slotStart,
        slotEnd,
        slotLocked: Boolean(a.slotLocked),
        todayDone: Boolean(doneSession),
        todaySessionId: doneSession?.id || null,
      };
    });

    const completedSessions = monthSessions.filter((s) => s.status === 'COMPLETED');
    const missedSessions = monthSessions.filter((s) => s.status === 'CANCELLED' || s.status === 'NO_SHOW');

    let revenueGenerated = 0;
    const clientMap = new Map<
      string,
      { memberId: string; memberCode: string; memberName: string; sessionsCount: number; totalMinutes: number; dates: string[] }
    >();

    for (const session of completedSessions) {
      const dur = session.duration || this.PT_SLOT_MINUTES;
      const existing = clientMap.get(session.memberId);
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      if (existing) {
        existing.sessionsCount += 1;
        existing.totalMinutes += dur;
        existing.dates.push(dateStr);
      } else {
        clientMap.set(session.memberId, {
          memberId: session.memberId,
          memberCode: session.member?.memberId || '',
          memberName: session.member
            ? `${session.member.firstName} ${session.member.lastName}`.trim()
            : 'Unknown',
          sessionsCount: 1,
          totalMinutes: dur,
          dates: [dateStr],
        });
      }

      const activePackage = await this.prisma.memberPTPackage.findFirst({
        where: { memberId: session.memberId },
        include: { package: true },
        orderBy: { createdAt: 'desc' },
      });
      if (activePackage && activePackage.sessionsTotal > 0) {
        revenueGenerated += activePackage.package.price / activePackage.sessionsTotal;
      }
    }

    const commissionEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
    const daysPresent = monthAttendance.filter(
      (a) => a.clockIn !== null || a.status === 'PRESENT' || a.status === 'HALF_DAY',
    ).length;
    const totalWorkedHours = Number(
      monthAttendance.reduce((sum, a) => sum + (a.workingHours || 0), 0).toFixed(2),
    );
    const totalTrainingMinutes = completedSessions.reduce(
      (sum, s) => sum + (s.duration || this.PT_SLOT_MINUTES),
      0,
    );

    return {
      trainer: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        email: employee.email,
      },
      todayAttendance: todayAttendance
        ? {
            id: todayAttendance.id,
            date: todayAttendance.date,
            clockIn: todayAttendance.clockIn,
            clockOut: todayAttendance.clockOut,
            workingHours: todayAttendance.workingHours,
            status: todayAttendance.status,
          }
        : null,
      assignedClients,
      completedSessions: completedSessions.length,
      missedSessions: missedSessions.length,
      revenueGenerated,
      commissionEarned,
      monthlyReport: {
        month: monthKey,
        daysPresent,
        totalWorkedHours,
        completedSessions: completedSessions.length,
        totalTrainingMinutes,
        totalTrainingHours: Number((totalTrainingMinutes / 60).toFixed(2)),
        clientBreakdown: Array.from(clientMap.values()),
        attendanceLog: monthAttendance.map((a) => ({
          id: a.id,
          date: a.date,
          clockIn: a.clockIn,
          clockOut: a.clockOut,
          workingHours: a.workingHours,
          status: a.status,
        })),
      },
    };
  }

  async toggleTodayDone(
    userId: string,
    body: { memberId: string; done: boolean; startTime?: string; notes?: string; trainerId?: string },
  ) {
    const employee = body.trainerId
      ? await this.prisma.employee.findUnique({ where: { id: body.trainerId } })
      : await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Trainer employee profile not found');

    const { startOfDay, endOfDay } = this.getDayRange();

    const activePkg = await this.prisma.memberPTPackage.findFirst({
      where: { memberId: body.memberId, trainerId: employee.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    if (body.done) {
      const existing = await this.prisma.pTSession.findFirst({
        where: {
          trainerId: employee.id,
          memberId: body.memberId,
          date: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED',
        },
      });
      if (existing) {
        return { done: true, alreadyDone: true, session: existing };
      }

      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const startTime = body.startTime || activePkg?.preferredSlotStart || currentHHMM;
      const endTime = this.addMinutesToTime(startTime, this.PT_SLOT_MINUTES);

      const session = await this.prisma.pTSession.create({
        data: {
          trainerId: employee.id,
          memberId: body.memberId,
          date: now,
          startTime,
          endTime,
          duration: this.PT_SLOT_MINUTES,
          status: 'COMPLETED',
          notes: body.notes || 'Daily PT session completed (1h 25m)',
        },
      });

      if (activePkg && activePkg.sessionsRemaining > 0) {
        const remaining = activePkg.sessionsRemaining - 1;
        await this.prisma.memberPTPackage.update({
          where: { id: activePkg.id },
          data: {
            sessionsRemaining: remaining,
            status: remaining <= 0 ? 'EXHAUSTED' : 'ACTIVE',
          },
        });
      }

      return { done: true, session };
    } else {
      const existing = await this.prisma.pTSession.findFirst({
        where: {
          trainerId: employee.id,
          memberId: body.memberId,
          date: { gte: startOfDay, lte: endOfDay },
          status: 'COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        await this.prisma.pTSession.delete({ where: { id: existing.id } });
        const pkgToRestore =
          activePkg ||
          (await this.prisma.memberPTPackage.findFirst({
            where: { memberId: body.memberId, trainerId: employee.id },
            orderBy: { createdAt: 'desc' },
          }));
        if (pkgToRestore && pkgToRestore.sessionsRemaining < pkgToRestore.sessionsTotal) {
          await this.prisma.memberPTPackage.update({
            where: { id: pkgToRestore.id },
            data: {
              sessionsRemaining: pkgToRestore.sessionsRemaining + 1,
              status: 'ACTIVE',
            },
          });
        }
      }

      return { done: false };
    }
  }

  async updateAssignmentSlot(
    assignmentId: string,
    preferredSlotStart: string | null,
    roles: string[] = [],
  ) {
    const existing = await this.prisma.memberPTPackage.findUnique({ where: { id: assignmentId } });
    if (!existing) throw new NotFoundException('PT assignment not found');

    const canOverrideLock =
      roles.includes('OWNER') || roles.includes('MANAGER') || roles.includes('RECEPTION');
    if (existing.slotLocked && !canOverrideLock) {
      throw new ForbiddenException('This time slot is locked by Admin and cannot be modified by Trainer');
    }

    if (!preferredSlotStart) {
      return this.prisma.memberPTPackage.update({
        where: { id: assignmentId },
        data: { preferredSlotStart: null, preferredSlotEnd: null },
      });
    }

    const preferredSlotEnd = this.addMinutesToTime(preferredSlotStart, this.PT_SLOT_MINUTES);

    if (existing.trainerId) {
      const siblings = await this.prisma.memberPTPackage.findMany({
        where: {
          trainerId: existing.trainerId,
          status: 'ACTIVE',
          id: { not: assignmentId },
          preferredSlotStart: { not: null },
        },
        include: { member: true },
      });
      for (const s of siblings) {
        const sEnd = s.preferredSlotEnd || this.addMinutesToTime(s.preferredSlotStart!);
        if (this.slotsOverlap(preferredSlotStart, preferredSlotEnd, s.preferredSlotStart!, sEnd)) {
          throw new ConflictException(
            `Time slot ${preferredSlotStart} - ${preferredSlotEnd} overlaps with ${s.member.firstName} (${s.preferredSlotStart} - ${sEnd})`,
          );
        }
      }
    }

    return this.prisma.memberPTPackage.update({
      where: { id: assignmentId },
      data: { preferredSlotStart, preferredSlotEnd },
      include: { member: true, package: true, trainer: true },
    });
  }

  async getMonthlyPtReport(userId: string, roles: string[], query: { month?: string; trainerId?: string }) {
    const { year, month, monthKey, startOfMonth, endOfMonth } = this.getMonthRange(query.month);
    const isOwnerOrManager = roles.includes('OWNER') || roles.includes('MANAGER');

    let trainers: any[] = [];
    if (!isOwnerOrManager) {
      const emp = await this.prisma.employee.findUnique({ where: { userId } });
      if (!emp) throw new NotFoundException('Trainer employee profile not found');
      trainers = [emp];
    } else if (query.trainerId) {
      const emp = await this.prisma.employee.findUnique({ where: { id: query.trainerId } });
      if (!emp) throw new NotFoundException('Trainer not found');
      trainers = [emp];
    } else {
      trainers = await this.getTrainers();
    }

    const reports = await Promise.all(
      trainers.map(async (t) => {
        const [activeClientsCount, sessions, attendance, commissions] = await Promise.all([
          this.prisma.memberPTPackage.count({ where: { trainerId: t.id, status: 'ACTIVE' } }),
          this.prisma.pTSession.findMany({
            where: {
              trainerId: t.id,
              status: 'COMPLETED',
              date: { gte: startOfMonth, lte: endOfMonth },
            },
            include: { member: true },
            orderBy: { date: 'desc' },
          }),
          this.prisma.attendance.findMany({
            where: {
              employeeId: t.id,
              date: { gte: startOfMonth, lte: endOfMonth },
            },
            orderBy: { date: 'desc' },
          }),
          this.prisma.trainerCommission.findMany({
            where: { trainerId: t.id, month, year },
          }),
        ]);

        const clientMap = new Map<
          string,
          { memberId: string; memberCode: string; memberName: string; sessionsCount: number; totalMinutes: number; dates: string[] }
        >();
        for (const s of sessions) {
          const dur = s.duration || this.PT_SLOT_MINUTES;
          const dateStr = new Date(s.date).toISOString().split('T')[0];
          const prev = clientMap.get(s.memberId);
          if (prev) {
            prev.sessionsCount += 1;
            prev.totalMinutes += dur;
            prev.dates.push(dateStr);
          } else {
            clientMap.set(s.memberId, {
              memberId: s.memberId,
              memberCode: s.member?.memberId || '',
              memberName: s.member ? `${s.member.firstName} ${s.member.lastName}`.trim() : 'Unknown',
              sessionsCount: 1,
              totalMinutes: dur,
              dates: [dateStr],
            });
          }
        }

        const daysPresent = attendance.filter(
          (a) => a.clockIn !== null || a.status === 'PRESENT' || a.status === 'HALF_DAY',
        ).length;
        const totalWorkedHours = Number(
          attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0).toFixed(2),
        );
        const totalTrainingMinutes = sessions.reduce(
          (sum, s) => sum + (s.duration || this.PT_SLOT_MINUTES),
          0,
        );

        return {
          trainerId: t.id,
          employeeCode: t.employeeId,
          trainerName: `${t.firstName} ${t.lastName}`.trim(),
          email: t.email,
          mobile: t.mobile,
          assignedClientsCount: activeClientsCount,
          daysPresent,
          totalWorkedHours,
          completedSessions: sessions.length,
          totalTrainingMinutes,
          totalTrainingHours: Number((totalTrainingMinutes / 60).toFixed(2)),
          commissionEarned: commissions.reduce((sum, c) => sum + c.amount, 0),
          clientBreakdown: Array.from(clientMap.values()),
        };
      }),
    );

    return { month: monthKey, reports };
  }

  async toggleSlotLock(assignmentId: string, slotLocked: boolean) {
    const existing = await this.prisma.memberPTPackage.findUnique({ where: { id: assignmentId } });
    if (!existing) throw new NotFoundException('PT assignment not found');
    return this.prisma.memberPTPackage.update({
      where: { id: assignmentId },
      data: { slotLocked: Boolean(slotLocked) },
      include: { member: true, package: true, trainer: true },
    });
  }

  async getAdminDailyActivities(query: { date?: string; trainerId?: string }) {
    const targetDate = query.date ? new Date(`${query.date}T12:00:00`) : new Date();
    const { startOfDay, endOfDay } = this.getDayRange(targetDate);
    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

    const trainers = query.trainerId
      ? await this.prisma.employee.findMany({ where: { id: query.trainerId } })
      : await this.getTrainers();

    const trainerIds = trainers.map((t) => t.id);

    const [attendances, sessions, activeAssignments] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          employeeId: { in: trainerIds },
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: { employee: true },
      }),
      this.prisma.pTSession.findMany({
        where: {
          trainerId: { in: trainerIds },
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: {
          trainer: true,
          member: true,
        },
        orderBy: [{ startTime: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.memberPTPackage.findMany({
        where: {
          trainerId: { in: trainerIds },
          status: 'ACTIVE',
        },
      }),
    ]);

    const attByTrainer = new Map(attendances.map((a) => [a.employeeId, a]));
    const clientsCountByTrainer = new Map<string, number>();
    for (const a of activeAssignments) {
      if (a.trainerId) {
        clientsCountByTrainer.set(a.trainerId, (clientsCountByTrainer.get(a.trainerId) || 0) + 1);
      }
    }

    const sessionsByTrainer = new Map<string, number>();
    for (const s of sessions) {
      if (s.status === 'COMPLETED') {
        sessionsByTrainer.set(s.trainerId, (sessionsByTrainer.get(s.trainerId) || 0) + 1);
      }
    }

    const trainerSummary = trainers.map((t) => {
      const att = attByTrainer.get(t.id);
      return {
        trainerId: t.id,
        employeeCode: t.employeeId,
        trainerName: `${t.firstName} ${t.lastName}`.trim(),
        mobile: t.mobile,
        activeClients: clientsCountByTrainer.get(t.id) || 0,
        sessionsCompletedToday: sessionsByTrainer.get(t.id) || 0,
        clockIn: att?.clockIn || null,
        clockOut: att?.clockOut || null,
        workingHours: att?.workingHours || 0,
        attendanceStatus: att?.clockOut
          ? 'CHECKED_OUT'
          : att?.clockIn
            ? 'CHECKED_IN'
            : 'NOT_CHECKED_IN',
      };
    });

    const activityLogs = sessions.map((s) => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration || this.PT_SLOT_MINUTES,
      status: s.status,
      notes: s.notes,
      trainerId: s.trainerId,
      trainerName: s.trainer ? `${s.trainer.firstName} ${s.trainer.lastName}`.trim() : 'Unknown',
      trainerCode: s.trainer?.employeeId || '',
      memberId: s.memberId,
      memberName: s.member ? `${s.member.firstName} ${s.member.lastName}`.trim() : 'Unknown',
      memberCode: s.member?.memberId || '',
    }));

    return {
      date: dateKey,
      trainerSummary,
      activityLogs,
    };
  }

  async getMemberProfile(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        fitnessAssessment: true,
      }
    });
    if (!member) throw new NotFoundException('Member not found');

    const ptPackages = await this.prisma.memberPTPackage.findMany({
      where: { memberId },
      include: { package: true, trainer: true },
      orderBy: { createdAt: 'desc' },
    });

    const fitnessPlans = await this.prisma.fitnessPlan.findMany({
      where: { memberId },
      include: { trainer: true },
      orderBy: { createdAt: 'desc' },
    });

    const measurements = await this.prisma.memberMeasurement.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const progressPhotos = await this.prisma.progressPhoto.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
    });

    const ptSessions = await this.prisma.pTSession.findMany({
      where: { memberId },
      include: { trainer: true },
      orderBy: { date: 'desc' },
    });

    return {
      member,
      ptPackages,
      fitnessPlans,
      measurements,
      fitnessAssessment: member.fitnessAssessment,
      progressPhotos,
      ptSessions,
    };
  }

  async getMemberProgress(memberId: string) {
    const latestAssessment = await this.prisma.memberFitnessAssessment.findUnique({
      where: { memberId },
    });

    const measurements = await this.prisma.memberMeasurement.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
    });

    const sessionHistory = await this.prisma.pTSession.findMany({
      where: { memberId },
      include: { trainer: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { date: 'desc' },
    });

    const activePlans = await this.prisma.fitnessPlan.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });

    const progressPhotos = await this.prisma.clientProgressPhoto.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
    });

    return {
      latestAssessment,
      measurements,
      sessionHistory,
      activePlans,
      progressPhotos,
    };
  }

  async addMeasurement(memberId: string, dto: CreateMeasurementDto) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    
    return this.prisma.memberMeasurement.create({
      data: {
        memberId,
        ...dto
      },
    });
  }

  async addProgressPhoto(memberId: string, photoUrl: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    
    return this.prisma.clientProgressPhoto.create({
      data: {
        memberId,
        photoUrl,
      },
    });
  }

  async getCommission(trainerId: string) {
    const commissions = await this.prisma.trainerCommission.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'desc' },
    });
    
    const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
    const totalPending = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = commissions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0);
    
    return {
      commissions,
      summary: {
        totalEarned,
        totalPending,
        totalPaid,
      }
    };
  }

  async getMyCommission(userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found');
    return this.getCommission(employee.id);
  }

  async createCommission(dto: CreateCommissionDto) {
    const trainer = await this.prisma.employee.findUnique({ where: { id: dto.trainerId } });
    if (!trainer) throw new NotFoundException('Trainer not found');
    
    return this.prisma.trainerCommission.create({
      data: {
        trainerId: dto.trainerId,
        sourceId: dto.sourceId,
        amount: dto.amount,
        status: 'PENDING',
      },
    });
  }

  async getLeaderboard() {
    const trainers = await this.prisma.employee.findMany({
      where: {
        ptSessions: { some: {} }
      },
      include: {
        ptSessions: true,
        commissions: true,
      }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const leaderboard = await Promise.all(trainers.map(async trainer => {
      const completedThisMonth = trainer.ptSessions.filter(s => {
        const d = new Date(s.date);
        return s.status === 'COMPLETED' && d >= startOfMonth && d <= endOfMonth;
      });
      
      let revenueGenerated = 0;
      for (const session of completedThisMonth) {
        const activePackage = await this.prisma.memberPTPackage.findFirst({
          where: { memberId: session.memberId },
          include: { package: true },
          orderBy: { createdAt: 'desc' },
        });
        if (activePackage && activePackage.sessionsTotal > 0) {
          revenueGenerated += (activePackage.package.price / activePackage.sessionsTotal);
        }
      }
      
      const clientCount = new Set(trainer.ptSessions.map(s => s.memberId)).size;
      
      return {
        id: trainer.id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        profilePicture: trainer.profilePicture,
        completedSessionsThisMonth: completedThisMonth.length,
        revenueGenerated,
        clientCount,
      };
    }));
    
    return leaderboard
      .sort((a, b) => {
        if (b.completedSessionsThisMonth !== a.completedSessionsThisMonth) {
          return b.completedSessionsThisMonth - a.completedSessionsThisMonth;
        }
        if (b.revenueGenerated !== a.revenueGenerated) {
          return b.revenueGenerated - a.revenueGenerated;
        }
        return b.clientCount - a.clientCount;
      })
      .slice(0, 10);
  }

  // ==========================================
  // Dedicated Personal Trainers Hub Endpoints
  // ==========================================

  async getTrainers() {
    const employees = await this.prisma.employee.findMany({
      where: {
        OR: [
          { user: { userRoles: { some: { role: { name: 'TRAINER' } } } } },
          { designation: { name: { contains: 'Trainer', mode: 'insensitive' } } },
          { memberPtPackages: { some: {} } },
          { ptSessions: { some: {} } },
        ],
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        profilePicture: true,
        status: true,
        designation: { select: { name: true } },
        payrollStructure: { select: { baseSalary: true, ptCommissionPercentage: true } },
        memberPtPackages: { where: { status: 'ACTIVE' }, select: { memberId: true } },
        ptSessions: { select: { status: true } },
        commissions: { select: { amount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees.map((emp) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      mobile: emp.mobile,
      profilePicture: emp.profilePicture,
      status: emp.status,
      designation: emp.designation?.name || 'Personal Trainer',
      baseSalary: emp.payrollStructure?.baseSalary || 0,
      ptCommissionPercentage: emp.payrollStructure?.ptCommissionPercentage || 0,
      activeClients: new Set(emp.memberPtPackages.map((p) => p.memberId)).size,
      activePackages: emp.memberPtPackages.length,
      totalSessions: emp.ptSessions.length,
      completedSessions: emp.ptSessions.filter((s) => s.status === 'COMPLETED').length,
      totalCommissions: emp.commissions.reduce((s, c) => s + Number(c.amount || 0), 0),
    }));
  }

  async createTrainer(data: {
    firstName: string;
    lastName?: string;
    email: string;
    mobile: string;
    password?: string;
    baseSalary?: number;
    ptCommissionPercentage?: number;
    gender?: string;
    profilePicture?: string;
  }) {
    const [existingUser, existingEmp, existingRole, existingTrainers, hashedPassword] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { email: data.email }, select: { id: true } }),
        this.prisma.employee.findFirst({
          where: { OR: [{ email: data.email }, { mobile: data.mobile }] },
          select: { id: true },
        }),
        this.prisma.role.findUnique({ where: { name: 'TRAINER' }, select: { id: true } }),
        this.prisma.employee.findMany({
          where: { employeeId: { startsWith: 'TRN-' } },
          select: { employeeId: true },
        }),
        bcrypt.hash(data.password || 'Password123', 10),
      ]);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }
    if (existingEmp) {
      throw new ConflictException('An employee with this email or mobile already exists');
    }

    const trainerRole =
      existingRole ||
      (await this.prisma.role.create({
        data: { name: 'TRAINER', description: 'Personal Trainer role' },
        select: { id: true },
      }));

    let maxTrn = 0;
    for (const t of existingTrainers) {
      const n = parseInt(t.employeeId.replace('TRN-', ''), 10);
      if (!Number.isNaN(n) && n > maxTrn) maxTrn = n;
    }
    const employeeId = `TRN-${String(maxTrn + 1).padStart(3, '0')}`;
    const fullName = `${data.firstName} ${data.lastName || ''}`.trim();

    // Single atomic nested write (avoids 5s interactive $transaction timeout on remote Neon DB)
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: fullName,
        userRoles: { create: { roleId: trainerRole.id } },
        employee: {
          create: {
            employeeId,
            firstName: data.firstName,
            lastName: data.lastName || '-',
            email: data.email,
            mobile: data.mobile,
            profilePicture: data.profilePicture || null,
            gender: data.gender || null,
            status: 'ACTIVE',
            joiningDate: new Date(),
            payrollStructure: {
              create: {
                baseSalary: Number(data.baseSalary || 0),
                ptCommissionPercentage: Number(data.ptCommissionPercentage || 0),
              },
            },
          },
        },
      },
      include: { employee: true },
    });

    return user.employee;
  }

  async updateTrainer(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile?: string;
      status?: string;
      baseSalary?: number;
      ptCommissionPercentage?: number;
      profilePicture?: string;
    },
  ) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Trainer not found');

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName ?? existing.firstName,
        lastName: data.lastName ?? existing.lastName,
        email: data.email ?? existing.email,
        mobile: data.mobile ?? existing.mobile,
        status: data.status ?? existing.status,
        profilePicture: data.profilePicture !== undefined ? data.profilePicture : existing.profilePicture,
      },
    });

    const ops: Promise<any>[] = [];
    if (existing.userId && (data.firstName || data.lastName || data.email)) {
      ops.push(
        this.prisma.user.update({
          where: { id: existing.userId },
          data: {
            name: `${updated.firstName} ${updated.lastName !== '-' ? updated.lastName : ''}`.trim(),
            email: updated.email,
          },
        }),
      );
    }

    if (data.baseSalary !== undefined || data.ptCommissionPercentage !== undefined) {
      ops.push(
        this.prisma.payrollStructure.upsert({
          where: { employeeId: id },
          update: {
            ...(data.baseSalary !== undefined && { baseSalary: Number(data.baseSalary) }),
            ...(data.ptCommissionPercentage !== undefined && {
              ptCommissionPercentage: Number(data.ptCommissionPercentage),
            }),
          },
          create: {
            employeeId: id,
            baseSalary: Number(data.baseSalary || 0),
            ptCommissionPercentage: Number(data.ptCommissionPercentage || 0),
          },
        }),
      );
    }

    if (ops.length > 0) {
      await Promise.all(ops);
    }

    return updated;
  }

  async deleteTrainer(id: string) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Trainer not found');

    await this.prisma.$transaction([
      this.prisma.memberPTPackage.updateMany({
        where: { trainerId: id },
        data: { trainerId: null },
      }),
      this.prisma.pTSession.deleteMany({ where: { trainerId: id } }),
      this.prisma.employee.delete({ where: { id } }),
      ...(existing.userId
        ? [this.prisma.user.deleteMany({ where: { id: existing.userId } })]
        : []),
    ]);

    return { success: true, message: 'Trainer deleted successfully' };
  }

  async getPtPackages() {
    return this.prisma.pTPackage.findMany({
      include: { _count: { select: { memberPackages: true } } },
      orderBy: { price: 'asc' },
    });
  }

  async createPtPackage(data: { name: string; numberOfSessions: number; price: number }) {
    return this.prisma.pTPackage.create({
      data: {
        name: data.name,
        numberOfSessions: Number(data.numberOfSessions),
        price: Number(data.price),
      },
    });
  }

  async deletePtPackage(id: string) {
    return this.prisma.pTPackage.delete({ where: { id } });
  }

  async getAssignments() {
    return this.prisma.memberPTPackage.findMany({
      include: {
        member: { select: { id: true, memberId: true, firstName: true, lastName: true, mobile: true } },
        package: true,
        trainer: { select: { id: true, employeeId: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignTrainerToMember(data: {
    memberId: string;
    trainerId: string;
    packageId?: string;
    sessionsTotal?: number;
    fee?: number;
    startDate?: string;
    expiryDate?: string;
    createInvoice?: boolean;
    preferredSlotStart?: string;
    slotLocked?: boolean;
    commissionPercentage?: number;
  }) {
    let packageId = data.packageId;
    let sessionsTotal = Number(data.sessionsTotal || 12);
    let fee = Number(data.fee || 0);

    let preferredSlotStart: string | null = data.preferredSlotStart || null;
    let preferredSlotEnd: string | null = preferredSlotStart
      ? this.addMinutesToTime(preferredSlotStart, this.PT_SLOT_MINUTES)
      : null;

    if (preferredSlotStart && preferredSlotEnd) {
      const existingSlots = await this.prisma.memberPTPackage.findMany({
        where: {
          trainerId: data.trainerId,
          status: 'ACTIVE',
          preferredSlotStart: { not: null },
        },
        include: { member: true },
      });
      for (const s of existingSlots) {
        const sEnd = s.preferredSlotEnd || this.addMinutesToTime(s.preferredSlotStart!);
        if (this.slotsOverlap(preferredSlotStart, preferredSlotEnd, s.preferredSlotStart!, sEnd)) {
          throw new ConflictException(
            `Time slot ${preferredSlotStart} - ${preferredSlotEnd} overlaps with ${s.member.firstName} (${s.preferredSlotStart} - ${sEnd})`,
          );
        }
      }
    }

    if (packageId) {
      const pkg = await this.prisma.pTPackage.findUnique({ where: { id: packageId } });
      if (!pkg) throw new NotFoundException('PT Package not found');
      if (!data.sessionsTotal) sessionsTotal = pkg.numberOfSessions;
      if (data.fee === undefined) fee = pkg.price;
    } else {
      // Create or reuse a custom PT package if none selected
      const pkg = await this.prisma.pTPackage.create({
        data: {
          name: `Custom PT (${sessionsTotal} Sessions)`,
          numberOfSessions: sessionsTotal,
          price: fee,
        },
      });
      packageId = pkg.id;
    }

    const start = data.startDate ? new Date(data.startDate) : new Date();
    const expiry = data.expiryDate
      ? new Date(data.expiryDate)
      : new Date(new Date(start).setMonth(start.getMonth() + 1));

    const assignment = await this.prisma.memberPTPackage.create({
      data: {
        memberId: data.memberId,
        trainerId: data.trainerId,
        packageId,
        sessionsTotal,
        sessionsRemaining: sessionsTotal,
        preferredSlotStart,
        preferredSlotEnd,
        slotLocked: Boolean(data.slotLocked),
        startDate: start,
        expiryDate: expiry,
        status: 'ACTIVE',
      },
      include: {
        member: true,
        package: true,
        trainer: true,
      },
    });

    let createdPtInvoice: any = null;
    if (data.createInvoice !== false && fee > 0) {
      const year = new Date().getFullYear();
      const prefix = `INV-${year}-`;
      const last = await this.prisma.invoice.findFirst({
        where: { invoiceNumber: { startsWith: prefix } },
        orderBy: { invoiceNumber: 'desc' },
        select: { invoiceNumber: true },
      });
      const seq = (last?.invoiceNumber ? parseInt(last.invoiceNumber.split('-')[2] || '0', 10) : 0) + 1;
      const invoiceNumber = `${prefix}${String(seq).padStart(4, '0')}`;

      createdPtInvoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          memberId: data.memberId,
          amount: fee,
          gstRate: 0,
          gstAmount: 0,
          cgst: 0,
          sgst: 0,
          totalAmount: fee,
          paidAmount: 0,
          dueDate: start,
          status: 'PENDING',
          notes: `Personal Training: ${assignment.package.name} (${assignment.trainer?.firstName || 'Trainer'})`,
        },
        include: { member: true, plan: true },
      });
    }

    // Auto-calculate trainer commission from explicit commissionPercentage or PayrollStructure
    const payroll = await this.prisma.payrollStructure.findUnique({
      where: { employeeId: data.trainerId },
    });
    const commissionPct =
      data.commissionPercentage !== undefined && data.commissionPercentage !== null
        ? Number(data.commissionPercentage)
        : payroll?.ptCommissionPercentage || 0;
    if (commissionPct > 0 && fee > 0) {
      const commissionAmt = (fee * commissionPct) / 100;
      const now = new Date();
      await this.prisma.trainerCommission.create({
        data: {
          trainerId: data.trainerId,
          sourceId: assignment.id,
          amount: commissionAmt,
          status: 'PENDING',
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      });
    }

    const emailResult = await this.emailService.sendPtAssignmentEmail({
      memberName: `${assignment.member.firstName} ${assignment.member.lastName !== '-' ? assignment.member.lastName : ''}`.trim(),
      memberEmail: assignment.member.email,
      memberCode: assignment.member.memberId,
      trainerName: assignment.trainer
        ? `${assignment.trainer.firstName} ${assignment.trainer.lastName !== '-' ? assignment.trainer.lastName : ''}`.trim()
        : 'Personal Trainer',
      trainerEmail: assignment.trainer?.email,
      trainerMobile: assignment.trainer?.mobile,
      packageName: assignment.package.name,
      sessionsTotal,
      slotStart: preferredSlotStart,
      slotEnd: preferredSlotEnd,
      slotLocked: Boolean(data.slotLocked),
      startDate: start,
      expiryDate: expiry,
    });

    if (createdPtInvoice && createdPtInvoice.member?.email) {
      this.prisma.companySettings
        .findFirst()
        .then((company) => this.pdfService.generateInvoicePdf(createdPtInvoice, company))
        .then((buf) =>
          this.emailService.sendInvoiceEmail(
            createdPtInvoice,
            buf,
            `${createdPtInvoice.invoiceNumber || 'PT-Invoice'}.pdf`,
          ),
        )
        .catch((err) => {
          console.warn('Auto PT invoice PDF email skipped/failed:', err?.message || err);
        });
    }

    return { ...assignment, emailResult };
  }
}
