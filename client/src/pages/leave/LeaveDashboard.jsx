import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react"

export default function LeaveDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingApprovals: 0,
    approvedLeaves: 0,
    employeesOnLeave: 0
  })
  const [myBalances, setMyBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  const fetchStats = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      const [statsRes, balRes] = await Promise.all([
        api.get('/api/leave/dashboard/stats', { headers }).catch(() => ({ data: { totalRequests: 0, pendingApprovals: 0, approvedLeaves: 0, employeesOnLeave: 0 } })),
        api.get('/api/leave/balances', { headers }).catch(() => ({ data: [] }))
      ])
      
      setStats(statsRes.data || { totalRequests: 0, pendingApprovals: 0, approvedLeaves: 0, employeesOnLeave: 0 })
      
      const allBals = balRes.data || []
      setMyBalances(allBals.filter(b => b.employee?.userId === user?.id))
    } catch (error) {
      console.error("Failed to fetch leave stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Dashboard</h1>
        <p className="text-muted-foreground">Overview of employee leave requests and approvals.</p>
      </div>

      {myBalances.length > 0 && user?.role !== 'OWNER' && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-6">
          {myBalances.map(bal => (
            <Card key={bal.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{bal.leaveType?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{bal.remainingBalance} <span className="text-sm font-normal text-muted-foreground">Days Left</span></div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used: {bal.used} / Allocated: {bal.allocated}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting manager action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.approvedLeaves}</div>
            <p className="text-xs text-muted-foreground">Historically approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.employeesOnLeave}</div>
            <p className="text-xs text-muted-foreground">Currently out of office</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
