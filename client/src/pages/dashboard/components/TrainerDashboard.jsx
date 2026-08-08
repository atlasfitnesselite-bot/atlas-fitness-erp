import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import api from '../../../lib/api';
import { toast } from "sonner"
import { Loader2, Calendar, Clock, User, CheckCircle2, TrendingUp, IndianRupee, LogOut, LogIn, ChevronRight, Activity, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format, isToday, isFuture } from "date-fns"
import MyUpcomingShifts from "./MyUpcomingShifts"

export default function TrainerDashboard() {
  const { user, token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [attendance, setAttendance] = useState({ status: 'NOT_CLOCKED_IN' })
  const [sessions, setSessions] = useState([])

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      
      const [dashRes, attendanceRes, sessionsRes] = await Promise.all([
        api.get('/api/analytics/trainer-dashboard', config).catch(() => ({ data: {} })),
        api.get('/api/attendance/me/status', config).catch(() => ({ data: { status: 'NOT_CLOCKED_IN' } })),
        api.get('/api/pt/sessions', config).catch(() => ({ data: [] }))
      ])

      setDashboardData(dashRes.data || {})
      setAttendance(attendanceRes.data || { status: 'NOT_CLOCKED_IN' })
      
      const allSessions = sessionsRes.data || []
      const mySessions = allSessions.filter(s => s.trainer?.userId === user?.id || s.trainerId === user?.id)
      setSessions(mySessions.sort((a, b) => new Date(a.date) - new Date(b.date)))
      
    } catch (error) {
      console.error(error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchData()
  }, [token, user])

  const handleClockInOut = async (action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await api.post(`/api/attendance/me/${action}`, { device: 'Trainer Dashboard' }, config)
      toast.success(`Successfully ${action === 'clock-in' ? 'clocked in' : action === 'break/start' ? 'started break' : action === 'break/end' ? 'ended break' : 'clocked out'}`)
      fetchData() // Refresh status
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action}`)
    }
  }

  const handleCompleteSession = async (sessionId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await api.put(`/api/pt/sessions/${sessionId}/status`, { status: 'COMPLETED' }, config)
      toast.success("Session marked as completed")
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update session")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  const todaySessions = sessions.filter(s => isToday(new Date(s.date)))
  
  const SessionCard = ({ session }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback className="bg-green-100 text-green-700 font-bold">
            {session.member?.firstName?.[0] || 'C'}{session.member?.lastName?.[0] || ''}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {session.member?.firstName || 'Client'} {session.member?.lastName || ''}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {format(new Date(session.date), 'MMM dd')} • {session.startTime} - {session.endTime}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={session.status === 'COMPLETED' ? 'success' : session.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
          {session.status}
        </Badge>
        {session.status === 'SCHEDULED' && (
          <Button size="sm" onClick={() => handleCompleteSession(session.id)} className="bg-green-600 hover:bg-green-700 h-6 text-xs px-2">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Trainer Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your sessions, track client progress, and view performance.</p>
        </div>

        <Card className="w-full md:w-auto min-w-[350px] shadow-sm">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${attendance?.status === 'CLOCKED_IN' ? 'bg-green-100 text-green-600' : attendance?.status === 'ON_BREAK' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="font-bold text-foreground">
                    {attendance?.status === 'CLOCKED_IN' ? 'Clocked In' : attendance?.status === 'ON_BREAK' ? 'On Break' : 'Clocked Out'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {attendance?.status === 'CLOCKED_IN' ? (
                  <>
                    <Button onClick={() => handleClockInOut('break/start')} variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                      <Coffee className="w-4 h-4 mr-1" /> Break
                    </Button>
                    <Button onClick={() => handleClockInOut('clock-out')} variant="destructive" size="sm">
                      <LogOut className="w-4 h-4 mr-1" /> Out
                    </Button>
                  </>
                ) : attendance?.status === 'ON_BREAK' ? (
                  <Button onClick={() => handleClockInOut('break/end')} variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                    End Break
                  </Button>
                ) : (
                  <Button onClick={() => handleClockInOut('clock-in')} className="bg-green-600 hover:bg-green-700" size="sm">
                    <LogIn className="w-4 h-4 mr-1" /> Clock In
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Upcoming (7 days)</p>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{dashboardData?.upcomingSessions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Completed (Month)</p>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{dashboardData?.completedSessionsThisMonth || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <User className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{dashboardData?.clientCount || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between space-y-0 pb-2 text-green-100">
              <p className="text-sm font-medium">Earnings (Month)</p>
              <IndianRupee className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold">₹{dashboardData?.totalEarningsThisMonth || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Clients</CardTitle>
                  <CardDescription>Your schedule for today</CardDescription>
                </div>
                <Badge variant="outline" className="bg-background">{todaySessions.length} Sessions</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-4">
                {todaySessions.length > 0 ? todaySessions.map(s => <SessionCard key={s.id} session={s} />) : (
                  <div className="text-center p-8 border border-dashed rounded-lg bg-background text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p>No sessions scheduled for today.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Daily Goal</CardTitle>
              <CardDescription>Sessions completed today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative flex items-center justify-center w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="text-slate-100 stroke-current" strokeWidth="12" fill="transparent" />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      className="text-green-500 stroke-current transition-all duration-1000 ease-in-out" 
                      strokeWidth="12" 
                      fill="transparent" 
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * (todaySessions.filter(s => s.status === 'COMPLETED').length / (todaySessions.length || 1)))} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-foreground">{todaySessions.filter(s => s.status === 'COMPLETED').length}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">of {todaySessions.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <MyUpcomingShifts />
        </div>
      </div>
    </div>
  )
}

