import api from '../../lib/api';
import React, { useState, useEffect } from 'react'
import { BarChart2, PieChart, Activity, TrendingUp, Calendar, Users, Clock } from 'lucide-react'
import Chart from 'react-apexcharts'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'

export default function AttendanceAnalytics() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [trendData, setTrendData] = useState([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [dashboardStats, setDashboardStats] = useState({
    avgWorkingHours: 0,
    attendanceRate: 0,
    lateRate: 0,
    leaveRate: 0
  })

  useEffect(() => {
    fetchAnalytics()
    fetchDashboardStats()
  }, [dateRange, token])

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get(`/api/attendance/analytics/dashboard?date=${dateRange.endDate}`)
      if (res.data) {
        const data = res.data
        const total = data.totalEmployees || 1
        setDashboardStats({
          avgWorkingHours: data.avgWorkingHours || 0,
          attendanceRate: Math.round((data.presentToday / total) * 100) || 0,
          lateRate: Math.round((data.lateCount / total) * 100) || 0,
          leaveRate: Math.round((data.absentToday / total) * 100) || 0
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard stats', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/attendance/analytics/trend?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      if (res.data) {
        const data = res.data
        setTrendData(data)
      } else {
        toast.error('Failed to load analytics')
      }
    } catch (error) {
      toast.error('Error fetching analytics')
    } finally {
      setLoading(false)
    }
  }

  const chartOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
    colors: ['#4f46e5'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: trendData.map(d => d.date) || [], tooltip: { enabled: false } },
    yaxis: { title: { text: 'Present Count' } },
    theme: { mode: 'light' } // Would normally dynamically check dark mode
  }

  const chartSeries = [{
    name: 'Present',
    data: trendData.map(d => d.present) || []
  }]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Attendance Analytics</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Deep dive into enterprise attendance patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            className="px-3 py-2 border rounded-lg bg-card dark:bg-slate-800 dark:border-slate-700 text-foreground dark:text-white"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
          <span className="text-muted-foreground">to</span>
          <input 
            type="date" 
            className="px-3 py-2 border rounded-lg bg-card dark:bg-slate-800 dark:border-slate-700 text-foreground dark:text-white"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Avg Working Hours</p>
                  <h3 className="text-2xl font-bold text-foreground dark:text-white mt-1">{dashboardStats.avgWorkingHours.toFixed(1)} hrs</h3>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Attendance Rate</p>
                  <h3 className="text-2xl font-bold text-foreground dark:text-white mt-1">{dashboardStats.attendanceRate}%</h3>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Late Rate</p>
                  <h3 className="text-2xl font-bold text-foreground dark:text-white mt-1">{dashboardStats.lateRate}%</h3>
                </div>
                <div className="p-2 bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Leave Rate</p>
                  <h3 className="text-2xl font-bold text-foreground dark:text-white mt-1">{dashboardStats.leaveRate}%</h3>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">Attendance Trend</h3>
            <div className="h-80">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
