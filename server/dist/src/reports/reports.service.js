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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSalesOverview() {
        const expenses = await this.prisma.expense.aggregate({
            _sum: { amount: true }
        });
        const cafeOrders = await this.prisma.cafeOrder.aggregate({
            _sum: { totalAmount: true }
        });
        const invoices = await this.prisma.invoice.findMany({
            where: { status: 'PAID' },
            include: { subscription: { include: { plan: true } } }
        });
        let totalRevenue = 0;
        let ptSales = 0;
        const planSales = {};
        invoices.forEach(inv => {
            totalRevenue += inv.amount;
            if (inv.subscriptionId && inv.subscription?.plan) {
                const planName = inv.subscription.plan.name;
                planSales[planName] = (planSales[planName] || 0) + inv.amount;
            }
            else {
                ptSales += inv.amount;
            }
        });
        const activeMembersCount = await this.prisma.member.count({ where: { status: 'ACTIVE' } });
        const newMemberships = await this.prisma.memberSubscription.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            }
        });
        const merchandiseSales = cafeOrders._sum.totalAmount || 0;
        totalRevenue += merchandiseSales;
        const avgRevenuePerUser = activeMembersCount > 0 ? Math.round(totalRevenue / activeMembersCount) : 0;
        const trendMap = new Map();
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            trendMap.set(key, 0);
            months.push(monthNames[d.getMonth()]);
        }
        invoices.forEach(inv => {
            const d = new Date(inv.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (trendMap.has(key)) {
                trendMap.set(key, trendMap.get(key) + inv.amount);
            }
        });
        const cafeOrdersList = await this.prisma.cafeOrder.findMany();
        cafeOrdersList.forEach(co => {
            const d = new Date(co.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (trendMap.has(key)) {
                trendMap.set(key, trendMap.get(key) + co.totalAmount);
            }
        });
        const trendData = Array.from(trendMap.values());
        const categories = Object.keys(planSales).map(name => ({
            name,
            val: `$${planSales[name].toLocaleString()}`,
            pct: totalRevenue > 0 ? `${Math.round((planSales[name] / totalRevenue) * 100)}%` : '0%'
        }));
        if (ptSales > 0) {
            categories.push({
                name: 'Personal Training',
                val: `$${ptSales.toLocaleString()}`,
                pct: totalRevenue > 0 ? `${Math.round((ptSales / totalRevenue) * 100)}%` : '0%'
            });
        }
        if (merchandiseSales > 0) {
            categories.push({
                name: 'Merchandise & Cafe',
                val: `$${merchandiseSales.toLocaleString()}`,
                pct: totalRevenue > 0 ? `${Math.round((merchandiseSales / totalRevenue) * 100)}%` : '0%'
            });
        }
        return {
            totalRevenue,
            newMemberships,
            avgRevenuePerUser,
            ptSales,
            merchandiseSales,
            expenses: expenses._sum.amount || 0,
            netIncome: totalRevenue - (expenses._sum.amount || 0),
            trendMonths: months,
            trendData,
            categories
        };
    }
    async generateComprehensiveReport(timeframe, dateString) {
        const targetDate = new Date(dateString);
        let startDate;
        let endDate;
        if (timeframe === 'daily') {
            startDate = new Date(targetDate.setHours(0, 0, 0, 0));
            endDate = new Date(targetDate.setHours(23, 59, 59, 999));
        }
        else if (timeframe === 'weekly') {
            const day = targetDate.getDay();
            const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(targetDate.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        }
        else if (timeframe === 'monthly') {
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        else {
            startDate = new Date(targetDate.getFullYear(), 0, 1);
            endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        }
        const dateFilter = {
            gte: startDate,
            lte: endDate,
        };
        const [invoices, expenses, salarySlips, attendanceRecords, cafeOrders, ptSessions, cleaningTasks, faultReports, newMemberships, activeMembersCount] = await Promise.all([
            this.prisma.invoice.findMany({ where: { status: 'PAID', createdAt: dateFilter } }),
            this.prisma.expense.findMany({ where: { date: dateFilter } }),
            this.prisma.salarySlip.findMany({ where: { createdAt: dateFilter } }),
            this.prisma.attendance.findMany({ where: { date: dateFilter } }),
            this.prisma.cafeOrder.findMany({ where: { createdAt: dateFilter } }),
            this.prisma.pTSession.findMany({ where: { date: dateFilter } }),
            this.prisma.cleaningTask.findMany({ where: { createdAt: dateFilter } }),
            this.prisma.faultReport.findMany({ where: { createdAt: dateFilter } }),
            this.prisma.memberSubscription.count({ where: { startDate: dateFilter } }),
            this.prisma.member.count({ where: { status: 'ACTIVE' } })
        ]);
        const revenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalPayroll = salarySlips.reduce((sum, slip) => sum + slip.netPay, 0);
        const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length;
        const totalAbsent = attendanceRecords.filter(a => a.status === 'ABSENT' || a.status === 'LEAVE').length;
        const cafeRevenue = cafeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const completedPTSessions = ptSessions.filter(s => s.status === 'COMPLETED').length;
        const cancelledPTSessions = ptSessions.filter(s => s.status === 'CANCELLED' || s.status === 'NO_SHOW').length;
        const ptInvoices = invoices.filter(inv => !inv.subscriptionId);
        const ptRevenue = ptInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const completedCleaning = cleaningTasks.filter(t => t.isCompleted).length;
        const totalCleaning = cleaningTasks.length;
        const resolvedFaults = faultReports.filter(f => f.status === 'RESOLVED').length;
        const totalFaults = faultReports.length;
        return {
            timeframe,
            startDate,
            endDate,
            metrics: {
                revenue,
                expenses: totalExpenses,
                payroll: totalPayroll,
                netIncome: revenue + cafeRevenue - totalExpenses - totalPayroll,
                attendance: {
                    present: totalPresent,
                    absent: totalAbsent,
                },
                cafe: {
                    revenue: cafeRevenue,
                    orders: cafeOrders.length,
                },
                pt: {
                    revenue: ptRevenue,
                    completedSessions: completedPTSessions,
                    cancelledSessions: cancelledPTSessions,
                },
                cleaning: {
                    completed: completedCleaning,
                    total: totalCleaning,
                    completionRate: totalCleaning > 0 ? (completedCleaning / totalCleaning) * 100 : 0
                },
                maintenance: {
                    resolved: resolvedFaults,
                    total: totalFaults,
                    resolutionRate: totalFaults > 0 ? (resolvedFaults / totalFaults) * 100 : 0
                },
                members: {
                    new: newMemberships,
                    active: activeMembersCount,
                }
            }
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map