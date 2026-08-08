import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Receipt } from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';

export default function CafeExpenses() {
  const { token } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Inventory'
  });

  const categories = ['Inventory', 'Equipment', 'Maintenance', 'Supplies', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cafe/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to load cafe expenses', err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/cafe/expenses', {
        ...formData,
        amount: Number(formData.amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Expense added successfully');
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Inventory'
      });
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add New Expense
          </CardTitle>
          <CardDescription>Record a new cafe-related expense</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/4">
              <Label className="mb-1 block">Amount (₹)</Label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                required 
              />
            </div>
            <div className="w-full md:w-1/4">
              <Label className="mb-1 block">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <Label className="mb-1 block">Description</Label>
              <Input 
                placeholder="e.g. Coffee beans restock" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>
            <div className="w-full md:w-1/4">
              <Label className="mb-1 block">Date</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                required 
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full md:w-auto">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Expense History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, i) => (
                    <tr key={expense.id || i} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-6 py-4">{format(new Date(expense.date || expense.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 font-medium">{expense.description}</td>
                      <td className="px-6 py-4">
                        <span className="bg-muted px-2 py-1 rounded text-xs">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-500">
                        -₹{Number(expense.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No expenses recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
