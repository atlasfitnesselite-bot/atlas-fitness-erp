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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const todayMonth = now.getMonth();
            const todayDate = now.getDate();
            const [monthlyRevenueAgg, monthlyExpensesAgg, todayRevenueAgg, cafeSalesTodayAgg] = await Promise.all([
                this.prisma.invoice.aggregate({ where: { status: 'PAID', updatedAt: { gte: startOfMonth, lte: endOfMonth } }, _sum: { amount: true } }),
                this.prisma.expense.aggregate({ where: { date: { gte: startOfMonth, lte: endOfMonth } }, _sum: { amount: true } }),
                this.prisma.invoice.aggregate({ where: { status: 'PAID', updatedAt: { gte: startOfDay, lte: endOfDay } }, _sum: { amount: true } }),
                this.prisma.cafeOrder.aggregate({ where: { createdAt: { gte: startOfDay, lte: endOfDay } }, _sum: { totalAmount: true } }),
            ]);
            const [totalActiveMembers, newAdmissionsToday, expiredMemberships, memberCheckInsToday] = await Promise.all([
                this.prisma.member.count({ where: { status: 'ACTIVE' } }),
                this.prisma.member.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
                this.prisma.memberSubscription.count({ where: { endDate: { lt: now }, status: { not: 'CANCELLED' } } }),
                this.prisma.memberCheckIn.count({ where: { timestamp: { gte: startOfDay, lte: endOfDay } } }),
            ]);
            const [totalEmployees, staffPresent, staffOnLeave, employeesAll, membersAll] = await Promise.all([
                this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
                this.prisma.attendance.count({ where: { date: { gte: startOfDay, lte: endOfDay }, OR: [{ status: 'PRESENT' }, { clockIn: { not: null } }] } }),
                this.prisma.leaveRequest.count({ where: { status: 'APPROVED', fromDate: { lte: endOfDay }, toDate: { gte: startOfDay } } }),
                this.prisma.employee.findMany({ where: { status: 'ACTIVE', dateOfBirth: { not: null } }, select: { firstName: true, lastName: true, dateOfBirth: true } }),
                this.prisma.member.findMany({ where: { status: 'ACTIVE', dateOfBirth: { not: null } }, select: { firstName: true, lastName: true, dateOfBirth: true } }),
            ]);
            const [ptSessionsToday, ptSessionsCompleted, pendingTasks, maintenanceAlerts, cafeItems] = await Promise.all([
                this.prisma.pTSession.count({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
                this.prisma.pTSession.count({ where: { date: { gte: startOfDay, lte: endOfDay }, status: 'COMPLETED' } }),
                this.prisma.maintenanceTicket.count({ where: { status: 'PENDING' } }),
                this.prisma.maintenanceTicket.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
                this.prisma.cafeItem.findMany({ select: { stock: true, minStock: true } }),
            ]);
            const [cleaningPending, cleaningCompleted, pendingLeaveRequests, pendingShiftRequests, unreadNotifications, activeAssets, recentActivity] = await Promise.all([
                this.prisma.cleaningChecklist.count({ where: { status: 'PENDING' } }),
                this.prisma.cleaningChecklist.count({ where: { status: 'COMPLETED' } }),
                this.prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
                this.prisma.shiftRequest.count({ where: { status: 'PENDING' } }),
                this.prisma.notification.count({ where: { status: 'Unread' } }),
                this.prisma.asset.count({ where: { status: { not: 'RETIRED' } } }),
                this.prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { action: true, resource: true, details: true, createdAt: true } }),
            ]);
            const lowStockAlerts = cafeItems.filter((item) => item.stock <= item.minStock).length;
            const todayBirthdays = [
                ...employeesAll
                    .filter((e) => e.dateOfBirth && e.dateOfBirth.getMonth() === todayMonth && e.dateOfBirth.getDate() === todayDate)
                    .map((e) => ({ name: `${e.firstName} ${e.lastName}`, type: 'Employee' })),
                ...membersAll
                    .filter((m) => m.dateOfBirth && m.dateOfBirth.getMonth() === todayMonth && m.dateOfBirth.getDate() === todayDate)
                    .map((m) => ({ name: `${m.firstName} ${m.lastName}`, type: 'Member' })),
            ];
            return {
                todayRevenue: (todayRevenueAgg._sum.amount || 0) + (cafeSalesTodayAgg._sum.totalAmount || 0),
                monthlyRevenue: monthlyRevenueAgg._sum.amount || 0,
                monthlyExpenses: monthlyExpensesAgg._sum.amount || 0,
                cafeSalesToday: cafeSalesTodayAgg._sum.totalAmount || 0,
                totalActiveMembers,
                newAdmissionsToday,
                expiredMemberships,
                memberCheckInsToday,
                totalEmployees,
                staffPresent,
                staffAbsent: totalEmployees - staffPresent,
                staffOnLeave,
                ptSessionsToday,
                ptSessionsCompleted,
                pendingTasks,
                maintenanceAlerts,
                lowStockAlerts,
                cleaningPending,
                cleaningCompleted,
                pendingLeaveRequests,
                pendingShiftRequests,
                unreadNotifications,
                todayBirthdays,
                activeAssets,
                recentActivity,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch dashboard statistics');
        }
    }
    async getManagerDashboardStats() {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            const [totalEmployees, staffPresent, staffOnLeave, pendingLeaveRequests, pendingShiftRequests, totalActiveMembers, ptSessionsToday, newMembersThisWeek, maintenanceAlerts, recentActivity] = await Promise.all([
                this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
                this.prisma.attendance.count({
                    where: {
                        date: { gte: startOfDay, lte: endOfDay },
                        OR: [{ status: 'PRESENT' }, { clockIn: { not: null } }],
                    },
                }),
                this.prisma.leaveRequest.count({
                    where: {
                        status: 'APPROVED',
                        fromDate: { lte: endOfDay },
                        toDate: { gte: startOfDay },
                    },
                }),
                this.prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
                this.prisma.shiftRequest.count({ where: { status: 'PENDING' } }),
                this.prisma.member.count({ where: { status: 'ACTIVE' } }),
                this.prisma.pTSession.count({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
                this.prisma.member.count({ where: { createdAt: { gte: startOfWeek } } }),
                this.prisma.maintenanceTicket.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
                this.prisma.auditLog.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: { action: true, resource: true, details: true, createdAt: true },
                }),
            ]);
            return {
                teamAttendanceToday: {
                    present: staffPresent,
                    absent: totalEmployees - staffPresent,
                    onLeave: staffOnLeave
                },
                pendingLeaveRequests,
                pendingShiftRequests,
                totalActiveMembers,
                ptSessionsToday,
                newMembersThisWeek,
                maintenanceAlerts,
                recentActivity: recentActivity.map(a => ({
                    description: `${a.action} on ${a.resource}`,
                    time: new Date(a.createdAt).toLocaleString(),
                    details: a.details
                })),
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch manager dashboard stats');
        }
    }
    async getTrainerDashboardStats(userId) {
        try {
            const employee = await this.prisma.employee.findUnique({
                where: { userId }
            });
            if (!employee) {
                return {
                    todaysClients: [],
                    upcomingSessions: [],
                    completedSessionsThisMonth: 0,
                    totalEarningsThisMonth: 0,
                    clientCount: 0,
                    attendanceStatus: { clockedIn: false, breakActive: false },
                    recentFeedback: []
                };
            }
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const next7Days = new Date(now);
            next7Days.setDate(now.getDate() + 7);
            const [todaysSessions, upcomingSessionsRecords, completedSessionsThisMonth, earningsAgg, distinctClients, todayAttendance] = await Promise.all([
                this.prisma.pTSession.findMany({
                    where: { trainerId: employee.id, date: { gte: startOfDay, lte: endOfDay } },
                    include: { member: true },
                }),
                this.prisma.pTSession.findMany({
                    where: {
                        trainerId: employee.id,
                        date: { gt: endOfDay, lte: next7Days }
                    },
                    include: { member: true },
                    orderBy: { date: 'asc' }
                }),
                this.prisma.pTSession.count({
                    where: { trainerId: employee.id, status: 'COMPLETED', date: { gte: startOfMonth, lte: endOfMonth } }
                }),
                this.prisma.trainerCommission.aggregate({
                    where: { trainerId: employee.id, createdAt: { gte: startOfMonth, lte: endOfMonth } },
                    _sum: { amount: true }
                }),
                this.prisma.pTSession.findMany({
                    where: { trainerId: employee.id },
                    select: { memberId: true },
                    distinct: ['memberId']
                }),
                this.prisma.attendance.findFirst({
                    where: { employeeId: employee.id, date: { gte: startOfDay, lte: endOfDay } }
                })
            ]);
            return {
                todaysClients: todaysSessions.map(s => ({
                    id: s.id,
                    name: s.member ? `${s.member.firstName} ${s.member.lastName}` : 'Unknown',
                    time: s.startTime,
                    status: s.status
                })),
                upcomingSessions: upcomingSessionsRecords.map(s => ({
                    id: s.id,
                    name: s.member ? `${s.member.firstName} ${s.member.lastName}` : 'Unknown',
                    date: s.date,
                    time: s.startTime,
                    status: s.status
                })),
                completedSessionsThisMonth,
                totalEarningsThisMonth: earningsAgg._sum.amount || 0,
                clientCount: distinctClients.length,
                attendanceStatus: {
                    clockedIn: !!(todayAttendance?.clockIn && !todayAttendance?.clockOut),
                    breakActive: !!(todayAttendance?.breakStart && !todayAttendance?.breakEnd)
                },
                recentFeedback: []
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch trainer dashboard stats');
        }
    }
    async getReceptionDashboardStats() {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const next7Days = new Date(now);
            next7Days.setDate(now.getDate() + 7);
            const [memberCheckInsToday, newRegistrationsToday, upcomingRenewals, todayPaymentsAgg, todayPaymentsCount, visitorsToday, todayClassesRecords] = await Promise.all([
                this.prisma.memberCheckIn.count({ where: { timestamp: { gte: startOfDay, lte: endOfDay } } }),
                this.prisma.member.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
                this.prisma.memberSubscription.count({
                    where: { endDate: { gt: now, lte: next7Days }, status: { not: 'CANCELLED' } }
                }),
                this.prisma.invoice.aggregate({
                    where: { status: 'PAID', updatedAt: { gte: startOfDay, lte: endOfDay } },
                    _sum: { amount: true }
                }),
                this.prisma.invoice.count({
                    where: { status: 'PAID', updatedAt: { gte: startOfDay, lte: endOfDay } }
                }),
                this.prisma.visitorEntry.count({ where: { checkIn: { gte: startOfDay, lte: endOfDay } } }),
                this.prisma.groupClass.findMany({
                    where: { date: { gte: startOfDay, lte: endOfDay } },
                    include: { _count: { select: { bookings: true } } }
                })
            ]);
            return {
                memberCheckInsToday,
                newRegistrationsToday,
                upcomingRenewals,
                todayPayments: {
                    count: todayPaymentsCount,
                    total: todayPaymentsAgg._sum.amount || 0
                },
                visitorsToday,
                todayClasses: todayClassesRecords.map(c => ({
                    id: c.id,
                    name: c.name,
                    time: c.startTime,
                    capacity: c.capacity,
                    booked: c._count.bookings
                })),
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch reception dashboard stats');
        }
    }
    async getBusinessIntelligenceData(role) {
        try {
            const isOwner = role === 'OWNER';
            const now = new Date();
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            const [members, subscriptions, feedbacks, checkIns, ptPackages, ptSessions] = await Promise.all([
                this.prisma.member.findMany({ select: { id: true, createdAt: true } }),
                this.prisma.memberSubscription.findMany({ select: { id: true, status: true, startDate: true, endDate: true } }),
                this.prisma.memberFeedback.findMany({ select: { rating: true } }),
                this.prisma.memberCheckIn.findMany({ where: { timestamp: { gte: sixMonthsAgo } }, select: { timestamp: true } }),
                this.prisma.memberPTPackage.findMany({ select: { memberId: true }, distinct: ['memberId'] }),
                this.prisma.pTSession.findMany({ where: { status: 'COMPLETED' }, include: { trainer: { select: { firstName: true, lastName: true } } } })
            ]);
            const avgSatisfaction = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : "0.0";
            const ptConversionRate = members.length > 0 ? ((ptPackages.length / members.length) * 100).toFixed(1) : "0.0";
            const trainerPerformance = {};
            ptSessions.forEach(s => {
                const name = `${s.trainer?.firstName || 'Unknown'} ${s.trainer?.lastName || ''}`.trim();
                trainerPerformance[name] = (trainerPerformance[name] || 0) + 1;
            });
            const trainerPerformanceData = Object.keys(trainerPerformance).map(name => ({ name, sessions: trainerPerformance[name] }));
            const peakHours = new Array(24).fill(0);
            const popularDays = { 'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0 };
            const daysArr = Object.keys(popularDays);
            checkIns.forEach(c => {
                peakHours[c.timestamp.getHours()]++;
                popularDays[daysArr[c.timestamp.getDay()]]++;
            });
            const peakHoursData = peakHours.map((count, hour) => ({ hour: `${hour}:00`, count }));
            const popularDaysData = Object.keys(popularDays).map(day => ({ day, count: popularDays[day] }));
            const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE').length;
            const expiredSubs = subscriptions.filter(s => s.status === 'EXPIRED').length;
            const cancelledSubs = subscriptions.filter(s => s.status === 'CANCELLED').length;
            const clientRetentionData = [
                { name: 'Active', value: activeSubs },
                { name: 'Expired', value: expiredSubs },
                { name: 'Cancelled', value: cancelledSubs }
            ];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const growthMap = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                growthMap[`${months[d.getMonth()]} ${d.getFullYear()}`] = { name: `${months[d.getMonth()]} ${d.getFullYear()}`, newMembers: 0, newSubs: 0 };
            }
            members.forEach(m => {
                if (m.createdAt >= sixMonthsAgo) {
                    const key = `${months[m.createdAt.getMonth()]} ${m.createdAt.getFullYear()}`;
                    if (growthMap[key])
                        growthMap[key].newMembers++;
                }
            });
            subscriptions.forEach(s => {
                if (s.startDate >= sixMonthsAgo) {
                    const key = `${months[s.startDate.getMonth()]} ${s.startDate.getFullYear()}`;
                    if (growthMap[key])
                        growthMap[key].newSubs++;
                }
            });
            const membershipGrowthData = Object.values(growthMap);
            let financialData = null;
            if (isOwner) {
                const invoices = await this.prisma.invoice.findMany({
                    where: { status: 'PAID', updatedAt: { gte: sixMonthsAgo } },
                    select: { amount: true, updatedAt: true }
                });
                const cafeOrders = await this.prisma.cafeOrder.findMany({
                    where: { createdAt: { gte: sixMonthsAgo } },
                    select: { totalAmount: true, createdAt: true }
                });
                const financialMap = JSON.parse(JSON.stringify(growthMap));
                Object.keys(financialMap).forEach(k => { financialMap[k].revenue = 0; financialMap[k].cafeProfit = 0; });
                invoices.forEach(inv => {
                    const key = `${months[inv.updatedAt.getMonth()]} ${inv.updatedAt.getFullYear()}`;
                    if (financialMap[key])
                        financialMap[key].revenue += inv.amount;
                });
                cafeOrders.forEach(ord => {
                    const key = `${months[ord.createdAt.getMonth()]} ${ord.createdAt.getFullYear()}`;
                    if (financialMap[key])
                        financialMap[key].cafeProfit += ord.totalAmount;
                });
                financialData = {
                    revenueData: Object.values(financialMap).map((d) => ({ name: d.name, revenue: d.revenue })),
                    cafeProfitData: Object.values(financialMap).map((d) => ({ name: d.name, profit: d.cafeProfit }))
                };
            }
            return {
                isOwner,
                satisfaction: avgSatisfaction,
                ptConversionRate,
                trainerPerformanceData,
                peakHoursData,
                popularDaysData,
                clientRetentionData,
                membershipGrowthData,
                financialData
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch business intelligence stats');
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map