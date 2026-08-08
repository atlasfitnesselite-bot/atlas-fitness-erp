import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import api from "../../lib/api"
import { Activity, Target, Trophy, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TrainerPerformance() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/pt/trainer/stats")
      setStats(res.data)
    } catch (error) {
      console.error("Error fetching stats", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
  }

  if (!stats) {
    return <div className="p-8 text-center text-muted-foreground">Unable to load performance data.</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trainer Performance</h1>
        <p className="text-muted-foreground">Track your PT session metrics, client retention, and overall performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.performanceScore || 0)}%</div>
            <p className="text-xs text-muted-foreground">Based on completion rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions}</div>
            <p className="text-xs text-muted-foreground">Total successful sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Unique clients trained</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelled/No-Show</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelledSessions}</div>
            <p className="text-xs text-muted-foreground">Missed or cancelled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Month's Activity</CardTitle>
            <CardDescription>Sessions scheduled for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6 bg-secondary/20 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{stats.sessionsThisMonth}</div>
                <div className="text-sm text-muted-foreground mt-2">Sessions This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Future sessions booked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6 bg-secondary/20 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{stats.upcomingSessions}</div>
                <div className="text-sm text-muted-foreground mt-2">Upcoming Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
