import { CustomSelect } from '@/components/ui/custom-select';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/useAuthStore"
import api from '../../lib/api';

export default function LeaveRequests() {
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [myBalances, setMyBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { token, user, hasRole } = useAuthStore()

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    reason: '',
    isHalfDay: false
  })

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const headers = { 'Authorization': `Bearer ${token}` }
      const [reqRes, empRes, ltRes, balRes] = await Promise.all([
        api.get('/api/leave/requests', { headers }),
        api.get('/api/employees', { headers }).catch(() => ({ data: [] })),
        api.get('/api/leave/types', { headers }).catch(() => ({ data: [] })),
        api.get('/api/leave/balances', { headers }).catch(() => ({ data: [] }))
      ])
      
      setRequests(reqRes.data || [])
      setEmployees(empRes.data.items || empRes.data.employees || (Array.isArray(empRes.data) ? empRes.data : []))
      setLeaveTypes(ltRes.data || [])
      
      const allBals = balRes.data || []
      setMyBalances(allBals.filter(b => b.employee?.userId === user?.id))
    } catch (error) {
      console.error("Failed to fetch initial data:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load leave requests." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchInitialData()
  }, [token])

  const handleApply = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/leave/requests', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast({ title: "Success", description: "Leave request submitted successfully." })
      setIsDialogOpen(false)
      fetchInitialData()
      setFormData({ employeeId: '', leaveTypeId: '', fromDate: '', toDate: '', reason: '', isHalfDay: false })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to submit leave request." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAction = async (id, status) => {
    try {
      await api.put(`/api/leave/requests/${id}/approve`, { status, comments: status, managerId: user?.id }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast({ title: "Success", description: `Leave request ${status.toLowerCase()} successfully.` })
      fetchInitialData()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Action failed." })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground">Review and approve employee leave applications.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-card hover:bg-slate-800 text-white">
              <Plus className="mr-2 h-4 w-4" /> Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleApply} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <CustomSelect 
                  required 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.employeeId} 
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId || emp.email})</option>
                  ))}
                </CustomSelect>
              </div>
              
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <CustomSelect 
                  required 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.leaveTypeId} 
                  onChange={e => setFormData({...formData, leaveTypeId: e.target.value})}
                >
                  <option value="">Select Leave Type...</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name} ({lt.maxDaysPerYear} days max)</option>
                  ))}
                </CustomSelect>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input required type="date" value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input required type="date" value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Input required placeholder="Reason for leave" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium pt-2">
                <input type="checkbox" checked={formData.isHalfDay} onChange={e => setFormData({...formData, isHalfDay: e.target.checked})} className="rounded border-slate-300" />
                Is Half Day
              </label>

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {myBalances.length > 0 && user?.role !== 'OWNER' && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 pb-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Manage all incoming leave applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading requests...</div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background">
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    {(hasRole('OWNER') || hasRole('MANAGER')) && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No leave requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-background/50">
                        <TableCell className="font-medium">
                          {req.employee?.firstName} {req.employee?.lastName}
                        </TableCell>
                        <TableCell>{req.leaveType?.name}</TableCell>
                        <TableCell>
                          {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={req.reason}>
                          {req.reason}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              req.status === 'APPROVED' ? 'default' : 
                              req.status === 'REJECTED' ? 'destructive' : 
                              req.status === 'CANCELLED' ? 'secondary' : 'outline'
                            }
                            className={req.status === 'APPROVED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        {(hasRole('OWNER') || hasRole('MANAGER')) && (
                        <TableCell className="text-right space-x-2">
                          {req.status === 'PENDING' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleAction(req.id, 'APPROVED')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleAction(req.id, 'REJECTED')} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
