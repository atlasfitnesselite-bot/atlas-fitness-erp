import { useState, useEffect } from "react"
import { useAuthStore } from '@/store/useAuthStore'
import api from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Search, Loader2, Edit, Trash2, Calendar, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomSelect } from "@/components/ui/custom-select"
import { format } from "date-fns"

const API = (path) => `/api${path}`
const token = () => localStorage.getItem("token")
const authHeaders = () => ({ Authorization: `Bearer ${token()}` })
const jsonHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` })

function EditAssignmentModal({ assignment, shifts, onClose, onSave }) {
  const [formData, setFormData] = useState({
    shiftId: assignment?.shiftId || "",
    startDate: assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : "",
    endDate: assignment?.endDate ? new Date(assignment.endDate).toISOString().split('T')[0] : ""
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/api/shifts/assignments/${assignment.id}`, formData, { headers: jsonHeaders() })
      toast({ title: "Assignment updated successfully" })
      onSave()
      onClose()
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to update assignment" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shift Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee</label>
            <Input disabled value={`${assignment.employee?.firstName} ${assignment.employee?.lastName}`} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shift</label>
            <CustomSelect
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.shiftId}
              onChange={e => setFormData({ ...formData, shiftId: e.target.value })}
              required
            >
              <option value="">Select Shift...</option>
              {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
            </CustomSelect>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input required type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date (Optional)</label>
              <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ShiftAssignmentsList() {
  const [assignments, setAssignments] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [editingAssignment, setEditingAssignment] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [assnRes, shiftRes] = await Promise.all([
        fetch(API("/shifts/assignments"), { headers: authHeaders() }).then(r => r.json()),
        fetch(API("/shifts?status=ACTIVE"), { headers: authHeaders() }).then(r => r.json())
      ])
      setAssignments(Array.isArray(assnRes) ? assnRes : [])
      setShifts(Array.isArray(shiftRes) ? shiftRes : [])
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load data" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return
    try {
      await api.delete(`/api/shifts/assignments/${id}`, { headers: authHeaders() })
      toast({ title: "Assignment removed" })
      fetchData()
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to delete assignment" })
    }
  }

  const filtered = assignments.filter(a => {
    const searchStr = `${a.employee?.firstName} ${a.employee?.lastName} ${a.shift?.name}`.toLowerCase()
    return searchStr.includes(search.toLowerCase())
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assigned Shifts</h1>
          <p className="text-muted-foreground mt-1">View and manage employee shift assignments</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>A complete list of scheduled shift assignments.</CardDescription>
          </div>
          <div className="flex items-center gap-2 relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employee or shift..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No assignments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.employee?.firstName} {a.employee?.lastName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.shift?.color || '#6366f1' }} />
                            <span>{a.shift?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-600">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {format(new Date(a.startDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {a.endDate ? (
                            <div className="flex items-center text-slate-600">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              {format(new Date(a.endDate), 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Ongoing</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditingAssignment(a)}>
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingAssignment && (
        <EditAssignmentModal
          assignment={editingAssignment}
          shifts={shifts}
          onClose={() => setEditingAssignment(null)}
          onSave={fetchData}
        />
      )}
    </div>
  )
}
