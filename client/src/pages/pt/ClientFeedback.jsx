import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/useAuthStore"
import api from "../../lib/api"
import { MessageSquare, Star } from "lucide-react"

export default function ClientFeedback() {
  const { user } = useAuthStore()
  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [sessions, setSessions] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [feedbackText, setFeedbackText] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    trainerId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    clientFeedback: ""
  })

  useEffect(() => {
    fetchMembers()
    fetchTrainers()
  }, [])

  useEffect(() => {
    if (selectedMemberId) {
      fetchSessions(selectedMemberId)
    }
  }, [selectedMemberId])

  const fetchMembers = async () => {
    try {
      const res = await api.get("/api/members")
      let memList = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : [])
      if (!Array.isArray(memList)) memList = []
      setMembers(memList)
    } catch (error) {
      console.error("Error fetching members", error)
      setMembers([])
    }
  }

  const fetchTrainers = async () => {
    try {
      const res = await api.get("/api/employees")
      let empList = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : [])
      setTrainers(empList.filter(e => e.status === 'ACTIVE'))
    } catch (error) {
      console.error("Error fetching trainers", error)
    }
  }

  const fetchSessions = async (memberId) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/pt/members/${memberId}/progress`)
      setSessions(res.data?.sessionHistory || [])
    } catch (error) {
      console.error("Error fetching sessions", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFeedback = async (sessionId) => {
    try {
      await api.put(`/api/pt/sessions/${sessionId}/feedback`, { clientFeedback: feedbackText })
      setEditingSession(null)
      fetchSessions(selectedMemberId)
    } catch (error) {
      console.error("Error saving feedback", error)
    }
  }

  const handleCreateSession = async (e) => {
    e.preventDefault()
    if (!selectedMemberId || !formData.trainerId) {
      alert("Please select both a client and a trainer.")
      return
    }
    setIsSubmitting(true)
    try {
      const dateObj = new Date(formData.date)
      const isoDate = dateObj.toISOString()

      // Book session first
      const res = await api.post("/api/pt/sessions/book", {
        memberId: selectedMemberId,
        trainerId: formData.trainerId,
        date: isoDate,
        startTime: formData.startTime,
        endTime: formData.endTime
      })
      
      const newSessionId = res.data.id || res.data.session?.id

      if (newSessionId) {
        // Mark as completed and save feedback
        await api.put(`/api/pt/sessions/${newSessionId}/complete`, { status: "COMPLETED" })
        if (formData.clientFeedback) {
          await api.put(`/api/pt/sessions/${newSessionId}/feedback`, { clientFeedback: formData.clientFeedback })
        }
      }
      
      setIsDialogOpen(false)
      setFormData(prev => ({ ...prev, clientFeedback: "" }))
      fetchSessions(selectedMemberId)
    } catch (error) {
      console.error("Failed to log new session", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Feedback</h1>
          <p className="text-muted-foreground">Review feedback and ratings provided by clients for past sessions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id.toString()}>{m.firstName} {m.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMemberId && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Log New Session</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Past Session & Feedback</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSession} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Trainer</Label>
                    <Select required value={formData.trainerId} onValueChange={(val) => setFormData({...formData, trainerId: val})}>
                      <SelectTrigger><SelectValue placeholder="Select Trainer" /></SelectTrigger>
                      <SelectContent>
                        {trainers.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.firstName} {t.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Client Feedback</Label>
                    <Textarea 
                      placeholder="Write feedback about the session..." 
                      rows={4}
                      value={formData.clientFeedback}
                      onChange={e => setFormData({...formData, clientFeedback: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Logging..." : "Log Session & Feedback"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedMemberId ? (
            <div className="text-center text-muted-foreground py-8">Select a client to view their feedback</div>
          ) : loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No feedback found for this client.</div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg">{new Date(session.date).toLocaleDateString()} at {session.startTime}</div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        Feedback
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  {editingSession === session.id ? (
                    <div className="space-y-2 mt-4 pt-4 border-t">
                      <textarea
                        className="w-full min-h-[100px] p-3 rounded-md border bg-background text-sm"
                        placeholder="Enter client feedback..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                      <div className="flex space-x-2 justify-end">
                        <button className="px-4 py-2 text-sm border rounded-md" onClick={() => setEditingSession(null)}>Cancel</button>
                        <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md" onClick={() => handleSaveFeedback(session.id)}>
                          Save Feedback
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-sm italic text-muted-foreground whitespace-pre-wrap">
                        {session.clientFeedback ? `"${session.clientFeedback}"` : "No feedback logged yet."}
                      </div>
                      <button 
                        className="text-sm text-primary underline mt-2"
                        onClick={() => {
                          setEditingSession(session.id)
                          setFeedbackText(session.clientFeedback || "")
                        }}
                      >
                        {session.clientFeedback ? "Edit Feedback" : "Add Feedback"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
