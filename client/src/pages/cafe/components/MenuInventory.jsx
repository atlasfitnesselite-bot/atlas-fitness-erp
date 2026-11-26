import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { useToast } from '@/hooks/use-toast';
import { Plus, PackagePlus, Pencil } from 'lucide-react';
import api from '../../../lib/api';

const CATEGORIES = ['BEVERAGE', 'SNACK', 'MEAL', 'SUPPLEMENT', 'OTHER'];

export default function MenuInventory() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    description: '',
    category: 'BEVERAGE',
    price: '',
    gstRate: '0',
    stock: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editItem, setEditItem] = useState(null);

  const handleImageFile = (file, onLoaded) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onLoaded(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cafe/menu');
      setItems(res.data?.items || res.data || []);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load menu inventory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/cafe/menu', {
        name: newItemForm.name,
        description: newItemForm.description,
        category: newItemForm.category,
        price: Number(newItemForm.price),
        gstRate: Number(newItemForm.gstRate || 0),
        stock: Number(newItemForm.stock || 0),
        imageUrl: newItemForm.imageUrl || undefined,
        images: newItemForm.imageUrl ? [newItemForm.imageUrl] : [],
        isAvailable: true,
      });
      toast({ title: 'Success', description: 'Menu item added.' });
      setShowAddForm(false);
      setNewItemForm({ name: '', description: '', category: 'BEVERAGE', price: '', gstRate: '0', stock: '', imageUrl: '' });
      fetchItems();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add menu item.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await api.put(`/api/cafe/menu/${editItem.id}`, {
        name: editItem.name,
        description: editItem.description,
        category: editItem.category,
        price: Number(editItem.price),
        gstRate: Number(editItem.gstRate || 0),
        isAvailable: Boolean(editItem.isAvailable),
      });
      toast({ title: 'Updated', description: 'Menu item updated.' });
      setEditItem(null);
      fetchItems();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update menu item.' });
    }
  };

  const handleUpdateStock = async (id) => {
    const amount = window.prompt('Enter amount to add to stock (e.g. 10):');
    if (!amount || isNaN(amount)) return;

    try {
      await api.post('/api/cafe/inventory/stock', {
        itemId: id,
        quantity: Number(amount),
        type: 'IN',
      });
      toast({ title: 'Success', description: 'Stock updated.' });
      fetchItems();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update stock.' });
    }
  };

  const handleMarkOutOfStock = async (id, currentStock) => {
    try {
      if (currentStock > 0) {
        await api.post('/api/cafe/inventory/stock', {
          itemId: id,
          quantity: currentStock,
          type: 'OUT',
          notes: 'Marked Out of Stock',
        });
      }
      await api.put(`/api/cafe/menu/${id}`, { isAvailable: false });
      toast({ title: 'Success', description: 'Item marked out of stock.' });
      fetchItems();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update item status.' });
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Menu &amp; Inventory</CardTitle>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Menu Item
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleAddItem} className="bg-muted/40 p-4 rounded-lg border mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <Label className="text-xs">Name *</Label>
              <Input required value={newItemForm.name} onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })} placeholder="e.g. Protein Shake" />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <CustomSelect className="flex h-10 w-full rounded-md border border-border bg-card px-2 text-sm" value={newItemForm.category} onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </CustomSelect>
            </div>
            <div>
              <Label className="text-xs">Price (₹) *</Label>
              <Input type="number" step="0.01" min="0" required value={newItemForm.price} onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">GST (%)</Label>
              <Input type="number" step="0.1" min="0" value={newItemForm.gstRate} onChange={(e) => setNewItemForm({ ...newItemForm, gstRate: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Initial Stock *</Label>
              <Input type="number" min="0" required value={newItemForm.stock} onChange={(e) => setNewItemForm({ ...newItemForm, stock: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs">Description</Label>
              <Input value={newItemForm.description} onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Product Image (Optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0], (url) => setNewItemForm({ ...newItemForm, imageUrl: url }))} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">Save Item</Button>
          </form>
        )}

        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-background">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Loading inventory...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No items found</TableCell></TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name} {!item.isAvailable && <Badge variant="outline" className="ml-2">Unavailable</Badge>}
                    </TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell>₹{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>{item.gstRate ?? 0}%</TableCell>
                    <TableCell>
                      <Badge variant={item.stock <= 5 ? 'destructive' : 'secondary'}>
                        {item.stock} in stock
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditItem({ ...item })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStock(item.id)}>
                          <PackagePlus className="h-4 w-4 mr-1" /> Stock
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

      <Dialog open={Boolean(editItem)} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} required />
              </div>
              <div>
                <Label>Category</Label>
                <CustomSelect className="flex h-10 w-full rounded-md border border-border bg-card px-2 text-sm" value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </CustomSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (₹)</Label>
                  <Input type="number" step="0.01" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} required />
                </div>
                <div>
                  <Label>GST Rate (%)</Label>
                  <Input type="number" step="0.1" value={editItem.gstRate ?? 0} onChange={(e) => setEditItem({ ...editItem, gstRate: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={editItem.description || ''} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
