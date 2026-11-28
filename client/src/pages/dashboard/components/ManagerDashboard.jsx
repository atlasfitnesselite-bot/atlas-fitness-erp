import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, AlertCircle, CheckCircle2, Loader2, Calendar, TrendingUp, Dumbbell, UserPlus, AlertTriangle } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import EmployeeSelfServiceWidget from "@/components/EmployeeSelfServiceWidget"
import api from '../../../lib/api';
import { toast } from "sonner"
import Chart from "react-apexcharts"
import { format, subDays } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function ManagerDashboard() {
  const { user, token } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        
        // Fetch stats
        const dashRes = await api.get('/api/analytics/manager-dashboard', config)
        setDashboardData(dashRes.data || {})
        setRecentActivity(dashRes.data?.recentActivity || [])

        // Fetch trend data for the last 7 days
        const endDate = format(new Date(), 'yyyy-MM-dd')
        const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
        
        try {
          const trendRes = await api.get(`/api/attendance/analytics/trend?startDate=${startDate}&endDate=${endDate}`, config)
          setTrendData(trendRes.data || [])
        } catch (e) {
          console.error("Trend data fetch failed", e)
          setTrendData([])
        }
        
      } catch (error) {
        console.error(error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    
    if (token) fetchData()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const attendanceObj = dashboardData?.teamAttendanceToday || { present: 0, absent: 0, onLeave: 0 }

  const chartOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    colors: ['#10b981'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { 
      categories: trendData.map(d => format(new Date(d.date || new Date()), 'MMM dd')),
      tooltip: { enabled: false }
    },
    yaxis: { min: 0 },
  }
  
  const chartSeries = [{
    name: 'Present',
    data: trendData.map(d => d.present || 0)
  }]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Manager Dashboard</h2>
        <Badge variant="outline" className="bg-card">{format(new Date(), 'EEEE, MMMM do, yyyy')}</Badge>
      </div>

      {dashboardData?.maintenanceAlerts > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm font-medium text-red-800">
              {dashboardData.maintenanceAlerts} Maintenance Alert(s) require your attention
            </p>
          </div>
          <Button onClick={() => navigate('/equipment')} variant="outline" size="sm" className="bg-card text-red-700 border-red-200 hover:bg-red-50">View Alerts</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100 mb-1">Present Today</p>
                <h3 className="text-3xl font-bold">{attendanceObj.present}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-400/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Absent / On Leave</p>
                <h3 className="text-3xl font-bold text-foreground">{attendanceObj.absent} <span className="text-lg text-muted-foreground">/ {attendanceObj.onLeave}</span></h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending Leave Requests</p>
                <h3 className="text-3xl font-bold text-foreground">{dashboardData?.pendingLeaveRequests || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending Shift Requests</p>
                <h3 className="text-3xl font-bold text-foreground">{dashboardData?.pendingShiftRequests || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm flex flex-col justify-center items-center py-6">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{dashboardData?.totalActiveMembers || 0}</h3>
          <p className="text-sm font-medium text-muted-foreground">Active Members</p>
        </Card>

        <Card className="shadow-sm flex flex-col justify-center items-center py-6">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
            <Dumbbell className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{dashboardData?.ptSessionsToday || 0}</h3>
          <p className="text-sm font-medium text-muted-foreground">PT Sessions Today</p>
        </Card>

        <Card className="shadow-sm flex flex-col justify-center items-center py-6">
          <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-3">
            <UserPlus className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{dashboardData?.newMembersThisWeek || 0}</h3>
          <p className="text-sm font-medium text-muted-foreground">New Members (This Week)</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Trend (Last 7 Days)</CardTitle>
            <CardDescription>Number of staff present</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <Chart options={chartOptions} series={chartSeries} type="area" height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time || 'Recently'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                <Clock className="h-8 w-8 text-foreground mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <EmployeeSelfServiceWidget />
    </div>
  )
}

