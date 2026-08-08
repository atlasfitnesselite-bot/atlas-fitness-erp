import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSalesOverview(): Promise<{
        totalRevenue: number;
        newMemberships: number;
        avgRevenuePerUser: number;
        ptSales: number;
        merchandiseSales: number;
        expenses: number;
        netIncome: number;
        trendMonths: string[];
        trendData: any[];
        categories: {
            name: string;
            val: string;
            pct: string;
        }[];
    }>;
    generateComprehensiveReport(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly', dateString: string): Promise<{
        timeframe: "daily" | "weekly" | "monthly" | "yearly";
        startDate: Date;
        endDate: Date;
        metrics: {
            revenue: number;
            expenses: number;
            payroll: number;
            netIncome: number;
            attendance: {
                present: number;
                absent: number;
            };
            cafe: {
                revenue: number;
                orders: number;
            };
            pt: {
                revenue: number;
                completedSessions: number;
                cancelledSessions: number;
            };
            cleaning: {
                completed: number;
                total: number;
                completionRate: number;
            };
            maintenance: {
                resolved: number;
                total: number;
                resolutionRate: number;
            };
            members: {
                new: number;
                active: number;
            };
        };
    }>;
}
