import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import { Plus, PackagePlus } from "lucide-react"
import api from '../../../lib/api';

export default function MenuInventory() {
  const { token } = useAuthStore()
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemForm, setNewItemForm] = useState({ name: '', description: '', price: '', stock: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/cafe/menu', { headers: { Authorization: `Bearer ${token}` } })
      setItems(res.data?.items || res.data || [])
    } catch (error) {
      console.error('Failed to fetch inventory', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load menu inventory." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchItems()
  }, [token])

  const handleAddItem = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/cafe/menu', {
        name: newItemForm.name,
        description: newItemForm.description,
        price: Number(newItemForm.price),
        stock: Number(newItemForm.stock)
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast({ title: "Success", description: "Menu item added." })
      setShowAddForm(false)
      setNewItemForm({ name: '', description: '', price: '', stock: '' })
      fetchItems()
    } catch (error) {
      console.error('Failed to add item', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to add menu item." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStock = async (id) => {
    const amount = window.prompt("Enter amount to add to stock (e.g. 10):")
    if (!amount || isNaN(amount)) return

    try {
      await api.post('/api/cafe/inventory/stock', {
        itemId: id,
        quantity: Number(amount),
        type: 'IN'
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast({ title: "Success", description: "Stock updated." })
      fetchItems()
    } catch (error) {
      console.error('Failed to update stock', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to update stock." })
    }
  }

  const handleMarkOutOfStock = async (id, currentStock) => {
    try {
      if (currentStock > 0) {
        await api.post('/api/cafe/inventory/stock', {
          itemId: id,
          quantity: currentStock,
          type: 'OUT',
          notes: 'Marked Out of Stock'
        }, { headers: { Authorization: `Bearer ${token}` } })
      }
      await api.put(`/api/cafe/menu/${id}`, {
        isAvailable: false
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      toast({ title: "Success", description: "Item marked out of stock." })
      fetchItems()
    } catch (error) {
      console.error('Failed to mark out of stock', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to update item status." })
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Menu & Inventory</CardTitle>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-card hover:bg-slate-800 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Menu Item
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleAddItem} className="bg-background p-4 rounded-lg border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input required value={newItemForm.name} onChange={e => setNewItemForm({...newItemForm, name: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. Espresso" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input value={newItemForm.description} onChange={e => setNewItemForm({...newItemForm, description: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. Double shot..." />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" step="0.01" min="0" required value={newItemForm.price} onChange={e => setNewItemForm({...newItemForm, price: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">Initial Stock</label>
              <input type="number" min="0" required value={newItemForm.stock} onChange={e => setNewItemForm({...newItemForm, stock: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <Button type="submit" disabled={isSubmitting}>Save</Button>
          </form>
        )}

        <div className="rounded-md border border-border">
          <Table>
            <TableHeader className="bg-background">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Loading inventory...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No items found</TableCell></TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name} {!item.isAvailable && <Badge variant="outline" className="ml-2">Unavailable</Badge>}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
                    <TableCell>₹{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.stock <= 5 ? 'destructive' : 'secondary'}>
                        {item.stock} in stock
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStock(item.id)}>
                          <PackagePlus className="h-4 w-4 mr-2" /> Add Stock
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleMarkOutOfStock(item.id, item.stock)}>
                          Out of Stock
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
