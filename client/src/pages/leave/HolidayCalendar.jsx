import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/useAuthStore"
import api from '../../lib/api';

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const { token, hasRole  } = useAuthStore()
  const canManage = hasRole('OWNER') || hasRole('MANAGER')

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: ''
  })

  const fetchHolidays = async () => {
    try {
      const response = await api.get('/api/leave/holidays')
      if (response.data) {
        setHolidays(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch holidays:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  const handleCreateHoliday = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/leave/holidays', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast({ title: "Success", description: "Holiday created successfully." })
      setIsDialogOpen(false)
      setFormData({ name: '', date: '', description: '' })
      fetchHolidays()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create holiday." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteHoliday = async (id) => {
    try {
      await api.delete(`/api/leave/holidays/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast({ title: "Success", description: "Holiday deleted successfully." })
      fetchHolidays()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete holiday." })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Holiday Calendar</h1>
          <p className="text-muted-foreground">Manage company-wide and department-specific holidays.</p>
        </div>
        
        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Holiday</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateHoliday} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Holiday Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Independence Day"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    required 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Optional description"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Holiday"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Holidays</CardTitle>
          <CardDescription>All configured holidays for the current year.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading holidays...</div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background">
                    <TableHead>Date</TableHead>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Department</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No holidays configured for this year.
                      </TableCell>
                    </TableRow>
                  ) : (
                    holidays.map((hol) => (
                      <TableRow key={hol.id} className="hover:bg-background/50">
                        <TableCell className="font-medium">
                          {new Date(hol.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{hol.name}</TableCell>
                        <TableCell>{hol.description || '-'}</TableCell>
                        <TableCell>{hol.department?.name || 'All Departments'}</TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteHoliday(hol.id)}>
                              Delete
                            </Button>
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
