import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Activity, Users, TrendingUp, IndianRupee, Star, Target } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
    const { user, token } = useAuthStore();
    const { toast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/analytics/business-intelligence', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast({
                title: "Error",
                description: "Failed to load analytics dashboard",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    }

    if (!data) return null;

    const { 
        isOwner, 
        satisfaction, 
        ptConversionRate, 
        trainerPerformanceData, 
        peakHoursData, 
        popularDaysData, 
        clientRetentionData, 
        membershipGrowthData, 
        financialData 
    } = data;

    return (
        <div className="p-6 space-y-6 bg-background min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Business Intelligence</h1>
                <div className="text-sm text-muted-foreground">Data aggregated from all modules</div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Member Satisfaction</p>
                            <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <h2 className="text-3xl font-bold text-foreground">{satisfaction}</h2>
                            <span className="text-sm font-medium text-muted-foreground">/ 5.0</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Based on feedback surveys</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">PT Conversion Rate</p>
                            <Target className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <h2 className="text-3xl font-bold text-foreground">{ptConversionRate}%</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Members with active PT packages</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <h2 className="text-3xl font-bold text-foreground">
                                {clientRetentionData.find(d => d.name === 'Active')?.value || 0}
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Currently active subscriptions</p>
                    </CardContent>
                </Card>

                {isOwner && (
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-sm text-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-green-100">6mo Revenue Trend</p>
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex items-baseline space-x-2">
                                <h2 className="text-3xl font-bold">
                                    ₹{financialData?.revenueData[financialData.revenueData.length - 1]?.revenue?.toLocaleString() || 0}
                                </h2>
                            </div>
                            <p className="text-xs text-green-100 mt-1">This month's revenue</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Financial Charts - OWNER ONLY */}
            {isOwner && financialData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader>
                            <CardTitle>Revenue Over Time (6 Months)</CardTitle>
                            <CardDescription>Monthly invoice totals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={financialData.revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader>
                            <CardTitle>Cafe Profit Trend</CardTitle>
                            <CardDescription>Monthly cafe sales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financialData.cafeProfitData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Profit']} />
                                        <Bar dataKey="profit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Operational & Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card shadow-sm border-border">
                    <CardHeader>
                        <CardTitle>Membership Growth</CardTitle>
                        <CardDescription>New signups and subscription renewals over 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={membershipGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="newMembers" name="New Members" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="newSubs" name="New Subscriptions" stroke="#8b5cf6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-sm border-border">
                    <CardHeader>
                        <CardTitle>Client Retention</CardTitle>
                        <CardDescription>Status of all historical subscriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={clientRetentionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {clientRetentionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance & Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-card shadow-sm border-border lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Peak Hours (Check-Ins)</CardTitle>
                        <CardDescription>Total member check-ins grouped by hour of the day (last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={peakHoursData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12}} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" name="Check-Ins" fill="#ef4444" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-sm border-border">
                    <CardHeader>
                        <CardTitle>Popular Workout Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={popularDaysData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="day" type="category" axisLine={false} tickLine={false} width={80} />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" name="Visits" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Trainer Performance */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-card shadow-sm border-border">
                    <CardHeader>
                        <CardTitle>Trainer Performance</CardTitle>
                        <CardDescription>Total PT sessions completed by trainer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trainerPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <RechartsTooltip />
                                    <Bar dataKey="sessions" name="Completed Sessions" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
