import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function LeaveBalance() {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Adjustment state
  const [editingBalance, setEditingBalance] = useState(null)
  const [allocatedInput, setAllocatedInput] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchBalances = async () => {
    try {
      const response = await api.get('/api/leave/balances')
      setBalances(response.data || [])
    } catch (error) {
      console.error("Failed to fetch leave balances:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [])

  const handleEditClick = (bal) => {
    setEditingBalance(bal)
    setAllocatedInput(bal.allocated || 0)
  }

  const handleSaveAdjustment = async (e) => {
    e.preventDefault()
    if (!editingBalance) return

    setIsSubmitting(true)
    try {
      await api.post('/api/leave/balances/adjust', {
        employeeId: editingBalance.employeeId,
        leaveTypeId: editingBalance.leaveTypeId,
        year: editingBalance.year,
        allocated: parseInt(allocatedInput) || 0
      })
      toast({ title: "Success", description: "Leave allocation adjusted successfully." })
      setEditingBalance(null)
      fetchBalances()
    } catch (error) {
      console.error("Failed to adjust balance", error)
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to adjust leave balance" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Balances</h1>
          <p className="text-muted-foreground">View and adjust employee leave allocations and usage.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Balances</CardTitle>
          <CardDescription>Current year leave balances across all leave types.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading balances...</div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background">
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Carried Forward</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No balances found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    balances.map((bal) => (
                      <TableRow key={bal.id} className="hover:bg-background/50">
                        <TableCell className="font-medium">
                          {bal.employee?.firstName} {bal.employee?.lastName}
                        </TableCell>
                        <TableCell>{bal.leaveType?.name}</TableCell>
                        <TableCell>{bal.allocated}</TableCell>
                        <TableCell>{bal.carriedForward}</TableCell>
                        <TableCell>{bal.used}</TableCell>
                        <TableCell className="font-bold text-foreground">{bal.balance}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-slate-700"
                            onClick={() => handleEditClick(bal)}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
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

      <Dialog open={!!editingBalance} onOpenChange={(open) => !open && setEditingBalance(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Leave Allocation</DialogTitle>
            <DialogDescription>
              Modify the allocated days for this leave type.
            </DialogDescription>
          </DialogHeader>
          {editingBalance && (
            <form onSubmit={handleSaveAdjustment} className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Input disabled value={`${editingBalance.employee?.firstName} ${editingBalance.employee?.lastName}`} />
                </div>
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Input disabled value={editingBalance.leaveType?.name} />
                </div>
                <div className="space-y-2">
                  <Label>Allocated Days ({editingBalance.year})</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    required
                    value={allocatedInput} 
                    onChange={e => setAllocatedInput(e.target.value)} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingBalance(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
