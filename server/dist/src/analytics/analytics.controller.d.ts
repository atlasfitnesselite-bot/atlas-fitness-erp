import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboardStats(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<{
        todayRevenue: number;
        monthlyRevenue: number;
        monthlyExpenses: number;
        cafeSalesToday: number;
        totalActiveMembers: number;
        newAdmissionsToday: number;
        expiredMemberships: number;
        memberCheckInsToday: number;
        totalEmployees: number;
        staffPresent: number;
        staffAbsent: number;
        staffOnLeave: number;
        ptSessionsToday: number;
        ptSessionsCompleted: number;
        pendingTasks: number;
        maintenanceAlerts: number;
        lowStockAlerts: number;
        cleaningPending: number;
        cleaningCompleted: number;
        pendingLeaveRequests: number;
        pendingShiftRequests: number;
        unreadNotifications: number;
        todayBirthdays: {
            name: string;
            type: string;
        }[];
        activeAssets: number;
        recentActivity: {
            createdAt: Date;
            action: string;
            resource: string;
            details: string | null;
        }[];
    }>;
    getManagerDashboardStats(): Promise<{
        teamAttendanceToday: {
            present: number;
            absent: number;
            onLeave: number;
        };
        pendingLeaveRequests: number;
        pendingShiftRequests: number;
        totalActiveMembers: number;
        ptSessionsToday: number;
        newMembersThisWeek: number;
        maintenanceAlerts: number;
        recentActivity: {
            description: string;
            time: string;
            details: string | null;
        }[];
    }>;
    getTrainerDashboardStats(req: any): Promise<{
        todaysClients: {
            id: string;
            name: string;
            time: string;
            status: string;
        }[];
        upcomingSessions: {
            id: string;
            name: string;
            date: Date;
            time: string;
            status: string;
        }[];
        completedSessionsThisMonth: number;
        totalEarningsThisMonth: number;
        clientCount: number;
        attendanceStatus: {
            clockedIn: boolean;
            breakActive: boolean;
        };
        recentFeedback: never[];
    }>;
    getReceptionDashboardStats(): Promise<{
        memberCheckInsToday: number;
        newRegistrationsToday: number;
        upcomingRenewals: number;
        todayPayments: {
            count: number;
            total: number;
        };
        visitorsToday: number;
        todayClasses: {
            id: string;
            name: string;
            time: string;
            capacity: number;
            booked: number;
        }[];
    }>;
    getBusinessIntelligenceData(req: any): Promise<{
        isOwner: boolean;
        satisfaction: string;
        ptConversionRate: string;
        trainerPerformanceData: {
            name: string;
            sessions: number;
        }[];
        peakHoursData: {
            hour: string;
            count: any;
        }[];
        popularDaysData: {
            day: string;
            count: number;
        }[];
        clientRetentionData: {
            name: string;
            value: number;
        }[];
        membershipGrowthData: unknown[];
        financialData: {
            revenueData: {
                name: any;
                revenue: any;
            }[];
            cafeProfitData: {
                name: any;
                profit: any;
            }[];
        } | null;
    }>;
    submitFeedback(body: {
        memberId: string;
        category: string;
        rating: number;
        comments: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        memberId: string;
        comments: string | null;
        rating: number;
    }>;
}
