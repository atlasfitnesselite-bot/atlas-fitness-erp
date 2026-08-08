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
exports.PtService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PtService = class PtService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSessions() {
        return this.prisma.pTSession.findMany({
            include: {
                trainer: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true } },
                member: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true } },
            },
            orderBy: { date: 'desc' },
        });
    }
    async getSessionsByTrainer(trainerId) {
        return this.prisma.pTSession.findMany({
            where: { trainerId },
            include: {
                member: true,
            },
            orderBy: { date: 'desc' },
        });
    }
    async bookSession(dto) {
        const trainer = await this.prisma.employee.findUnique({
            where: { id: dto.trainerId },
        });
        if (!trainer)
            throw new common_1.NotFoundException('Trainer not found');
        const member = await this.prisma.member.findUnique({
            where: { id: dto.memberId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
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
    async getFitnessPlans(memberId) {
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
    async createFitnessPlan(dto) {
        const trainer = await this.prisma.employee.findUnique({
            where: { id: dto.trainerId },
        });
        if (!trainer)
            throw new common_1.NotFoundException('Trainer not found');
        const member = await this.prisma.member.findUnique({
            where: { id: dto.memberId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
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
    async updateFitnessPlan(id, dto) {
        const plan = await this.prisma.fitnessPlan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Fitness plan not found');
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.content !== undefined) {
            data.content = typeof dto.content === 'string' ? dto.content : JSON.stringify(dto.content);
        }
        if (dto.trainerId !== undefined)
            data.trainerId = dto.trainerId;
        return this.prisma.fitnessPlan.update({
            where: { id },
            data,
        });
    }
    async deleteFitnessPlan(id) {
        const plan = await this.prisma.fitnessPlan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Fitness plan not found');
        return this.prisma.fitnessPlan.delete({
            where: { id },
        });
    }
    async updateSessionNotes(id, notes) {
        return this.prisma.pTSession.update({
            where: { id },
            data: { notes },
        });
    }
    async updateSessionFeedback(id, clientFeedback) {
        return this.prisma.pTSession.update({
            where: { id },
            data: { clientFeedback },
        });
    }
    async updateSessionStatus(id, status, notes) {
        const session = await this.prisma.pTSession.findUnique({ where: { id } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const data = { status };
        if (notes !== undefined)
            data.notes = notes;
        return this.prisma.pTSession.update({
            where: { id },
            data,
        });
    }
    async completeSession(sessionId, dto) {
        const session = await this.prisma.pTSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
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
    async getTrainerStats(userId) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found for this user');
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
        const noShowSessions = cancelledSessions;
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
    async getTrainerDashboard(userId) {
        const employee = await this.prisma.employee.findUnique({ where: { userId }, include: { payrollStructure: true } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const sessions = await this.prisma.pTSession.findMany({
            where: {
                trainerId: employee.id,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                }
            },
        });
        const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
        const missedSessions = sessions.filter(s => s.status === 'CANCELLED' || s.status === 'NO_SHOW');
        let revenueGenerated = 0;
        for (const session of completedSessions) {
            const activePackage = await this.prisma.memberPTPackage.findFirst({
                where: { memberId: session.memberId },
                include: { package: true },
                orderBy: { createdAt: 'desc' },
            });
            if (activePackage && activePackage.sessionsTotal > 0) {
                revenueGenerated += (activePackage.package.price / activePackage.sessionsTotal);
            }
        }
        const commissions = await this.prisma.trainerCommission.findMany({
            where: {
                trainerId: employee.id,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
            },
        });
        const commissionEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
        return {
            completedSessions: completedSessions.length,
            missedSessions: missedSessions.length,
            revenueGenerated,
            commissionEarned,
        };
    }
    async getMemberProfile(memberId) {
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                fitnessAssessment: true,
            }
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
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
    async getMemberProgress(memberId) {
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
    async addMeasurement(memberId, dto) {
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        return this.prisma.memberMeasurement.create({
            data: {
                memberId,
                ...dto
            },
        });
    }
    async addProgressPhoto(memberId, photoUrl) {
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        return this.prisma.clientProgressPhoto.create({
            data: {
                memberId,
                photoUrl,
            },
        });
    }
    async getCommission(trainerId) {
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
    async getMyCommission(userId) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        return this.getCommission(employee.id);
    }
    async createCommission(dto) {
        const trainer = await this.prisma.employee.findUnique({ where: { id: dto.trainerId } });
        if (!trainer)
            throw new common_1.NotFoundException('Trainer not found');
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
        const leaderboard = await Promise.all(trainers.map(async (trainer) => {
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
};
exports.PtService = PtService;
exports.PtService = PtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PtService);
//# sourceMappingURL=pt.service.js.map