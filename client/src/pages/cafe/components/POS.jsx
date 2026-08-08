import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import api from '../../../lib/api';

export default function POS() {
  const { token } = useAuthStore()
  const { toast } = useToast()
  
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchMenu = async () => {
    setLoading(true)
    try {
      // It might be data.items or data depending on how the backend returns it
      const res = await api.get('/api/cafe/menu', { headers: { Authorization: `Bearer ${token}` } })
      setMenuItems(res.data?.items || res.data || [])
    } catch (error) {
      console.error('Failed to fetch menu', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load menu items." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchMenu()
  }, [token])

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setSubmitting(true)
    try {
      const orderData = {
        items: cart.map(item => ({
          itemId: item.id,
          quantity: item.quantity
        })),
        totalAmount: calculateTotal()
      }
      await api.post('/api/cafe/orders', orderData, { headers: { Authorization: `Bearer ${token}` } })
      toast({ title: "Success", description: "Order placed successfully!" })
      setCart([])
      fetchMenu() // Refresh stock
    } catch (error) {
      console.error('Failed to place order', error)
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to place order." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="border-border min-h-[600px]">
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <CardDescription>Select items to add to the cart.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading menu...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <Card key={item.id} className="border-border overflow-hidden flex flex-col justify-between">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
                        <Badge variant="outline" className="font-semibold shrink-0">₹{Number(item.price).toFixed(2)}</Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-2 mt-1">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 pb-2 mt-auto">
                      <div className="mb-3">
                        <Badge variant={item.stock <= 5 ? 'destructive' : 'secondary'}>
                          Stock: {item.stock}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => addToCart(item)} 
                        disabled={item.stock === 0}
                        className="w-full bg-card hover:bg-slate-800 text-white"
                        size="sm"
                      >
                        {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {menuItems.length === 0 && <p className="text-muted-foreground col-span-3">No menu items available.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <Card className="border-border sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Current Order
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px] flex flex-col">
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Cart is empty
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between w-full text-lg font-bold">
              <span>Total</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white" 
              size="lg"
              onClick={handleCheckout}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
