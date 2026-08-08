import { useEffect, useState } from "react"
import api from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { 
  Coffee, ShoppingCart, IndianRupee, Package,
  Clock, Calendar, ChefHat, CheckCircle2, AlertCircle, Plus, Minus, Search, Trash2, TrendingUp, LogIn, LogOut,
  Loader2, ShieldCheck, FileSignature, Timer, Activity 
} from "lucide-react"
import MyUpcomingShifts from "./MyUpcomingShifts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CafeDashboard() {
  const { user, token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("orders")

  // State for data
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [checklists, setChecklists] = useState([])
  const [prepLogs, setPrepLogs] = useState([])
  const [hygieneLogs, setHygieneLogs] = useState([])
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)

  // Form states
  const [prepForm, setPrepForm] = useState({ itemName: '', quantity: '', expiryDate: '', notes: '' })
  const [hygieneForm, setHygieneForm] = useState({ area: '', status: 'PASS', notes: '' })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      const [ordersRes, invRes, checklistsRes, prepRes, hygieneRes, attRes] = await Promise.all([
        api.get('/api/cafe/orders', { headers }).catch(() => ({ data: [] })),
        api.get('/api/cafe/menu', { headers }).catch(() => ({ data: [] })),
        api.get('/api/cafe/checklists', { headers }).catch(() => ({ data: [] })),
        api.get('/api/cafe/prep-logs', { headers }).catch(() => ({ data: [] })),
        api.get('/api/cafe/hygiene-logs', { headers }).catch(() => ({ data: [] })),
        api.get('/api/attendance/me/status', { headers }).catch(() => ({ data: null }))
      ])

      setOrders(ordersRes.data || [])
      setInventory(invRes.data || [])
      setChecklists(checklistsRes.data || [])
      setPrepLogs(prepRes.data || [])
      setHygieneLogs(hygieneRes.data || [])

      if (attRes.data && attRes.data.clockIn) {
        setIsClockedIn(!attRes.data.clockOut)
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // Handlers
  const handleClockInOut = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      
      // First verify current status to prevent 400 errors
      const statusRes = await api.get('/api/attendance/me/status', { headers }).catch(() => ({ data: null }));
      const currentData = statusRes.data?.data || statusRes.data;
      const currentlyClockedIn = currentData?.status === 'active' || (currentData?.clockIn && !currentData?.clockOut);
      
      if (!isClockedIn && currentlyClockedIn) {
         setIsClockedIn(true);
         return toast.info("You are already clocked in");
      } else if (isClockedIn && !currentlyClockedIn && currentData?.clockOut) {
         setIsClockedIn(false);
         return toast.info("You are already clocked out");
      }

      const endpoint = currentlyClockedIn ? '/api/attendance/me/clock-out' : '/api/attendance/me/clock-in'
      await api.post(endpoint, {}, { headers })
      toast.success(`Successfully clocked ${currentlyClockedIn ? 'out' : 'in'}`)
      setIsClockedIn(!currentlyClockedIn)
      setIsOnBreak(false)
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.toLowerCase().includes('already')) {
        setIsClockedIn(true);
        toast.info(error.response?.data?.message || "You are already clocked in");
      } else {
        toast.error(error.response?.data?.message || "Attendance action failed")
      }
    }
  }

  const handleBreak = async () => {
    if (!isClockedIn) return toast.error("Must be clocked in to take a break")
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const endpoint = isOnBreak ? '/api/attendance/me/end-break' : '/api/attendance/me/start-break'
      await api.post(endpoint, {}, { headers })
      toast.success(`Break ${isOnBreak ? 'ended' : 'started'}`)
      setIsOnBreak(!isOnBreak)
    } catch (error) {
      toast.error(error.response?.data?.message || "Break action failed")
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
            await api.put(`/api/cafe/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success("Order status updated")
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  const submitPrepLog = async (e) => {
    e.preventDefault()
    try {
            await api.post('/api/cafe/prep-logs', { ...prepForm, preparedBy: user.name || user.email }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success("Prep log submitted")
      setPrepForm({ itemName: '', quantity: '', expiryDate: '', notes: '' })
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to submit prep log")
    }
  }

  const submitHygieneLog = async (e) => {
    e.preventDefault()
    try {
            await api.post('/api/cafe/hygiene-logs', { ...hygieneForm, cleanedBy: user.name || user.email }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success("Hygiene log submitted")
      setHygieneForm({ area: '', status: 'PASS', notes: '' })
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to submit hygiene log")
    }
  }

  const submitChecklist = async (type) => {
    try {
            await api.post('/api/cafe/checklists', { type, items: ['Completed all tasks'], completedBy: user.name || user.email }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success(`${type} checklist submitted`)
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to submit checklist")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Kitchen & Cafe Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Kitchen Staff"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={isOnBreak ? "destructive" : "outline"} onClick={handleBreak} disabled={!isClockedIn}>
            <Timer className="h-4 w-4 mr-2" />
            {isOnBreak ? "End Break" : "Start Break"}
          </Button>
          <Button variant={isClockedIn ? "destructive" : "default"} onClick={handleClockInOut}>
            <Clock className="h-4 w-4 mr-2" />
            {isClockedIn ? "Clock Out" : "Clock In"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status !== 'COMPLETED').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.filter(i => i.stock <= i.minStock).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hygiene Logs Today</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hygieneLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prep Logs Today</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prepLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border w-full justify-start h-auto flex-wrap p-1">
          <TabsTrigger value="orders">Food Orders</TabsTrigger>
          <TabsTrigger value="logs">Prep & Hygiene</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Manage incoming cafe and kitchen orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.filter(o => o.status !== 'COMPLETED').map(order => (
                  <div key={order.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-background">
                    <div>
                      <p className="font-medium">{order.item?.name || 'Unknown Item'} x {order.quantity}</p>
                      <p className="text-sm text-muted-foreground">Status: <span className="font-semibold">{order.status}</span> | Ordered: {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="mt-4 md:mt-0 space-x-2 flex">
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'PREPARING')}>Preparing</Button>
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'READY')}>Ready</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateOrderStatus(order.id, 'COMPLETED')}>Complete</Button>
                    </div>
                  </div>
                ))}
                {orders.filter(o => o.status !== 'COMPLETED').length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No active orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Food Preparation Log</CardTitle>
                <CardDescription>Log newly prepared food items</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitPrepLog} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input value={prepForm.itemName} onChange={e => setPrepForm({...prepForm, itemName: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input type="number" value={prepForm.quantity} onChange={e => setPrepForm({...prepForm, quantity: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input type="date" value={prepForm.expiryDate} onChange={e => setPrepForm({...prepForm, expiryDate: e.target.value})} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Submit Prep Log</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kitchen Hygiene Log</CardTitle>
                <CardDescription>Record routine cleaning and hygiene checks</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitHygieneLog} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Area / Equipment</Label>
                    <Input value={hygieneForm.area} onChange={e => setHygieneForm({...hygieneForm, area: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={hygieneForm.status} onValueChange={v => setHygieneForm({...hygieneForm, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASS">Pass</SelectItem>
                        <SelectItem value="FAIL">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea value={hygieneForm.notes} onChange={e => setHygieneForm({...hygieneForm, notes: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Submit Hygiene Log</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Operations</CardTitle>
              <CardDescription>Submit your opening and closing procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center border-orange-200 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-900 dark:hover:bg-orange-900/50 dark:text-orange-100 text-slate-900" onClick={() => submitChecklist('OPENING')}>
                  <Activity className="h-6 w-6 text-orange-500 mb-2" />
                  Submit Opening Checklist
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900 dark:hover:bg-indigo-900/50 dark:text-indigo-100 text-slate-900" onClick={() => submitChecklist('CLOSING')}>
                  <CheckCircle2 className="h-6 w-6 text-indigo-500 mb-2" />
                  Submit Closing Checklist
                </Button>
              </div>

              <h3 className="font-semibold text-lg mb-4">Recent Submissions</h3>
              <div className="space-y-2">
                {checklists.slice(0, 5).map(c => (
                  <div key={c.id} className="flex justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{c.type} Checklist</p>
                      <p className="text-xs text-muted-foreground">By: {c.completedBy}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
           <Card>
            <CardHeader>
              <CardTitle>Kitchen Inventory</CardTitle>
              <CardDescription>Current stock levels and minimum thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventory.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Min Stock: {item.minStock}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${item.stock <= item.minStock ? 'text-red-500' : 'text-green-600'}`}>{item.stock} in stock</span>
                    </div>
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No inventory items found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      <MyUpcomingShifts />
    </div>
  )
}
