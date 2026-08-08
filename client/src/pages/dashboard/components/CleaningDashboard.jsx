import { useEffect, useState } from "react"
import api from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"
import { 
  Loader2, Clock, CheckCircle2, MapPin, 
  AlertCircle, CheckSquare, Square,
  Clock4, LogIn, LogOut, Check
} from "lucide-react"
import MyUpcomingShifts from "./MyUpcomingShifts"

export default function CleaningDashboard() {
  const { user, token } = useAuthStore()
  const [zones, setZones] = useState([])
  const [attendance, setAttendance] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [clocking, setClocking] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(new Set())

  const fetchData = async () => {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      const [zonesRes, attendanceRes] = await Promise.all([
        api.get('/api/facilities/cleaning', { headers }).catch(() => ({ data: { data: [] } })),
        api.get('/api/attendance/me/status', { headers }).catch(() => ({ data: { data: null } }))
      ])

      const fetchedZones = zonesRes.data?.data || zonesRes.data?.items || zonesRes.data || []
      const fetchedAttendance = attendanceRes.data?.data || attendanceRes.data || null

      setZones(Array.isArray(fetchedZones) ? fetchedZones : [])
      setAttendance(fetchedAttendance)
    } catch (error) {
      console.error("Dashboard fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const handleClock = async (action) => {
    try {
      setClocking(true)
      const headers = { Authorization: `Bearer ${token}` }
      
      const statusRes = await api.get('/api/attendance/me/status', { headers }).catch(() => ({ data: null }));
      const currentData = statusRes.data?.data || statusRes.data;
      const currentlyClockedIn = currentData?.status === 'active' || (currentData?.clockIn && !currentData?.clockOut);
      
      if (action === 'clock-in' && currentlyClockedIn) {
        setAttendance(currentData);
        toast.info("You are already clocked in");
        return;
      }
      
      if (action === 'clock-out' && !currentlyClockedIn) {
        setAttendance(currentData);
        toast.info("You are already clocked out");
        return;
      }

      await api.post(`/api/attendance/me/${action}`, {}, { headers })
      
      // Refresh attendance
      const res = await api.get('/api/attendance/me/status', { headers })
      setAttendance(res.data?.data || res.data || null)
      toast.success(`Successfully clocked ${action === 'clock-in' ? 'in' : 'out'}`)
    } catch (error) {
      console.error(`Failed to clock ${action}`, error)
      toast.error(error.response?.data?.message || `Failed to clock ${action}`)
    } finally {
      setClocking(false)
    }
  }

  const toggleTask = async (taskId, currentStatus) => {
    try {
      setTasksLoading(prev => new Set(prev).add(taskId))
      const headers = { Authorization: `Bearer ${token}` }
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      await api.put(`/api/facilities/cleaning/task/${taskId}`, { status: newStatus }, { headers })
      
      setZones(prevZones => 
        prevZones.map(zone => ({
          ...zone,
          tasks: (zone.tasks || []).map(task => {
            if (task._id === taskId || task.id === taskId) {
              return { 
                ...task, 
                status: newStatus, 
                completedAt: newStatus === 'completed' ? new Date().toISOString() : null 
              }
            }
            return task
          })
        }))
      )
    } catch (error) {
      console.error("Failed to update task", error)
    } finally {
      setTasksLoading(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  // Calculate Stats
  const totalZones = zones.length
  const completedZones = zones.filter(z => z.tasks?.length > 0 && z.tasks.every(t => t.status === 'completed')).length
  const pendingZones = totalZones - completedZones
  const completionRate = totalZones > 0 ? Math.round((completedZones / totalZones) * 100) : 0

  const isClockedIn = attendance?.status === 'active' || (attendance?.clockIn && !attendance?.clockOut);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Cleaning Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Staff"}</p>
        </div>
        
        <Card className="flex items-center gap-4 p-4 shadow-sm border-border">
          <div className="flex items-center gap-2">
            <Clock4 className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Attendance Status</p>
              <p className="text-muted-foreground">{isClockedIn ? "Clocked In" : "Clocked Out"}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <Button 
            variant={isClockedIn ? "destructive" : "default"}
            size="sm"
            onClick={() => handleClock(isClockedIn ? 'clock-out' : 'clock-in')}
            disabled={clocking}
            className={!isClockedIn ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            {clocking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {!clocking && isClockedIn ? <LogOut className="h-4 w-4 mr-2" /> : null}
            {!clocking && !isClockedIn ? <LogIn className="h-4 w-4 mr-2" /> : null}
            {isClockedIn ? "Clock Out" : "Clock In"}
          </Button>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalZones}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Zones</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedZones}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Zones</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingZones}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mt-8">Your Cleaning Zones</h3>
        {zones.length === 0 ? (
          <Card className="p-8 text-center bg-background/50">
            <MapPin className="h-10 w-10 text-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No zones assigned</p>
            <p className="text-xs text-muted-foreground mt-1">You do not have any cleaning zones assigned for today.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {zones.map((zone) => {
              const zoneTasks = zone.tasks || [];
              const isCompleted = zoneTasks.length > 0 && zoneTasks.every(t => t.status === 'completed');
              const progress = zoneTasks.length > 0 
                ? Math.round((zoneTasks.filter(t => t.status === 'completed').length / zoneTasks.length) * 100) 
                : 0;

              return (
                <Card key={zone._id || zone.id} className={`overflow-hidden transition-all duration-200 ${isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-border'}`}>
                  <CardHeader className="pb-3 border-b bg-background/50">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-base font-semibold">{zone.name || "Unnamed Zone"}</CardTitle>
                      <Badge variant={isCompleted ? "default" : "secondary"} className={isCompleted ? "bg-emerald-500" : ""}>
                        {isCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {zone.location || "Location not specified"}
                    </CardDescription>
                    
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-red-500'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {zoneTasks.length > 0 ? (
                      <ul className="space-y-3">
                        {zoneTasks.map((task) => {
                          const taskId = task._id || task.id;
                          const isTaskCompleted = task.status === 'completed';
                          const isTaskLoading = tasksLoading.has(taskId);
                          
                          return (
                            <li key={taskId} className="flex items-start gap-3 group">
                              <button
                                disabled={isTaskLoading}
                                onClick={() => toggleTask(taskId, task.status)}
                                className="mt-0.5 focus:outline-none disabled:opacity-50 flex-shrink-0 transition-transform active:scale-95"
                              >
                                {isTaskLoading ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : isTaskCompleted ? (
                                  <CheckSquare className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Square className="h-5 w-5 text-foreground group-hover:text-muted-foreground" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isTaskCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {task.title || task.name}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                                )}
                                {isTaskCompleted && task.completedAt && (
                                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> 
                                    {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No tasks in this zone.</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        <MyUpcomingShifts />
      </div>
    </div>
  )
}
