import type { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
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
    getComprehensiveReport(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly', date: string): Promise<{
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
    getAuditorReport(timeframe?: string, date?: string, startDate?: string, endDate?: string): Promise<{
        company: {
            name: string;
            gstin: string;
            address: string;
            email: string;
            phone: string;
        };
        period: {
            timeframe: string;
            startDate: Date;
            endDate: Date;
        };
        summary: {
            membershipBase: number;
            membershipDiscount: number;
            membershipTaxable: number;
            cafeTaxable: number;
            totalTaxableRevenue: number;
            totalCgst: number;
            totalSgst: number;
            totalGstLiability: number;
            invLateFee: number;
            totalGrossInvoiced: number;
            totalCollected: number;
            totalReceivable: number;
            operatingExpenses: number;
            payrollExpense: number;
            totalOutflow: number;
            netAccrualProfit: number;
            netCashFlow: number;
        };
        gstBreakdown: {
            b2b: {
                count: number;
                taxable: number;
                cgst: number;
                sgst: number;
                total: number;
            };
            b2c: {
                count: number;
                taxable: number;
                cgst: number;
                sgst: number;
                total: number;
            };
        };
        paymentModes: {
            mode: string;
            count: number;
            amount: number;
        }[];
        invoiceLedger: {
            id: string;
            invoiceNumber: string;
            invoiceDate: Date;
            paidDate: Date | null;
            memberCode: string;
            memberName: string;
            memberGstin: string;
            supplyType: string;
            planName: string;
            base: number;
            discount: number;
            taxable: number;
            gstRate: number;
            cgst: number;
            sgst: number;
            totalGst: number;
            lateFee: number;
            total: number;
            paid: number;
            due: number;
            status: string;
            paymentMethod: string;
            transactionRef: string;
        }[];
        cafeLedger: {
            orderNumber: string;
            date: Date;
            customerName: string;
            taxable: number;
            cgst: number;
            sgst: number;
            total: number;
            paid: number;
            paymentStatus: string;
            paymentMethod: string;
        }[];
        expenseLedger: {
            date: Date;
            category: string;
            description: string;
            amount: number;
        }[];
    }>;
    exportAuditorCsv(res: Response, timeframe?: string, date?: string, startDate?: string, endDate?: string): Promise<void>;
    exportAuditorPdf(res: Response, timeframe?: string, date?: string, startDate?: string, endDate?: string): Promise<void>;
}
