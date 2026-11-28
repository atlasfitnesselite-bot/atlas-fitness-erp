import React, { useState, useEffect } from 'react'
import { Download, Filter, Search, Table as TableIcon, Loader2, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import api from '../../lib/api';

export default function AttendanceReports() {
  const { token } = useAuthStore()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    const fetchRecords = async () => {
      if (!token) return
      try {
        setLoading(true)
        // Using /api/attendance as it returns actual attendance records
        const response = await api.get(`/api/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const data = response.data?.items || response.data?.data || response.data || []
        setRecords(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching attendance records:', error)
        toast.error('Failed to load attendance records')
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [token])

  const filteredRecords = records.filter(record => {
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter
    if (!matchesStatus) return false
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    const employeeName = `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.toLowerCase()
    return employeeName.includes(searchLower) || (record.status && record.status.toLowerCase().includes(searchLower))
  })

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export')
      return
    }
    const headers = ['Employee', 'Employee ID', 'Date', 'Status', 'Clock In', 'Clock Out', 'Working Hours']
    const rows = filteredRecords.map((r) => [
      `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim(),
      r.employee?.employeeId || '',
      new Date(r.date).toLocaleDateString('en-IN'),
      r.status || 'UNKNOWN',
      r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      r.workingHours ? Number(r.workingHours).toFixed(2) : '0',
    ])
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Attendance CSV exported')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'ABSENT': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      case 'LATE': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'HALF_DAY': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-muted-foreground'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Attendance Records</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">View and export employee attendance data</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg text-sm text-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
          </select>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border dark:border-slate-700 flex justify-between items-center bg-background/50 dark:bg-slate-800/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card dark:bg-card border border-border dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background dark:bg-slate-800/50 text-muted-foreground dark:text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Clock In</th>
                <th className="px-6 py-4">Clock Out</th>
                <th className="px-6 py-4">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <p className="text-muted-foreground">Loading records...</p>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground dark:text-muted-foreground">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-background dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                          {(record.employee?.firstName?.[0] || '') + (record.employee?.lastName?.[0] || '')}
                        </div>
                        {record.employee?.firstName} {record.employee?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status?.replace('_', ' ') || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">
                      {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">
                      {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">
                      {record.workingHours ? `${Number(record.workingHours).toFixed(1)} hrs` : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

