import { CustomSelect } from '@/components/ui/custom-select';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, ClipboardList, Plus } from "lucide-react"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import api from '../../lib/api';

export default function CleaningChecklist() {
  const { token } = useAuthStore()
  const [zones, setZones] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', shift: 'MORNING', tasks: '' })
  const { toast } = useToast()

  const fetchZones = async () => {
    try {
      const res = await api.get('/api/facilities/cleaning', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setZones(res.data)
    } catch (error) {
      console.error('Failed to fetch zones', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load cleaning zones." })
    }
  }

  useEffect(() => {
    if (token) fetchZones()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const taskArray = formData.tasks.split(',').map(t => ({ name: t.trim() })).filter(t => t.name)
      await api.post('/api/facilities/cleaning', 
        { name: formData.name, shift: formData.shift, tasks: taskArray }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({ title: "Success", description: "Cleaning zone added successfully." })
      setShowForm(false)
      setFormData({ name: '', shift: 'MORNING', tasks: '' })
      fetchZones()
    } catch (error) {
      console.error('Failed to create zone', error)
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create zone." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTask = async (taskId, currentStatus) => {
    try {
      await api.put(`/api/facilities/cleaning/task/${taskId}`, 
        { isCompleted: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchZones()
    } catch (error) {
      console.error('Failed to toggle task', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to update task status." })
    }
  }

  let totalTasks = 0
  let completedTasks = 0
  zones.forEach(z => {
    z.tasks.forEach(t => {
      totalTasks++
      if (t.isCompleted) completedTasks++
    })
  })

  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cleaning Checklist</h1>
          <p className="text-sm text-muted-foreground mt-1">Track daily hygiene, sanitation tasks, and area statuses.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2">
          {showForm ? <ClipboardList className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showForm ? 'Cancel' : 'Add Zone'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Add Cleaning Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Zone Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. Cardio Zone" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shift</label>
                <CustomSelect value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} className="w-full border rounded p-2 text-sm">
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tasks (comma separated)</label>
                <textarea required value={formData.tasks} onChange={e => setFormData({...formData, tasks: e.target.value})} className="w-full border rounded p-2 text-sm" rows={2} placeholder="Wipe treadmills, mop floor..." />
              </div>
              <Button type="submit">Create Zone</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-emerald-100 mb-1">Tasks Completed</p>
            <h3 className="text-3xl font-bold text-white">{completedTasks} / {totalTasks}</h3>
            <div className="mt-4 text-sm font-medium text-emerald-100">
              {totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}% completion rate
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {zones.length === 0 ? <p className="text-muted-foreground">No cleaning zones defined.</p> : zones.map((list) => (
          <Card key={list.id} className="border-border">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <CardDescription className="mt-1">{list.shift} Shift</CardDescription>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  list.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  list.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {list.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {list.tasks.map((task) => (
                  <div key={task.id} onClick={() => toggleTask(task.id, task.isCompleted)} className="flex items-center gap-3 cursor-pointer hover:bg-background p-1 -mx-1 rounded">
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${task.isCompleted ? 'text-muted-foreground line-through' : 'text-slate-700 font-medium'}`}>
                      {task.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
