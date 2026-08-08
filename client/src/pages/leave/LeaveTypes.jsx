import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import api from '../../lib/api';

export default function LeaveTypes() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isPaid: true,
    maxDaysPerYear: 10,
    carryForwardAllowed: false,
    requiresApproval: true
  })

  const fetchTypes = async () => {
    try {
      const response = await api.get('/api/leave/types')
      if (response.data) {
        setTypes(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch leave types:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation for duplicate code
    if (types.some(t => t.code.toLowerCase() === formData.code.toLowerCase())) {
      toast({ variant: "destructive", title: "Error", description: "Leave type code already exists. Please use a unique code." })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.post('/api/leave/types', formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      toast({ title: "Success", description: "Leave type created successfully." })
      setIsDialogOpen(false)
      fetchTypes()
      setFormData({
        name: '', code: '', description: '', isPaid: true, maxDaysPerYear: 10, carryForwardAllowed: false, requiresApproval: true
      })
    } catch (error) {
      if (error.response?.status !== 400) {
        console.error("Failed to create leave type", error)
      }
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create leave type" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Types</h1>
          <p className="text-muted-foreground">Manage all company leave policies and types.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Leave Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Leave Type</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required placeholder="e.g. Sick Leave" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input required placeholder="e.g. SL" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Short description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Days Per Year</Label>
                  <Input required type="number" min="0" value={formData.maxDaysPerYear} onChange={e => setFormData({...formData, maxDaysPerYear: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="flex flex-col gap-3 py-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={formData.isPaid} onChange={e => setFormData({...formData, isPaid: e.target.checked})} className="rounded border-slate-300" />
                  Is Paid Leave
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={formData.carryForwardAllowed} onChange={e => setFormData({...formData, carryForwardAllowed: e.target.checked})} className="rounded border-slate-300" />
                  Allow Carry Forward
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={formData.requiresApproval} onChange={e => setFormData({...formData, requiresApproval: e.target.checked})} className="rounded border-slate-300" />
                  Requires Approval
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Leave Type"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Leave Types</CardTitle>
          <CardDescription>Default and custom leave types for your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading leave types...</div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background">
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Max Days/Year</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Carry Forward</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No leave types found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    types.map((lt) => (
                      <TableRow key={lt.id} className="hover:bg-background/50">
                        <TableCell className="font-medium">{lt.code}</TableCell>
                        <TableCell>{lt.name}</TableCell>
                        <TableCell>{lt.maxDaysPerYear}</TableCell>
                        <TableCell>
                          <Badge variant={lt.isPaid ? "default" : "secondary"} className={lt.isPaid ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                            {lt.isPaid ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lt.carryForwardAllowed ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lt.status === 'ACTIVE' ? "default" : "destructive"}>
                            {lt.status}
                          </Badge>
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
    </div>
  )
}
