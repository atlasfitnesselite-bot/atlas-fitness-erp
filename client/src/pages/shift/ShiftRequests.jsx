import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Clock, MessageSquare, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

const API = (path) => `/api${path}`
const token = () => localStorage.getItem("token")
const authHeaders = () => ({ Authorization: `Bearer ${token()}` })
const jsonHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` })

const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
}

const TYPE_LABELS = {
  CHANGE: "Shift Change",
  SWAP: "Shift Swap",
  TEMPORARY: "Temporary",
}

function NewRequestModal({ shifts, onClose, onDone }) {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    type: "CHANGE",
    targetDate: "",
    requestedShiftId: "",
    reason: ""
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/shifts/requests', formData, { headers: jsonHeaders() })
      toast({ title: "Shift request submitted" })
      onDone()
      onClose()
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to submit request" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Request Shift Change</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Request Type</label>
              <select 
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="CHANGE">Shift Change</option>
                <option value="SWAP">Shift Swap</option>
                <option value="TEMPORARY">Temporary Override</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Date</label>
              <Input required type="date" value={formData.targetDate} onChange={e => setFormData({ ...formData, targetDate: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Requested Shift (Optional)</label>
              <select 
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.requestedShiftId}
                onChange={e => setFormData({ ...formData, requestedShiftId: e.target.value })}
              >
                <option value="">No specific shift</option>
                {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <textarea
                required
                className="w-full border border-input bg-background text-foreground rounded-lg px-3 py-2 text-sm resize-none"
                rows={3}
                placeholder="Why do you need this change?"
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ApprovalModal({ request, onClose, onDone }) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAction = async (action) => {
    setLoading(true)
    try {
      const res = await api(API(`/shifts/requests/${request.id}/${action}`), {
        method: "PUT",
        headers: jsonHeaders(),
        data: {},
      })
      if (!res.data) throw new Error("Failed")
      toast({ title: `Request ${action}d` })
      onDone()
      onClose()
    } catch (err) {
      toast({ variant: "destructive", title: "Action failed" })
    } finally { setLoading(false) }
  }

  if (!request) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Review Shift Request</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Employee</span>
              <span className="font-medium">{request.employee?.firstName} {request.employee?.lastName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <Badge className={STATUS_COLORS[request.status] ?? ""}>{TYPE_LABELS[request.type] ?? request.type}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Date</span>
              <span className="font-medium">{new Date(request.targetDate).toLocaleDateString()}</span>
            </div>
            {request.requestedShift && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Requested Shift</span>
                <span className="font-medium" style={{ color: request.requestedShift.color }}>{request.requestedShift.name}</span>
              </div>
            )}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-1">Reason</p>
              <p className="text-sm bg-background rounded-lg p-3">{request.reason}</p>
            </div>
          </div>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none mb-4"
            rows={3}
            placeholder="Manager comment (optional)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => handleAction("reject")} disabled={loading}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction("approve")} disabled={loading}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShiftRequests() {
  const { user, hasRole } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("PENDING")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showNewRequest, setShowNewRequest] = useState(false)

  const isManager = hasRole('OWNER') || hasRole('MANAGER')

  useEffect(() => {
    fetch(API("/shifts?status=ACTIVE"), { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setShifts(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.append("status", filterStatus)
    if (!isManager && user?.employeeId) params.append("employeeId", user.employeeId)
    
    fetch(API(`/shifts/requests?${params}`), { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setRequests(Array.isArray(d) ? d : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterStatus])

  return (
    <div className="p-6 space-y-6">
      <ApprovalModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onDone={load} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Requests</h1>
          <p className="text-sm text-muted-foreground">Review and manage employee shift change requests</p>
        </div>
        <div className="flex gap-2">
          {["PENDING","APPROVED","REJECTED",""].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${filterStatus === s ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-background"}`}
            >
              {s || "All"}
            </button>
          ))}
          {!isManager && (
            <Button onClick={() => setShowNewRequest(true)} className="bg-indigo-600 hover:bg-indigo-700 ml-4">
              New Request
            </Button>
          )}
        </div>
      </div>

      {showNewRequest && (
        <NewRequestModal shifts={shifts} onClose={() => setShowNewRequest(false)} onDone={load} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">No shift requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
                    {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{r.employee?.firstName} {r.employee?.lastName}
                          <span className="text-xs text-muted-foreground ml-2">#{r.employee?.employeeId}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{TYPE_LABELS[r.type] ?? r.type} · {new Date(r.targetDate).toLocaleDateString()}</p>
                      </div>
                      <Badge className={STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-700"}>{r.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{r.reason}</p>
                    {r.requestedShift && (
                      <div className="mt-2 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs" style={{ color: r.requestedShift.color }}>
                          Requested: {r.requestedShift.name}
                        </span>
                      </div>
                    )}
                    {r.managerComment && (
                      <div className="mt-2 bg-background rounded-lg px-3 py-2 text-xs text-slate-600">
                        <span className="font-medium">Manager note:</span> {r.managerComment}
                      </div>
                    )}
                  </div>
                  {r.status === "PENDING" && isManager && (
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0" onClick={() => setSelectedRequest(r)}>
                      Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
