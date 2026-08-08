import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from "@/hooks/use-toast"
import { Plus, Mail, Phone } from "lucide-react"
import api from '../../../lib/api';

export default function Suppliers() {
  const { token } = useAuthStore()
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/cafe/suppliers', { headers: { Authorization: `Bearer ${token}` } })
      setSuppliers(res.data?.items || res.data || [])
    } catch (error) {
      console.error('Failed to fetch suppliers', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load suppliers." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchSuppliers()
  }, [token])

  const handleAdd = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/cafe/suppliers', form, { headers: { Authorization: `Bearer ${token}` } })
      toast({ title: "Success", description: "Supplier added." })
      setShowAddForm(false)
      setForm({ name: '', contactName: '', email: '', phone: '' })
      fetchSuppliers()
    } catch (error) {
      console.error('Failed to add supplier', error)
      toast({ variant: "destructive", title: "Error", description: "Failed to add supplier." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Suppliers</CardTitle>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-card hover:bg-slate-800 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Supplier
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-background p-4 rounded-lg border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Person</label>
              <input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="mb-0">Save</Button>
            </div>
          </form>
        )}

        <div className="rounded-md border border-border">
          <Table>
            <TableHeader className="bg-background">
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Loading suppliers...</TableCell></TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No suppliers found</TableCell></TableRow>
              ) : (
                suppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactName || '-'}</TableCell>
                    <TableCell className="space-y-1">
                      {supplier.email && <div className="flex items-center text-xs text-slate-600"><Mail className="h-3 w-3 mr-2" />{supplier.email}</div>}
                      {supplier.phone && <div className="flex items-center text-xs text-slate-600"><Phone className="h-3 w-3 mr-2" />{supplier.phone}</div>}
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
