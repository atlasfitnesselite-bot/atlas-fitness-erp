import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Coffee, 
  Activity,
  Wrench,
  CheckSquare
} from 'lucide-react';
import api from '../../lib/api';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';

export default function ComprehensiveReports() {
  const { token } = useAuthStore();
  const [timeframe, setTimeframe] = useState('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [timeframe, date]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/reports/comprehensive?timeframe=${timeframe}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Failed to fetch comprehensive report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const { metrics, startDate, endDate } = reportData;
    
    const csvContent = [
      ["Report Period", `${format(new Date(startDate), 'PP')} to ${format(new Date(endDate), 'PP')}`],
      [],
      ["Category", "Metric", "Value"],
      ["Financial", "Total Revenue", metrics.revenue],
      ["Financial", "Total Expenses", metrics.expenses],
      ["Financial", "Total Payroll", metrics.payroll],
      ["Financial", "Net Income", metrics.netIncome],
      ["HR & Attendance", "Present Days", metrics.attendance.present],
      ["HR & Attendance", "Absent/Leave Days", metrics.attendance.absent],
      ["Cafe", "Total Sales", metrics.cafe.revenue],
      ["Cafe", "Total Orders", metrics.cafe.orders],
      ["Personal Training", "PT Revenue", metrics.pt.revenue],
      ["Personal Training", "Completed Sessions", metrics.pt.completedSessions],
      ["Personal Training", "Cancelled Sessions", metrics.pt.cancelledSessions],
      ["Operations", "Cleaning Tasks Completed", metrics.cleaning.completed],
      ["Operations", "Total Cleaning Tasks", metrics.cleaning.total],
      ["Operations", "Maintenance Faults Resolved", metrics.maintenance.resolved],
      ["Operations", "Total Faults Reported", metrics.maintenance.total],
      ["Memberships", "New Memberships", metrics.members.new],
      ["Memberships", "Total Active Members", metrics.members.active],
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Atlas_Gym_Report_${timeframe}_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !reportData) {
    return <div className="p-8">Loading Report Data...</div>;
  }

  const m = reportData?.metrics;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comprehensive Reports</h1>
          <p className="text-muted-foreground mt-1">
            {reportData && `Showing data from ${format(new Date(reportData.startDate), 'PP')} to ${format(new Date(reportData.endDate), 'PP')}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[150px]"
          />
          <Button onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {m && (
        <>
          {/* FINANCIAL METRICS */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">?{m.revenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">?{m.expenses.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payroll Processed</CardTitle>
                  <Briefcase className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">?{m.payroll.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-card text-slate-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Net Income</CardTitle>
                  <Activity className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">?{m.netIncome.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* DEPARTMENTS METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Membership & Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" /> Memberships & Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">New Memberships</span>
                  <span className="font-bold">{m.members.new}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-bold">{m.members.active}</span>
                </div>
              </CardContent>
            </Card>

            {/* Personal Training */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-500" /> Personal Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">PT Revenue (Est.)</span>
                  <span className="font-bold">?{m.pt.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed Sessions</span>
                  <span className="font-bold text-green-600">{m.pt.completedSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cancelled/No-Show</span>
                  <span className="font-bold text-red-500">{m.pt.cancelledSessions}</span>
                </div>
              </CardContent>
            </Card>

            {/* Cafe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-amber-600" /> Cafe Sales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cafe Revenue</span>
                  <span className="font-bold">?{m.cafe.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-bold">{m.cafe.orders}</span>
                </div>
              </CardContent>
            </Card>

            {/* Operations - Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-muted-foreground" /> Equipment Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Faults Reported</span>
                  <span className="font-bold">{m.maintenance.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Faults Resolved</span>
                  <span className="font-bold text-green-600">{m.maintenance.resolved}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${m.maintenance.resolutionRate}%`}}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Operations - Cleaning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-sky-500" /> Cleaning Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tasks Completed</span>
                  <span className="font-bold text-green-600">{m.cleaning.completed} / {m.cleaning.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-bold">{m.cleaning.completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
                  <div 
                    className="bg-sky-500 h-2 rounded-full" 
                    style={{width: `${m.cleaning.completionRate}%`}}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-500" /> Staff Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Present Logs</span>
                  <span className="font-bold text-green-600">{m.attendance.present}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Absent/Leave Logs</span>
                  <span className="font-bold text-orange-500">{m.attendance.absent}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  );
}
