import { CustomSelect } from '@/components/ui/custom-select';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO, isValid } from "date-fns"
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore'

const safeFormat = (dateString, formatStr) => {
  if (!dateString) return null;
  const parsed = parseISO(dateString);
  return isValid(parsed) ? format(parsed, formatStr) : "Invalid Date";
}

export default function PTCalendar() {
  const { user, hasRole } = useAuthStore()
  const [sessions, setSessions] = useState([])
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionToComplete, setSessionToComplete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completeData, setCompleteData] = useState({
    duration: 60,
    exercisesCompleted: 5,
    intensity: 7
  })
  
  const [formData, setFormData] = useState({
    memberId: '',
    trainerId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  })

  const { toast } = useToast()
  
  const token = localStorage.getItem("token") || ""

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [sessRes, memRes, empRes] = await Promise.all([
        api.get("/api/pt/sessions").catch(() => ({ data: [] })),
        api.get("/api/members").catch(() => ({ data: [] })),
        api.get("/api/employees").catch(() => ({ data: { employees: [] } }))
      ])
      
      const safeArray = (data, key) => Array.isArray(data?.[key]) ? data[key] : (Array.isArray(data) ? data : [])
      setSessions(Array.isArray(sessRes.data) ? sessRes.data : [])
      setMembers(safeArray(memRes.data, 'data'))
      const allEmps = safeArray(empRes.data, 'items')
      setTrainers(allEmps.filter(e => e.status === 'ACTIVE'))
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to load initial data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const dateObj = new Date(formData.date)
      const isoDate = dateObj.toISOString()

      await api.post("/api/pt/sessions/book", {
        ...formData,
        date: isoDate
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      toast({ title: "Success", description: "Session booked successfully" })
      setIsDialogOpen(false)
      setFormData({ memberId: '', trainerId: '', date: '', startTime: '', endTime: '', notes: '' })
      fetchInitialData()
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to book session", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/pt/sessions/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({ title: "Success", description: `Session marked as ${status}` })
      fetchInitialData()
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update status", variant: "destructive" })
    }
  }

  const handleCompleteSession = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.put(`/api/pt/sessions/${sessionToComplete.id}/complete`, {
        duration: Number(completeData.duration),
        exercisesCompleted: Number(completeData.exercisesCompleted),
        intensity: Number(completeData.intensity)
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      toast({ title: "Success", description: "Session marked as completed" })
      setSessionToComplete(null)
      fetchInitialData()
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to complete session", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-slate-100 text-foreground"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "SCHEDULED": return <Clock className="h-4 w-4 mr-1" />
      case "COMPLETED": return <CheckCircle2 className="h-4 w-4 mr-1" />
      case "CANCELLED": return <XCircle className="h-4 w-4 mr-1" />
      default: return <AlertCircle className="h-4 w-4 mr-1" />
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Training Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage and view your upcoming personal training sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchInitialData} variant="outline">
            Refresh Schedule
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-card hover:bg-slate-800 text-white">
                <CalendarIcon className="mr-2 h-4 w-4" /> Book Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book PT Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBookSession} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Member</Label>
                  <CustomSelect 
                    required 
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.memberId} 
                    onChange={e => setFormData({...formData, memberId: e.target.value})}
                  >
                    <option value="">Select Member...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </CustomSelect>
                </div>
                
                <div className="space-y-2">
                  <Label>Trainer</Label>
                  <CustomSelect 
                    required 
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.trainerId} 
                    onChange={e => setFormData({...formData, trainerId: e.target.value})}
                  >
                    <option value="">Select Trainer...</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.firstName} {t.lastName} {t.designation?.name ? `(${t.designation.name})` : ''}</option>
                    ))}
                  </CustomSelect>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input placeholder="Any special requirements..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                  {isSubmitting ? "Booking..." : "Book Session"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-10 bg-background rounded-md"></div>
                <div className="h-10 bg-background rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed border-2 bg-background/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <CalendarIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No sessions scheduled</h3>
            <p className="text-muted-foreground max-w-sm mt-1 mb-6">
              You don't have any personal training sessions scheduled at the moment.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-card hover:bg-slate-800">
              Schedule Your First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden border-border hover:shadow-md transition-all duration-200">
              <div className="h-2 w-full bg-card"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`flex items-center ${getStatusColor(session.status)} border-0 font-medium`}>
                    {getStatusIcon(session.status)}
                    {session.status || "SCHEDULED"}
                  </Badge>
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  {session.member?.firstName} {session.member?.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground mt-2">
                  <CalendarIcon className="h-4 w-4" />
                  {session.startTime ? safeFormat(session.startTime, "EEEE, MMMM do, yyyy") : "Date TBD"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> Time
                    </span>
                    <span className="text-foreground font-semibold">
                      {session.startTime ? safeFormat(session.startTime, "h:mm a") : "--"} 
                      {session.endTime ? ` - ${safeFormat(session.endTime, "h:mm a")}` : ""}
                    </span>
                  </div>
                  {session.notes && (
                    <div className="pt-2 border-t border-border mt-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
                      <p className="text-sm text-slate-700">{session.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && hasRole('TRAINER') && (
                    <Button onClick={() => setSessionToComplete(session)} className="w-full bg-card hover:bg-slate-800 text-white">
                      Mark Completed
                    </Button>
                  )}
                  <Button onClick={() => setSelectedSession(session)} variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">Member</span>
                  <p className="font-medium">{selectedSession.member?.firstName} {selectedSession.member?.lastName}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">Trainer</span>
                  <p className="font-medium">{selectedSession.trainer?.firstName} {selectedSession.trainer?.lastName}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">Date</span>
                  <p className="font-medium">{selectedSession.startTime ? safeFormat(selectedSession.startTime, "EEEE, MMMM do, yyyy") : "Date TBD"}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">Time</span>
                  <p className="font-medium">
                    {selectedSession.startTime ? safeFormat(selectedSession.startTime, "h:mm a") : "--"} 
                    {selectedSession.endTime ? ` - ${safeFormat(selectedSession.endTime, "h:mm a")}` : ""}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground block mb-2">Status</span>
                  <Badge className={`flex w-max items-center ${getStatusColor(selectedSession.status)} border-0 font-medium`}>
                    {getStatusIcon(selectedSession.status)}
                    {selectedSession.status || "SCHEDULED"}
                  </Badge>
                </div>
              </div>
              {selectedSession.notes && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="font-semibold text-muted-foreground block mb-2 text-sm">Notes</span>
                  <p className="text-sm bg-background p-3 rounded-md border border-slate-100 text-slate-700">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!sessionToComplete} onOpenChange={(open) => !open && setSessionToComplete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete PT Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompleteSession} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input required type="number" min="1" value={completeData.duration} onChange={e => setCompleteData({...completeData, duration: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Exercises Completed</Label>
              <Input required type="number" min="1" value={completeData.exercisesCompleted} onChange={e => setCompleteData({...completeData, exercisesCompleted: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Intensity (1-10)</Label>
              <Input required type="number" min="1" max="10" value={completeData.intensity} onChange={e => setCompleteData({...completeData, intensity: e.target.value})} />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? "Completing..." : "Complete Session"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
