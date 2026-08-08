import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Chart from "react-apexcharts"
import {
  Clock, Users, UserX, Calendar, AlertCircle,
  CheckCircle2, ChevronRight, TrendingUp, RotateCcw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API = (path) => `/api${path}`
const token = () => localStorage.getItem("token")

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ShiftDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API("/shifts/dashboard"), { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />)}
      </div>
    </div>
  )

  const distribution = data?.shiftDistribution ?? []
  const chartColors = distribution.map(s => s.color)
  const chartLabels = distribution.map(s => s.name)
  const chartSeries = distribution.map(s => s.count)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of shift schedules and employee assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/shifts/calendar")}>
            <Calendar className="h-4 w-4 mr-2" /> Calendar
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/shifts/list")}>
            Manage Shifts
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Total Shifts" value={data?.totalShifts ?? 0} sub="Configured templates" color="bg-indigo-500" />
        <StatCard icon={Users} label="Assigned" value={data?.assignedEmployees ?? 0} sub="Employees with shifts" color="bg-emerald-500" />
        <StatCard icon={UserX} label="Unassigned" value={data?.unassignedEmployees ?? 0} sub="No active shift" color="bg-red-500" />
        <StatCard icon={AlertCircle} label="Pending Requests" value={data?.pendingRequests ?? 0} sub="Shift change requests" color="bg-amber-500" />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Shift Distribution</CardTitle>
            <CardDescription>Employees per shift type</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {chartSeries.length > 0 ? (
              <Chart
                type="donut"
                width="100%"
                options={{
                  labels: chartLabels,
                  colors: chartColors,
                  legend: { position: "bottom" },
                  dataLabels: { enabled: false },
                  plotOptions: { pie: { donut: { size: "70%" } } },
                  chart: { fontFamily: "Inter, sans-serif" },
                }}
                series={chartSeries}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <RotateCcw className="h-8 w-8 mb-2" />
                <p className="text-sm">No assignments yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent History */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest shift changes</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recentHistory ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No activity yet</p>
              )}
              {(data?.recentHistory ?? []).map((h) => (
                <div key={h.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{h.details}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Create Shift", path: "/shifts/list", icon: Clock, color: "border-indigo-200 hover:bg-indigo-50" },
              { label: "Assign Employees", path: "/shifts/assign", icon: Users, color: "border-emerald-200 hover:bg-emerald-50" },
              { label: "Assignments List", path: "/shifts/assignments/list", icon: Calendar, color: "border-blue-200 hover:bg-blue-50" },
              { label: "View Calendar", path: "/shifts/calendar", icon: Calendar, color: "border-amber-200 hover:bg-amber-50" },
              { label: "Shift Requests", path: "/shifts/requests", icon: AlertCircle, color: "border-red-200 hover:bg-red-50" },
            ].map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${a.color}`}
              >
                <a.icon className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{a.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
