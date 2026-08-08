import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useState, useEffect } from "react"
import { Users, Search, Loader2, CheckCircle2, X, GripVertical, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const API = (path) => `/api${path}`
const token = () => localStorage.getItem("token")
const authHeaders = () => ({ Authorization: `Bearer ${token()}` })
const jsonHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` })

export default function ShiftAssignment() {
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")
  const [replaceExisting, setReplaceExisting] = useState(true)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [results, setResults] = useState(null)

  // Map of shiftId -> array of employeeIds
  const [assigned, setAssigned] = useState({})
  const [draggedItem, setDraggedItem] = useState(null)

  useEffect(() => {
    fetch(API("/shifts?status=ACTIVE"), { headers: authHeaders() })
      .then(r => r.json()).then(d => setShifts(Array.isArray(d) ? d : []))
    fetch(API("/employees?status=ACTIVE&limit=200"), { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setEmployees(Array.isArray(d?.items) ? d.items : Array.isArray(d?.employees) ? d.employees : Array.isArray(d) ? d : []))
  }, [])

  const filteredEmployees = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.employeeId} ${e.department?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())
  )

  // Determine if an employee is assigned to ANY bucket
  const isAssigned = (empId) => {
    return Object.values(assigned).some(arr => arr.includes(empId))
  }

  // Handle Drag & Drop
  const handleDragStart = (e, empId) => {
    e.dataTransfer.setData("empId", empId)
    setDraggedItem(empId)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, shiftId) => {
    e.preventDefault()
    const empId = e.dataTransfer.getData("empId")
    if (!empId) return

    setAssigned(prev => {
      const next = { ...prev }
      // Remove from all other buckets first
      Object.keys(next).forEach(k => {
        next[k] = next[k].filter(id => id !== empId)
      })
      next[shiftId] = [...(next[shiftId] || []), empId]
      return next
    })
    setDraggedItem(null)
  }

  const removeFromShift = (shiftId, empId) => {
    setAssigned(prev => ({
      ...prev,
      [shiftId]: prev[shiftId].filter(id => id !== empId)
    }))
  }

  const handleAssign = async () => {
    const shiftIds = Object.keys(assigned).filter(id => assigned[id].length > 0)
    if (shiftIds.length === 0) {
      toast({ variant:"destructive", title:"No assignments made. Drag employees into shifts." })
      return
    }
    if (!startDate) { toast({ variant:"destructive", title:"Please set a start date" }); return }

    setSaving(true)
    setResults(null)
    
    const allResults = []
    
    try {
      for (const shiftId of shiftIds) {
        const employeeIds = assigned[shiftId]
        const res = await api(API("/shifts/assignments"), {
          method: "POST",
          headers: jsonHeaders(),
          data: { 
            shiftId, 
            employeeIds, 
            startDate,
            endDate: endDate || undefined,
            replaceExisting
          }
        })
        const data = res.data
        if (!res.data) throw new Error(data.message || `Failed to assign to shift ${shiftId}`)
        
        if (data.results) {
          allResults.push(...data.results)
        }
      }
      
      setResults(allResults)
      toast({ title: "Assignments complete", description: "Processed $(.length) assignments." })
      // Clear assignments
      setAssigned({})
    } catch(e) {
      toast({ variant:"destructive", title: e.message })
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Assignment</h1>
          <p className="text-sm text-muted-foreground">Drag employees to shift buckets to schedule them</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="space-y-1">
            <Label className="text-xs">Start Date</Label>
            <Input type="date" className="h-9" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End Date</Label>
            <Input type="date" className="h-9" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
          </div>
          <div className="pt-5">
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-9" onClick={handleAssign} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Save Assignments</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border">
        <AlertCircle className="h-4 w-4 text-indigo-500" />
        <span>Assignments take effect for the date range selected above. Checking "Replace existing" will overwrite conflicting shifts.</span>
        <label className="ml-auto flex items-center gap-2 cursor-pointer font-medium text-slate-700">
          <input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)} className="rounded" />
          Replace existing assignments
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Employee List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Employee Pool</CardTitle>
              <CardDescription>Drag to assign</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-9 text-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/50">
              {filteredEmployees.map(e => {
                const assignedAlready = isAssigned(e.id)
                if (assignedAlready) return null // Hide if already in a bucket
                
                return (
                  <div 
                    key={e.id}
                    draggable="true"
                    onDragStart={(ev) => handleDragStart(ev, e.id)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-3 p-2 bg-card rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 group"
                  >
                    <GripVertical className="h-4 w-4 text-foreground flex-shrink-0" />
                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {e.firstName?.[0]}{e.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{e.firstName} {e.lastName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{e.employeeId} · {e.department?.name ?? "No Dept"}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <span className="sr-only">Assign</span>
                            <span className="text-lg leading-none">+</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Assign to...</div>
                          {shifts.map(s => (
                            <DropdownMenuItem key={s.id} onClick={() => setAssigned(prev => {
                              const next = { ...prev }
                              Object.keys(next).forEach(k => next[k] = next[k].filter(id => id !== e.id))
                              next[s.id] = [...(next[s.id] || []), e.id]
                              return next
                            })}>
                              <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
              {filteredEmployees.filter(e => !isAssigned(e.id)).length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No employees available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Shift Buckets */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {shifts.map(shift => {
              const assignedEmps = (assigned[shift.id] || []).map(id => employees.find(e => e.id === id)).filter(Boolean)
              
              return (
                <Card 
                  key={shift.id} 
                  className={`border-t-4 flex flex-col h-[600px] transition-colors`}
                  style={{ borderTopColor: shift.color }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, shift.id)}
                >
                  <CardHeader className="pb-3 border-b bg-background/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base" style={{ color: shift.color }}>{shift.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {shift.startTime} – {shift.endTime}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{assignedEmps.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-3 bg-background/30">
                    {assignedEmps.length === 0 ? (
                      <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Drop employees here</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {assignedEmps.map(e => (
                          <div key={e.id} className="flex items-center gap-2 p-2 bg-card rounded-lg border shadow-sm">
                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: shift.color }}>
                              {e.firstName?.[0]}{e.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{e.firstName} {e.lastName}</p>
                            </div>
                            <button 
                              onClick={() => removeFromShift(shift.id, e.id)}
                              className="p-1 hover:bg-red-50 text-red-400 rounded transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
        
      </div>
    </div>
  )
}
