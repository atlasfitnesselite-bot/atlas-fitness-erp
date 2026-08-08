import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocketStore } from '@/store/useSocketStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, IndianRupee, UserCheck, Dumbbell, Coffee, UserPlus, AlertTriangle, Fingerprint, PenTool, Package, Sparkles, Clock, Bell, Cake, Activity } from 'lucide-react';
import Chart from 'react-apexcharts';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    cafeSalesToday: 0,
    totalActiveMembers: 0,
    newAdmissionsToday: 0,
    expiredMemberships: 0,
    memberCheckInsToday: 0,
    totalEmployees: 0,
    staffPresent: 0,
    staffAbsent: 0,
    staffOnLeave: 0,
    ptSessionsToday: 0,
    ptSessionsCompleted: 0,
    pendingTasks: 0,
    maintenanceAlerts: 0,
    lowStockAlerts: 0,
    cleaningPending: 0,
    cleaningCompleted: 0,
    pendingLeaveRequests: 0,
    pendingShiftRequests: 0,
    unreadNotifications: 0,
    todayBirthdays: [],
    activeAssets: 0,
    recentActivity: []
  });

  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [deptDistribution, setDeptDistribution] = useState([]);
  
  const fetchDashboardData = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

      const [dashRes, trendRes, empRes] = await Promise.all([
        api.get('/api/analytics/dashboard').catch(() => ({ data: null })),
        api.get(`/api/attendance/analytics/trend?startDate=${startDate}&endDate=${endDate}`).catch(() => ({ data: [] })),
        api.get('/api/employees').catch(() => ({ data: { data: [] } }))
      ]);

      if (dashRes.data) {
        setData(dashRes.data);
      }
      
      if (trendRes.data) {
        setAttendanceTrend(trendRes.data);
      }

      const emps = empRes.data?.items || empRes.data?.data || empRes.data || [];
      if (Array.isArray(emps) && emps.length > 0) {
        const depts = {};
        emps.forEach(emp => {
          const d = emp.department || 'Other';
          depts[d] = (depts[d] || 0) + 1;
        });
        setDeptDistribution(Object.entries(depts).map(([name, count]) => ({ name, count })));
      } else {
        setDeptDistribution([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleCheckin = () => fetchDashboardData();
    const handleAttendance = () => fetchDashboardData();
    const handleExpense = () => fetchDashboardData();

    socket.on('live_checkin', handleCheckin);
    socket.on('attendance_update', handleAttendance);
    socket.on('new_expense', handleExpense);

    return () => {
      socket.off('live_checkin', handleCheckin);
      socket.off('attendance_update', handleAttendance);
      socket.off('new_expense', handleExpense);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  const past7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const attendanceOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
    colors: ['#dc2626'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { 
      categories: attendanceTrend.length > 0 ? attendanceTrend.map(t => t.date || t.name) : past7Days,
      labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    theme: { mode: 'dark' },
    tooltip: { theme: 'dark' }
  };

  const attendanceSeries = [{
    name: 'Attendance',
    data: attendanceTrend.length > 0 ? attendanceTrend.map(t => t.present ?? t.count ?? 0) : [0, 0, 0, 0, 0, 0, 0]
  }];

  const deptOptions = {
    chart: { type: 'donut', background: 'transparent' },
    labels: deptDistribution.map(d => d.name),
    colors: ['#dc2626', '#0f172a', '#10b981', '#f59e0b', '#6366f1'],
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
    theme: { mode: 'dark' }
  };

  const deptSeries = deptDistribution.map(d => d.count);
  const pendingRequests = data.pendingLeaveRequests + data.pendingShiftRequests;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background min-h-screen text-foreground font-sans">
      
      {/* 1. Welcome Banner */}
      <Card className="bg-gradient-to-r from-card to-primary/20 border-border shadow-xl rounded-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>
        <CardContent className="p-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name || 'Owner'}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="bg-card/50 text-amber-400 border-amber-500/30 px-4 py-2 text-sm backdrop-blur-md">
              {pendingRequests} Pending Requests
            </Badge>
            <Badge variant="outline" className="bg-card/50 text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm backdrop-blur-md">
              {data.unreadNotifications} Notifications
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => navigate('/members/new')} className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:bg-muted hover:border-primary/50 transition-all group">
          <div className="p-3 bg-primary/10 text-primary rounded-full mb-3 group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Add Member</span>
        </button>
        <button onClick={() => navigate('/billing')} className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:bg-muted hover:border-primary/50 transition-all group">
          <div className="p-3 bg-primary/10 text-primary rounded-full mb-3 group-hover:scale-110 transition-transform">
            <IndianRupee className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">New Invoice</span>
        </button>
        <button onClick={() => navigate('/tasks')} className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:bg-muted hover:border-primary/50 transition-all group">
          <div className="p-3 bg-primary/10 text-primary rounded-full mb-3 group-hover:scale-110 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Assign Task</span>
        </button>
        <button onClick={() => navigate('/cafe')} className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:bg-muted hover:border-primary/50 transition-all group">
          <div className="p-3 bg-primary/10 text-primary rounded-full mb-3 group-hover:scale-110 transition-transform">
            <Coffee className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Cafe Order</span>
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-2">₹{data.todayRevenue.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Members</p>
                <h3 className="text-2xl font-bold text-blue-400 mt-2">{data.totalActiveMembers}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Present</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-2">{data.staffPresent} <span className="text-sm text-muted-foreground">/ {data.totalEmployees}</span></h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <UserCheck className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PT Sessions Today</p>
                <h3 className="text-2xl font-bold text-purple-400 mt-2">{data.ptSessionsToday}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Dumbbell className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Operations Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cafe Sales Today</p>
                <h3 className="text-xl font-bold text-orange-400 mt-2">₹{data.cafeSalesToday.toLocaleString()}</h3>
              </div>
              <Coffee className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Admissions</p>
                <h3 className="text-xl font-bold text-cyan-400 mt-2">{data.newAdmissionsToday}</h3>
              </div>
              <UserPlus className="w-5 h-5 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired Memberships</p>
                <h3 className="text-xl font-bold text-red-500 mt-2">{data.expiredMemberships}</h3>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Check-ins</p>
                <h3 className="text-xl font-bold text-indigo-400 mt-2">{data.memberCheckInsToday}</h3>
              </div>
              <Fingerprint className="w-5 h-5 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Alerts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`rounded-xl border transition-colors ${data.maintenanceAlerts > 0 ? 'bg-amber-950/20 border-amber-900/50' : 'bg-card border-border'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${data.maintenanceAlerts > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-muted-foreground'}`}>
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance</p>
                <p className={`text-xs ${data.maintenanceAlerts > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {data.maintenanceAlerts} alerts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-xl border transition-colors ${data.lowStockAlerts > 0 ? 'bg-amber-950/20 border-amber-900/50' : 'bg-card border-border'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${data.lowStockAlerts > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-muted-foreground'}`}>
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Inventory Stock</p>
                <p className={`text-xs ${data.lowStockAlerts > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {data.lowStockAlerts} low items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl transition-colors hover:border-primary/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Cleaning Status</p>
                <p className="text-xs text-muted-foreground">
                  {data.cleaningCompleted} / {data.cleaningPending + data.cleaningCompleted} done
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-xl border transition-colors ${pendingRequests > 0 ? 'bg-amber-950/20 border-amber-900/50' : 'bg-card border-border'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${pendingRequests > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-muted-foreground'}`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Pending Approvals</p>
                <p className={`text-xs ${pendingRequests > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {pendingRequests} requests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Attendance Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Check-ins over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <Chart options={attendanceOptions} series={attendanceSeries} type="area" height="100%" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Staff Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">Employees by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <Chart options={deptOptions} series={deptSeries} type="donut" height="100%" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500" /> Today's Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.todayBirthdays && data.todayBirthdays.length > 0 ? (
              <ul className="space-y-4">
                {data.todayBirthdays.map((bday, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-border">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-bold">
                      {bday.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{bday.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{bday.type}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No birthdays today</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivity.slice(0, 5).map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-slate-950/50 rounded-lg border border-border">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium text-white">{activity.action}</span> on {activity.resource}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
