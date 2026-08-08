import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import { IndianRupee, ShoppingBag, TrendingUp } from "lucide-react"
import api from '../../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const { token } = useAuthStore()
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/cafe/orders', { headers: { Authorization: `Bearer ${token}` } })
      setOrders(res.data?.items || res.data || [])
    } catch (error) {
      console.error('Failed to fetch orders', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load orders." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchOrders()
  }, [token])

  const totalSales = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0)
  const totalOrders = orders.length
  
  // Calculate top selling items
  const itemSales = {}
  orders.forEach(order => {
    const items = order.items || []
    items.forEach(item => {
      const name = item.menuItem?.name || item.name || 'Unknown'
      if (!itemSales[name]) itemSales[name] = 0
      itemSales[name] += (item.quantity || 1)
    })
    // Also handle old format if it was just single item
    if (!order.items && order.item) {
      const name = order.item.name || 'Unknown'
      if (!itemSales[name]) itemSales[name] = 0
      itemSales[name] += (order.quantity || 1)
    }
  })

  const topItems = Object.keys(itemSales).map(key => ({
    name: key,
    sales: itemSales[key]
  })).sort((a, b) => b.sales - a.sales).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Sales</p>
                <h3 className="text-3xl font-bold text-foreground">₹{totalSales.toFixed(2)}</h3>
              </div>
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                <h3 className="text-3xl font-bold text-foreground">{totalOrders}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Order Value</p>
                <h3 className="text-3xl font-bold text-foreground">
                  ${totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00'}
                </h3>
              </div>
              <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-10">Loading chart data...</p>
          ) : topItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No sales data available yet.</p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
