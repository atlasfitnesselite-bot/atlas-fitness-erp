import { CustomSelect } from '@/components/ui/custom-select';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coffee, ShoppingBag, TrendingUp, PackageSearch } from "lucide-react"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import api from '../../lib/api';

export default function CafeManagement() {
  const { token } = useAuthStore()
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderForm, setOrderForm] = useState({ itemId: '', quantity: 1 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchCafeData = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        api.get('/api/cafe/inventory', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/cafe/orders', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setInventory(invRes.data)
      setOrders(ordRes.data)
    } catch (error) {
      console.error('Failed to fetch cafe data', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load cafe data." })
    }
  }

  useEffect(() => {
    if (token) fetchCafeData()
  }, [token])

  const handleOrder = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/cafe/orders', 
        { itemId: orderForm.itemId, quantity: Number(orderForm.quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({ title: "Success", description: "Order processed successfully." })
      setShowOrderForm(false)
      fetchCafeData()
    } catch (error) {
      console.error('Failed to submit order', error)
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to submit order." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRestock = async (id) => {
    try {
      await api.put(`/api/cafe/inventory/${id}/restock`, 
        { amount: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({ title: "Success", description: "Inventory restocked." })
      fetchCafeData()
    } catch (error) {
      console.error('Failed to restock', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to restock item." })
    }
  }

  const todaySales = orders.reduce((acc, order) => acc + order.totalAmount, 0)
  const itemsSold = orders.reduce((acc, order) => acc + order.quantity, 0)

  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cafe Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage cafe orders, inventory, and point of sale.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowOrderForm(!showOrderForm)} className="bg-amber-600 hover:bg-amber-700 text-white flex gap-2">
            <ShoppingBag className="h-4 w-4" /> {showOrderForm ? 'Cancel' : 'New Order'}
          </Button>
        </div>
      </div>

      {showOrderForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Create POS Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrder} className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Item</label>
                <CustomSelect required value={orderForm.itemId} onChange={e => setOrderForm({...orderForm, itemId: e.target.value})} className="w-full border rounded p-2 text-sm">
                  <option value="">Select an item...</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id} disabled={item.stock === 0}>{item.name} (${item.price}) {item.stock === 0 ? '- OUT OF STOCK' : ''}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" min="1" required value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <Button type="submit">Submit Order</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-100 mb-1">Today's Sales</p>
                <h3 className="text-3xl font-bold text-white">?{todaySales.toFixed(2)}</h3>
              </div>
              <div className="h-10 w-10 bg-amber-500/50 rounded-lg flex items-center justify-center">
                <Coffee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Items Sold</p>
                <h3 className="text-3xl font-bold text-foreground">{itemsSold}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest POS transactions from the cafe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? <p className="text-muted-foreground">No orders yet.</p> : orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-slate-100">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Order <span className="text-muted-foreground font-normal ml-2">{new Date(order.createdAt).toLocaleTimeString()}</span></p>
                    <p className="text-sm text-slate-600 mt-0.5">{order.quantity}x {order.item?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">?{order.totalAmount.toFixed(2)}</p>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items that need to be reordered soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.filter(i => i.stock <= i.minStock).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-rose-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                      <PackageSearch className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-rose-600 font-medium mt-0.5">Stock: {item.stock} (Min: {item.minStock})</p>
                    </div>
                  </div>
                  <Button onClick={() => handleRestock(item.id)} size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                    Restock
                  </Button>
                </div>
              ))}
              {inventory.filter(i => i.stock <= i.minStock).length === 0 && <p className="text-muted-foreground">All items are sufficiently stocked.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
