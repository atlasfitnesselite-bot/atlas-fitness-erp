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
exports.PtService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
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
    async createTrainer(data) {
        const [existingUser, existingEmp, existingRole, existingTrainers, hashedPassword] = await Promise.all([
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
            throw new common_1.ConflictException('A user with this email already exists');
        }
        if (existingEmp) {
            throw new common_1.ConflictException('An employee with this email or mobile already exists');
        }
        const trainerRole = existingRole ||
            (await this.prisma.role.create({
                data: { name: 'TRAINER', description: 'Personal Trainer role' },
                select: { id: true },
            }));
        let maxTrn = 0;
        for (const t of existingTrainers) {
            const n = parseInt(t.employeeId.replace('TRN-', ''), 10);
            if (!Number.isNaN(n) && n > maxTrn)
                maxTrn = n;
        }
        const employeeId = `TRN-${String(maxTrn + 1).padStart(3, '0')}`;
        const fullName = `${data.firstName} ${data.lastName || ''}`.trim();
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
    async updateTrainer(id, data) {
        const existing = await this.prisma.employee.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Trainer not found');
        const updated = await this.prisma.employee.update({
            where: { id },
            data: {
                firstName: data.firstName ?? existing.firstName,
                lastName: data.lastName ?? existing.lastName,
                email: data.email ?? existing.email,
                mobile: data.mobile ?? existing.mobile,
                status: data.status ?? existing.status,
            },
        });
        const ops = [];
        if (existing.userId && (data.firstName || data.lastName || data.email)) {
            ops.push(this.prisma.user.update({
                where: { id: existing.userId },
                data: {
                    name: `${updated.firstName} ${updated.lastName !== '-' ? updated.lastName : ''}`.trim(),
                    email: updated.email,
                },
            }));
        }
        if (data.baseSalary !== undefined || data.ptCommissionPercentage !== undefined) {
            ops.push(this.prisma.payrollStructure.upsert({
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
            }));
        }
        if (ops.length > 0) {
            await Promise.all(ops);
        }
        return updated;
    }
    async deleteTrainer(id) {
        const existing = await this.prisma.employee.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Trainer not found');
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
    async createPtPackage(data) {
        return this.prisma.pTPackage.create({
            data: {
                name: data.name,
                numberOfSessions: Number(data.numberOfSessions),
                price: Number(data.price),
            },
        });
    }
    async deletePtPackage(id) {
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
    async assignTrainerToMember(data) {
        let packageId = data.packageId;
        let sessionsTotal = Number(data.sessionsTotal || 12);
        let fee = Number(data.fee || 0);
        if (packageId) {
            const pkg = await this.prisma.pTPackage.findUnique({ where: { id: packageId } });
            if (!pkg)
                throw new common_1.NotFoundException('PT Package not found');
            if (!data.sessionsTotal)
                sessionsTotal = pkg.numberOfSessions;
            if (data.fee === undefined)
                fee = pkg.price;
        }
        else {
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
            const gstAmount = (fee * 18) / 100;
            await this.prisma.invoice.create({
                data: {
                    invoiceNumber,
                    memberId: data.memberId,
                    amount: fee,
                    gstRate: 18,
                    gstAmount,
                    cgst: gstAmount / 2,
                    sgst: gstAmount / 2,
                    totalAmount: fee + gstAmount,
                    paidAmount: 0,
                    dueDate: start,
                    status: 'PENDING',
                    notes: `Personal Training: ${assignment.package.name} (${assignment.trainer?.firstName || 'Trainer'})`,
                },
            });
        }
        const payroll = await this.prisma.payrollStructure.findUnique({
            where: { employeeId: data.trainerId },
        });
        if (payroll && payroll.ptCommissionPercentage > 0 && fee > 0) {
            const commissionAmt = (fee * payroll.ptCommissionPercentage) / 100;
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
        return assignment;
    }
};
exports.PtService = PtService;
exports.PtService = PtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PtService);
//# sourceMappingURL=pt.service.js.map