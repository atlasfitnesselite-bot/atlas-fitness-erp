import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import { Clock, ChefHat, CheckCircle2 } from "lucide-react"
import api from '../../../lib/api';

export default function KitchenDisplay() {
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
    // Optional: setup a polling interval here to refresh orders every 10-30s
    const interval = setInterval(() => {
      if(token) fetchOrders()
    }, 15000)
    return () => clearInterval(interval)
  }, [token])

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/cafe/orders/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } })
      toast({ title: "Status Updated", description: `Order moved to ${newStatus}.` })
      fetchOrders()
    } catch (error) {
      console.error('Failed to update status', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to update order status." })
    }
  }

  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
  const pendingOrders = activeOrders.filter(o => o.status === 'PENDING')
  const preparingOrders = activeOrders.filter(o => o.status === 'PREPARING')
  const readyOrders = activeOrders.filter(o => o.status === 'READY')

  const OrderCard = ({ order, onNextAction, nextActionLabel, nextActionStatus, icon: Icon, colorClass }) => (
    <Card className="border-border shadow-sm mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            Order #{order.id?.toString().slice(-4) || '---'}
          </CardTitle>
          <Badge className={colorClass}>{order.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Icon className="h-3 w-3" /> {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-4 space-y-2">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="font-medium">{item.quantity}x {item.menuItem?.name || item.name || 'Item'}</span>
          </div>
        ))}
        {(!order.items || order.items.length === 0) && (
          <div className="flex justify-between text-sm">
            <span className="font-medium">{order.quantity || 1}x {order.item?.name || 'Item'}</span>
          </div>
        )}
      </CardContent>
      {onNextAction && (
        <CardFooter className="p-4 pt-0">
          <Button onClick={() => updateStatus(order.id, nextActionStatus)} className="w-full" variant="outline">
            {nextActionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  )

  if (loading && orders.length === 0) {
    return <p className="text-muted-foreground">Loading orders...</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-100 p-4 rounded-xl">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
          <span>Pending</span>
          <Badge variant="secondary">{pendingOrders.length}</Badge>
        </h3>
        <div className="space-y-4">
          {pendingOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onNextAction={true} 
              nextActionLabel="Start Preparing" 
              nextActionStatus="PREPARING"
              icon={Clock}
              colorClass="bg-amber-100 text-amber-700 hover:bg-amber-100"
            />
          ))}
          {pendingOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No pending orders</p>}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl">
        <h3 className="font-semibold text-blue-700 mb-4 flex items-center justify-between">
          <span>Preparing</span>
          <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200">{preparingOrders.length}</Badge>
        </h3>
        <div className="space-y-4">
          {preparingOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onNextAction={true} 
              nextActionLabel="Mark as Ready" 
              nextActionStatus="READY"
              icon={ChefHat}
              colorClass="bg-blue-100 text-blue-700 hover:bg-blue-100"
            />
          ))}
          {preparingOrders.length === 0 && <p className="text-sm text-blue-400 text-center py-4">No orders in prep</p>}
        </div>
      </div>

      <div className="bg-emerald-50 p-4 rounded-xl">
        <h3 className="font-semibold text-emerald-700 mb-4 flex items-center justify-between">
          <span>Ready to Serve</span>
          <Badge className="bg-emerald-200 text-emerald-800 hover:bg-emerald-200">{readyOrders.length}</Badge>
        </h3>
        <div className="space-y-4">
          {readyOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onNextAction={true} 
              nextActionLabel="Complete Order" 
              nextActionStatus="COMPLETED"
              icon={CheckCircle2}
              colorClass="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
            />
          ))}
          {readyOrders.length === 0 && <p className="text-sm text-emerald-400 text-center py-4">No ready orders</p>}
        </div>
      </div>
    </div>
  )
}
