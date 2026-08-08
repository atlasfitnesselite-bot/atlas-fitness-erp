import { CustomSelect } from '@/components/ui/custom-select';
import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Clock, X, Check, Loader2, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

const API = (path) => `/api${path}`
const token = () => localStorage.getItem("token")
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` })

const SHIFT_TYPES = ["MORNING","EVENING","NIGHT","SPLIT","WEEKEND","HOLIDAY","CUSTOM"]
const TYPE_COLORS = {
  MORNING:"bg-amber-100 text-amber-800", EVENING:"bg-indigo-100 text-indigo-800",
  NIGHT:"bg-slate-100 text-foreground", SPLIT:"bg-emerald-100 text-emerald-800",
  WEEKEND:"bg-pink-100 text-pink-800", HOLIDAY:"bg-red-100 text-red-800", CUSTOM:"bg-violet-100 text-violet-800"
}

function ShiftModal({ open, shift, onClose, onSave }) {
  const isEdit = !!shift?.id
  const [form, setForm] = useState({
    name:"", code:"", color:"#6366f1", description:"", type:"MORNING",
    startTime:"09:00", endTime:"17:00", breakDuration:45, gracePeriod:15,
    lateThreshold:30, earlyExitThreshold:15, minWorkingHours:4, maxWorkingHours:12,
    overtimeEligibility:true, status:"ACTIVE",
    ...(shift || {})
  })
  const [saving, setSaving] = useState(false)
  useEffect(() => { setForm({ name:"", code:"", color:"#6366f1", description:"", type:"MORNING", startTime:"09:00", endTime:"17:00", breakDuration:45, gracePeriod:15, lateThreshold:30, earlyExitThreshold:15, minWorkingHours:4, maxWorkingHours:12, overtimeEligibility:true, status:"ACTIVE", ...(shift || {}) }) }, [shift])
  if (!open) return null

  const handleSave = async () => {
    if (!form.name || !form.code) { toast({ variant:"destructive", title:"Name and Code are required" }); return }
    setSaving(true)
    try {
      const url = isEdit ? API(`/shifts/${form.id}`) : API("/shifts")
      const method = isEdit ? "PUT" : "POST"
      const res = await api(url, { method, headers: headers(), data: form })
      const result = res.data
      if (!res.data) throw new Error(result.message)
      toast({ title: isEdit ? "Shift updated" : "Shift created" })
      onSave()
      onClose()
    } catch(e) { toast({ variant:"destructive", title: e.message }) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">{isEdit ? "Edit Shift" : "Create New Shift"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        {!isEdit && (
          <div className="px-6 pt-4 pb-2 border-b bg-background/50 flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" /> QUICK TEMPLATES</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs bg-amber-50" onClick={() => setForm({...form, name: "Morning Shift", code: "MORNING", type: "MORNING", startTime: "09:00", endTime: "17:00", color: "#f59e0b"})}>Morning</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-indigo-50" onClick={() => setForm({...form, name: "Evening Shift", code: "EVENING", type: "EVENING", startTime: "14:00", endTime: "22:00", color: "#6366f1"})}>Evening</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-slate-100" onClick={() => setForm({...form, name: "Night Shift", code: "NIGHT", type: "NIGHT", startTime: "22:00", endTime: "06:00", color: "#1e293b"})}>Night</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-emerald-50" onClick={() => setForm({...form, name: "Split Shift", code: "SPLIT", type: "SPLIT", startTime: "08:00", endTime: "20:00", breakDuration: 240, color: "#10b981"})}>Split</Button>
            </div>
          </div>
        )}
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1 space-y-1">
            <Label>Shift Name *</Label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Morning Shift" />
          </div>
          <div className="col-span-2 md:col-span-1 space-y-1">
            <Label>Shift Code *</Label>
            <Input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. MORNING" />
          </div>
          <div className="space-y-1">
            <Label>Shift Type</Label>
            <CustomSelect className="w-full border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              {SHIFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </CustomSelect>
          </div>
          <div className="space-y-1">
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="h-9 w-14 rounded border cursor-pointer" />
              <span className="text-sm text-muted-foreground">{form.color}</span>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Start Time</Label>
            <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>End Time</Label>
            <Input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Break Duration (min)</Label>
            <Input type="number" value={form.breakDuration} onChange={e => setForm({...form, breakDuration: +e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Grace Period (min)</Label>
            <Input type="number" value={form.gracePeriod} onChange={e => setForm({...form, gracePeriod: +e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Late Threshold (min)</Label>
            <Input type="number" value={form.lateThreshold} onChange={e => setForm({...form, lateThreshold: +e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Early Exit Threshold (min)</Label>
            <Input type="number" value={form.earlyExitThreshold} onChange={e => setForm({...form, earlyExitThreshold: +e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Min Working Hours</Label>
            <Input type="number" step="0.5" value={form.minWorkingHours} onChange={e => setForm({...form, minWorkingHours: +e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Max Working Hours</Label>
            <Input type="number" step="0.5" value={form.maxWorkingHours} onChange={e => setForm({...form, maxWorkingHours: +e.target.value})} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Description</Label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none bg-background text-foreground" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description..." />
          </div>
          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.overtimeEligibility} onChange={e => setForm({...form, overtimeEligibility: e.target.checked})} className="rounded" />
              <span className="text-sm text-foreground">Overtime Eligible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.status === "ACTIVE"} onChange={e => setForm({...form, status: e.target.checked ? "ACTIVE" : "INACTIVE"})} className="rounded" />
              <span className="text-sm text-foreground">Active</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Update Shift" : "Create Shift"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ShiftList() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [modal, setModal] = useState({ open: false, shift: null })

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (filterType) params.append("type", filterType)
    if (filterStatus) params.append("status", filterStatus)
    fetch(API(`/shifts?${params}`), { headers: headers() })
      .then(r => r.json())
      .then(data => setShifts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, filterType, filterStatus])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete shift "?{name}"?`)) return
    const res = await api(API(`/shifts/${id}`), { method: "DELETE", headers: headers() })
    if (res.data) { toast({ title: "Shift deleted" }); load() }
    else toast({ variant: "destructive", title: "Failed to delete shift" })
  }

  return (
    <div className="p-6 space-y-6">
      <ShiftModal open={modal.open} shift={modal.shift} onClose={() => setModal({open:false,shift:null})} onSave={load} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Templates</h1>
          <p className="text-sm text-muted-foreground">Manage and configure work shift definitions</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setModal({open:true,shift:null})}>
          <Plus className="h-4 w-4 mr-2" /> New Shift
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search shifts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CustomSelect className="border rounded-lg px-3 py-2 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {SHIFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </CustomSelect>
        <CustomSelect className="border rounded-lg px-3 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </CustomSelect>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Clock className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">No shifts found</p>
          <p className="text-sm">Create your first shift template</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shifts.map(s => (
            <Card key={s.id} className="hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: s.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    <code className="text-xs text-muted-foreground">{s.code}</code>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({open:true,shift:s})} className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={TYPE_COLORS[s.type] || "bg-slate-100 text-slate-700"}>{s.type}</Badge>
                  <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"} className={s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : ""}>{s.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start</span>
                    <p className="font-medium">{s.startTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End</span>
                    <p className="font-medium">{s.endTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Break</span>
                    <p className="font-medium">{s.breakDuration} min</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assigned</span>
                    <p className="font-medium">{s._count?.assignments ?? 0} emp.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
