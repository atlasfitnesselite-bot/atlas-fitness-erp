import { CustomSelect } from '@/components/ui/custom-select';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, AlertTriangle, PenTool, Calendar, CheckCircle } from "lucide-react"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import api from '../../lib/api';

export default function Maintenance() {
  const { token, user } = useAuthStore()
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ equipment: '', issue: '', priority: 'MEDIUM' })
  const { toast } = useToast()

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/facilities/maintenance', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTickets(res.data)
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load tickets." })
    }
  }

  useEffect(() => {
    if (token) fetchTickets()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/facilities/maintenance', { ...formData, reportedBy: user?.firstName || 'Staff' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast({ title: "Success", description: "Issue reported successfully." })
      setShowForm(false)
      setFormData({ equipment: '', issue: '', priority: 'MEDIUM' })
      fetchTickets()
    } catch (error) {
      console.error('Failed to create ticket', error)
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create ticket." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resolveTicket = async (id) => {
    try {
      await api.put(`/api/facilities/maintenance/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast({ title: "Resolved", description: "Ticket marked as resolved." })
      fetchTickets()
    } catch (error) {
      console.error('Failed to resolve ticket', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to resolve ticket." })
    }
  }

  const activeIssues = tickets.filter(t => t.status !== 'RESOLVED')
  const resolvedIssues = tickets.filter(t => t.status === 'RESOLVED')

  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Maintenance & Repairs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track equipment downtime, repair logs, and scheduled service.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-rose-600 hover:bg-rose-700 text-white flex gap-2">
          <AlertTriangle className="h-4 w-4" /> {showForm ? 'Cancel' : 'Report Issue'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Report New Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Equipment</label>
                <input required value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. Treadmill #4" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issue Description</label>
                <textarea required value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})} className="w-full border rounded p-2 text-sm" rows={3} placeholder="What is wrong with it?" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <CustomSelect value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border rounded p-2 text-sm">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </CustomSelect>
              </div>
              <Button type="submit">Submit Ticket</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-rose-600 text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-rose-100 mb-1">Active Issues</p>
            <h3 className="text-3xl font-bold text-white">{activeIssues.length}</h3>
            <div className="mt-4 text-sm font-medium text-rose-100 flex items-center gap-1">
              <Wrench className="h-4 w-4" /> Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Active Issues</CardTitle>
            <CardDescription>Equipment currently requiring attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIssues.length === 0 ? <p className="text-sm text-muted-foreground">No active issues.</p> : activeIssues.map((issue) => (
                <div key={issue.id} className="p-4 border border-rose-100 bg-rose-50/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      {issue.equipment}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${issue.priority === 'HIGH' || issue.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {issue.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{issue.issue}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Reported by: {issue.reportedBy}</span>
                    <Button onClick={() => resolveTicket(issue.id)} size="sm" variant="outline" className="h-7 text-xs">Mark Resolved</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Repairs</CardTitle>
            <CardDescription>Log of completed service tickets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-border ml-3 space-y-6">
              {resolvedIssues.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <span className="absolute -left-3 top-1 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center ring-4 ring-white">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </span>
                  <h4 className="font-bold text-foreground text-sm">{log.equipment}</h4>
                  <p className="text-sm text-slate-600 mt-1">{log.issue}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(log.resolvedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {resolvedIssues.length === 0 && <p className="text-sm text-muted-foreground pl-6">No completed repairs yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
