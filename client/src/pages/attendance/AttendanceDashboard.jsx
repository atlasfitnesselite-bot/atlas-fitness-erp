import { CustomSelect } from '@/components/ui/custom-select';
import api from '../../lib/api';
import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  Coffee, 
  Search, 
  Settings,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import { useKioskStore } from '@/store/useKioskStore'

export default function AttendanceDashboard() {
  const { token } = useAuthStore()
  const { setSession } = useKioskStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    onBreak: 0,
    halfDay: 0,
    attendancePercentage: 0,
    items: []
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const handleLaunchKiosk = async () => {
    try {
      // Create a unique device code if not exists
      let deviceCode = localStorage.getItem('kiosk_device_code')
      if (!deviceCode) {
        deviceCode = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase()
        localStorage.setItem('kiosk_device_code', deviceCode)
      }
      
      const res = await api('/api/auth/kiosk/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        data: { deviceCode }
      })
      if (!res.data) throw new Error('Failed to launch kiosk')
      const data = res.data
      setSession(data.access_token, deviceCode, data.device.name, data.device.branch)
      
      // Open kiosk in new tab
      window.open('/kiosk', '_blank')
    } catch (err) {
      toast.error('Failed to launch kiosk session')
    }
  }

  useEffect(() => {
    fetchTodayStats()
  }, [token])

  const fetchTodayStats = async () => {
    try {
      const res = await api.get('/api/attendance/report/daily')
      if (!res.data) throw new Error('Failed to load stats')
      const data = res.data
      setStats(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = stats.items.filter(item => {
    const nameMatch = `${item.employee?.firstName} ${item.employee?.lastName} ${item.employee?.employeeId}`.toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = statusFilter === 'ALL' || item.status === statusFilter
    return nameMatch && statusMatch
  })

  const hourlyData = new Array(9).fill(0); // 9 AM to 5 PM
  const deptDataMap = {};

  stats.items.forEach(item => {
    if (item.clockIn) {
      const hour = new Date(item.clockIn).getHours();
      if (hour >= 9 && hour <= 17) {
        hourlyData[hour - 9]++;
      } else if (hour < 9) {
        hourlyData[0]++;
      } else if (hour > 17) {
        hourlyData[8]++;
      }
    }
    const deptName = item.employee?.department?.name || 'Unassigned';
    deptDataMap[deptName] = (deptDataMap[deptName] || 0) + 1;
  });

  const dynamicDeptLabels = Object.keys(deptDataMap).length > 0 ? Object.keys(deptDataMap) : ['No Data'];
  const dynamicDeptSeries = Object.values(deptDataMap).length > 0 ? Object.values(deptDataMap) : [1];

  // Hourly attendance chart data - Classy Light
  const hourlyChart = {
    options: {
      chart: {
        id: 'hourly-attendance',
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        background: 'transparent',
      },
      colors: ['#4f46e5'], // Indigo-600
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 0.01,
          stops: [0, 100]
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#64748b', fontSize: '12px' } }
      },
      yaxis: {
        labels: { style: { colors: '#64748b', fontSize: '12px' } }
      },
      theme: { mode: 'light' },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4, position: 'back' }
    },
    series: [{
      name: 'Check-ins',
      data: hourlyData
    }]
  }

  // Department Attendance distribution - Classy Light
  const deptChart = {
    options: {
      chart: {
        id: 'department-attendance',
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        background: 'transparent'
      },
      labels: dynamicDeptLabels,
      colors: ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9', '#f43f5e'],
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { color: '#64748b' },
              value: { color: '#0f172a', fontSize: '24px', fontWeight: 600 }
            }
          }
        }
      },
      theme: { mode: 'light' }
    },
    series: dynamicDeptSeries
  }

  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      
      {/* Sleek Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Live Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of gym employee activity and kiosk feeds.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLaunchKiosk}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Smartphone className="h-4 w-4" />
            <span>Launch Kiosk</span>
          </button>
          <Link 
            to="/attendance/settings"
            className="p-2 bg-card hover:bg-slate-100 border border-border text-slate-600 rounded-lg transition-colors shadow-sm"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Minimalist Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present', val: stats.present + stats.halfDay, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Late', val: stats.late, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'On Break', val: stats.onBreak, icon: Coffee, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Absent', val: stats.absent, icon: UserMinus, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((metric, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{metric.label}</span>
              <div className={`p-2 rounded-lg ${metric.bg}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{metric.val}</h3>
          </div>
        ))}
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radix-style Circular Progress */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-5 flex items-center space-x-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wider">ATTENDANCE RATE</span>
          </div>
          
          <div className="relative flex items-center justify-center mt-6">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
              <circle 
                className="text-indigo-600" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 70} 
                strokeDashoffset={2 * Math.PI * 70 * (1 - stats.attendancePercentage / 100)} 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="70" 
                cx="80" 
                cy="80" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black tracking-tighter text-foreground">{stats.attendancePercentage.toFixed(0)}%</span>
              <span className="text-xs text-muted-foreground font-semibold tracking-wider mt-1">TODAY</span>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-4 text-center mt-8 pt-6 border-t border-slate-100">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground mb-1">TOTAL ROSTER</p>
              <p className="text-xl font-bold text-foreground">{stats.totalEmployees}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground mb-1">HALF DAYS</p>
              <p className="text-xl font-bold text-foreground">{stats.halfDay}</p>
            </div>
          </div>
        </div>

        {/* Clean Line Chart */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Arrival Distribution</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 -ml-4 -mb-4">
            <Chart options={hourlyChart.options} series={hourlyChart.series} type="area" height="100%" />
          </div>
        </div>

        {/* Clean Donut Chart */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Active Departments</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Chart options={deptChart.options} series={deptChart.series} type="donut" height="240" />
          </div>
        </div>
      </div>

      {/* Enterprise Roster Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 bg-background/50">
          <h3 className="text-base font-bold text-foreground">Live Roster Feed</h3>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-card border border-border text-foreground placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
            
            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm rounded-lg bg-card border border-border text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ON_BREAK">On Break</option>
            </CustomSelect>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="py-3 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Employee</th>
                <th className="py-3 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Time In</th>
                <th className="py-3 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Time Out</th>
                <th className="py-3 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Break</th>
                <th className="py-3 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.length > 0 ? (
                filteredItems.map((record) => (
                  <tr key={record.id} className="hover:bg-background/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-border flex items-center justify-center text-slate-600 flex-shrink-0">
                          {record.employee?.profilePicture ? (
                            <img src={record.employee.profilePicture} alt="Profile" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold">{record.employee?.firstName?.charAt(0)}{record.employee?.lastName?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{record.employee?.firstName} {record.employee?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{record.employee?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                      {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                      {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm font-medium">
                      {record.breakDuration > 0 ? `${(record.breakDuration * 60).toFixed(0)}m` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                        record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                        record.status === 'LATE' ? 'bg-amber-100 text-amber-700' :
                        record.status === 'ON_BREAK' ? 'bg-blue-100 text-blue-700' :
                        record.status === 'HALF_DAY' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/attendance/history?employee=${record.employeeId}`} className="p-2 inline-block text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted-foreground text-sm">
                    No active logs found for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
