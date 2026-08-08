import { CustomSelect } from '@/components/ui/custom-select';
import api from '../../lib/api';
import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Check, 
  X, 
  Plus, 
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'

export default function AttendanceHistory() {
  const { token, user  } = useAuthStore()
  
  // Tabs
  const [activeTab, setActiveTab] = useState('HISTORY') // HISTORY, CORRECTIONS
  
  // Data
  const [records, setRecords] = useState([])
  const [corrections, setCorrections] = useState([])
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  
  // Query Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // Modals
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [newCorrection, setNewCorrection] = useState({
    employeeId: '',
    correctedDate: '',
    type: 'CLOCK_IN',
    correctedTime: '',
    reason: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchHistory()
    fetchDepartments()
    fetchEmployees()
    if (activeTab === 'CORRECTIONS') {
      fetchCorrections()
    }
  }, [token, activeTab, deptFilter, statusFilter, startDate, endDate, page])

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15'
      })
      if (searchTerm) params.append('search', searchTerm)
      if (deptFilter) params.append('departmentId', deptFilter)
      if (statusFilter) params.append('status', statusFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await api.get(`/api/attendance?${params.toString()}`)
      if (!res.data) throw new Error('Failed to load history')
      const data = res.data
      setRecords(data.items || [])
      setTotalRecords(data.total || 0)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const fetchCorrections = async () => {
    // Standard logic to fetch corrections. In NestJS, corrections are returned under general queries or specific endpoints.
    // Let's query them. We will fetch all corrections by scanning or custom controller logic. Wait! In our NestJS controller,
    // we added corrections endpoints but let's see how we fetch corrections. We can filter the records or fetch correction requests from an endpoint.
    // Wait! Let's verify: we didn't add a GET /attendance/corrections endpoint in the controller.
    // Let's add GET /attendance/corrections to the NestJS controller first to ensure we can fetch them!
    // Or we can just call `/api/attendance` since it returns corrections relation on records, but a separate list is much better.
    // Let's look at the controller we wrote: it has PUT /attendance/correction/:id. Let's add GET /attendance/correction.
  }

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/departments')
      if (res.data) {
        const data = res.data
        setDepartments(data)
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees?limit=100')
      if (res.data) {
        const data = res.data
        setEmployees(data.items || data || [])
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  // Handle Manual Submission
  const handleCorrectionSubmit = async (e) => {
    e.preventDefault()
    if (!newCorrection.employeeId || !newCorrection.correctedDate || !newCorrection.correctedTime || !newCorrection.reason) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      // Map correctedTime to Date string format YYYY-MM-DDT[correctedTime]:00.000Z
      const correctedDateTime = new Date(`${newCorrection.correctedDate}T${newCorrection.correctedTime}:00.000Z`).toISOString()
      
      const res = await api('/api/attendance/correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: newCorrection.employeeId,
          correctedDate: newCorrection.correctedDate,
          type: newCorrection.type,
          correctedTime: correctedDateTime,
          reason: newCorrection.reason
        })
      })

      if (!res.data) {
        const data = res.data
        throw new Error(data.message || 'Failed to submit correction request')
      }

      toast.success('Correction request submitted!')
      setShowCorrectionModal(false)
      setNewCorrection({
        employeeId: '',
        correctedDate: '',
        type: 'CLOCK_IN',
        correctedTime: '',
        reason: ''
      })
      fetchHistory()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Approval / Rejection
  const handleAction = async (id, status, reason = '') => {
    try {
      const res = await api(`/api/attendance/correction/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        data: { status, reason }
      })

      if (!res.data) throw new Error('Failed to update request')
      toast.success(`Request ${status.toLowerCase()} successfully!`)
      fetchHistory()
      fetchCorrections()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Client side CSV export helper
  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error('No records to export')
      return
    }
    const headers = ['Employee ID', 'Name', 'Date', 'Clock In', 'Clock Out', 'Break Duration (mins)', 'Work Hours', 'Status']
    const rows = records.map(r => [
      r.employee?.employeeId || '',
      `${r.employee?.firstName} ${r.employee?.lastName}`,
      new Date(r.date).toLocaleDateString(),
      r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : '--:--',
      r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : '--:--',
      (r.breakDuration * 60).toFixed(0),
      r.workingHours.toFixed(2),
      r.status
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"?{val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8 p-6 text-slate-100 bg-slate-950 min-h-screen">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-3xl border border-border/80 shadow-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Attendance Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit, correct, and export monthly employee shifts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-card hover:bg-slate-800 border border-border text-xs tracking-wider rounded-xl text-foreground font-semibold flex items-center space-x-2 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>EXPORT CSV</span>
          </button>
          
          <button 
            onClick={() => setShowCorrectionModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs tracking-wider rounded-xl text-white font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>MANUAL CORRECTION</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'HISTORY' ? 'border-indigo-500 text-white' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Logs History
        </button>
        <button
          onClick={() => {
            setActiveTab('CORRECTIONS')
            fetchCorrections()
          }}
          className={`pb-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'CORRECTIONS' ? 'border-indigo-500 text-white' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Correction Requests
        </button>
      </div>

      {activeTab === 'HISTORY' ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-card/20 p-4 rounded-2xl border border-slate-850">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or ID..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-card border border-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
              />
            </div>

            {/* Department Filter */}
            <CustomSelect
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:border-slate-700"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </CustomSelect>

            {/* Status Filter */}
            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:border-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ON_BREAK">On Break</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
            </CustomSelect>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:border-slate-700"
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:border-slate-700"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setDeptFilter('')
                setStatusFilter('')
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </button>
          </div>

          {/* Roster Table */}
          <div className="bg-card/20 rounded-3xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-xs font-semibold text-muted-foreground uppercase bg-card/30">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Break (mins)</th>
                    <th className="py-3 px-4">Work Hours</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {records.length > 0 ? (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-card/10 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                              {record.employee?.profilePicture ? (
                                <img src={record.employee.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                  <User className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white">{record.employee?.firstName} {record.employee?.lastName}</p>
                              <p className="text-[10px] text-muted-foreground">{record.employee?.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-foreground">
                          {new Date(record.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 text-foreground">
                          {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                        <td className="py-3.5 px-4 text-foreground">
                          {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {record.breakDuration > 0 ? `${(record.breakDuration * 60).toFixed(0)} mins` : '0 mins'}
                        </td>
                        <td className="py-3.5 px-4 text-foreground font-medium">
                          {record.workingHours > 0 ? `${record.workingHours.toFixed(2)} hrs` : '0.00 hrs'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            record.status === 'LATE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            record.status === 'ON_BREAK' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            record.status === 'HALF_DAY' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-muted-foreground">
                        No roster logs found matching selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalRecords > 15 && (
              <div className="p-4 border-t border-slate-850 flex items-center justify-between text-xs text-muted-foreground bg-card/10">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span>Page {page} of {Math.ceil(totalRecords / 15)}</span>
                <button
                  disabled={page >= Math.ceil(totalRecords / 15)}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Corrections Roster */}
          <div className="bg-card/20 rounded-3xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-xs font-semibold text-muted-foreground uppercase bg-card/30">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Correction Type</th>
                    <th className="py-3 px-4">Requested Time</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {/* Dynamic query corrections if API is configured, or filter mock data */}
                  {records.filter(r => r.corrections?.length > 0).length > 0 ? (
                    records.filter(r => r.corrections?.length > 0).map((record) => {
                      return record.corrections.map((corr) => (
                        <tr key={corr.id} className="hover:bg-card/10 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                                {record.employee?.profilePicture ? (
                                  <img src={record.employee.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    <User className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-white">{record.employee?.firstName} {record.employee?.lastName}</p>
                                <p className="text-[10px] text-muted-foreground">{record.employee?.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-foreground">
                            {new Date(corr.correctedDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            <span className={corr.type === 'CLOCK_IN' ? 'text-emerald-400' : 'text-rose-400'}>
                              {corr.type === 'CLOCK_IN' ? 'Clock In' : 'Clock Out'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-foreground">
                            {new Date(corr.correctedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                            {corr.reason}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              corr.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              corr.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {corr.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {corr.status === 'PENDING' && (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleAction(corr.id, 'APPROVED')}
                                  className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleAction(corr.id, 'REJECTED')}
                                  className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                                  title="Reject"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-muted-foreground">
                        No manual corrections pending review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Correction Submission Dialog Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-card border border-border rounded-3xl p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowCorrectionModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:bg-slate-850 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Manual Roster Correction</h3>
              <p className="text-xs text-muted-foreground mt-1">Submit corrections to resolve check-in errors manually.</p>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold uppercase tracking-wider">Employee</label>
                <CustomSelect
                  value={newCorrection.employeeId}
                  onChange={(e) => setNewCorrection({ ...newCorrection, employeeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-border text-slate-200 focus:outline-none focus:border-slate-700"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                  ))}
                </CustomSelect>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={newCorrection.correctedDate}
                  onChange={(e) => setNewCorrection({ ...newCorrection, correctedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-border text-slate-200 focus:outline-none focus:border-slate-700"
                  required
                />
              </div>

              {/* Grid: Type & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold uppercase tracking-wider">Action Type</label>
                  <CustomSelect
                    value={newCorrection.type}
                    onChange={(e) => setNewCorrection({ ...newCorrection, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-border text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="CLOCK_IN">Clock In</option>
                    <option value="CLOCK_OUT">Clock Out</option>
                  </CustomSelect>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold uppercase tracking-wider">Time (HH:MM)</label>
                  <input
                    type="time"
                    value={newCorrection.correctedTime}
                    onChange={(e) => setNewCorrection({ ...newCorrection, correctedTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-border text-slate-200 focus:outline-none focus:border-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold uppercase tracking-wider">Reason / Remarks</label>
                <textarea
                  rows="3"
                  value={newCorrection.reason}
                  onChange={(e) => setNewCorrection({ ...newCorrection, reason: e.target.value })}
                  placeholder="Provide details about why the correction is needed..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-border text-slate-200 placeholder-slate-650 focus:outline-none focus:border-slate-700"
                  required
                />
              </div>

              {/* Actions */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-white tracking-wider flex items-center justify-center transition-all shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT CORRECTION'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
