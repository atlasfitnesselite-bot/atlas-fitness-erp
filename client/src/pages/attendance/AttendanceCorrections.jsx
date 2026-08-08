import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import api from '../../lib/api';

export default function AttendanceCorrections() {
  const { token } = useAuthStore()
  const [corrections, setCorrections] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCorrections = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/attendance/corrections`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = response.data?.data || response.data || []
      const pendingCorrections = Array.isArray(data) 
        ? data.filter(c => c.status === 'PENDING') 
        : []
      
      setCorrections(pendingCorrections)
    } catch (error) {
      console.error('Error fetching corrections:', error)
      toast.error('Failed to load corrections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCorrections()
    }
  }, [token])

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/attendance/correction/${id}`, { status: 'APPROVED' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Correction approved')
      fetchCorrections()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to approve correction')
    }
  }

  const handleReject = async (id) => {
    try {
      await api.put(`/api/attendance/correction/${id}`, { status: 'REJECTED' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Correction rejected')
      fetchCorrections()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to reject correction')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Attendance Corrections</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Review and approve manual attendance corrections</p>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background dark:bg-slate-800/50 text-muted-foreground dark:text-muted-foreground font-medium border-b border-border dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Original / Corrected</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <p className="text-muted-foreground">Loading corrections...</p>
                  </td>
                </tr>
              ) : corrections.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground dark:text-muted-foreground">
                    No pending corrections found
                  </td>
                </tr>
              ) : (
                corrections.map((req) => (
                  <tr key={req.id} className="hover:bg-background dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground dark:text-white">
                      {req.employee?.firstName || req.employeeId} {req.employee?.lastName || ''}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">
                      {req.correctedDate ? new Date(req.correctedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-medium">
                        {req.type || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground max-w-xs truncate" title={req.reason}>
                      {req.reason || 'No reason provided'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">
                      <div className="text-xs line-through text-rose-500 mb-1">
                        {req.originalTime ? new Date(req.originalTime).toLocaleTimeString() : '--:--'}
                      </div>
                      <div className="text-sm text-emerald-600 dark:text-emerald-400">
                        {req.correctedTime ? new Date(req.correctedTime).toLocaleTimeString() : '--:--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium">
                        {req.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(req.id)} 
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" 
                          title="Approve"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)} 
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" 
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
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
