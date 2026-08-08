import { CustomSelect } from '@/components/ui/custom-select';
import React, { useState, useEffect } from 'react'
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Wrench } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function AssetsDashboard() {
  const { token } = useAuthStore()
  const { toast } = useToast()

  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'EQUIPMENT',
    purchaseDate: '',
    purchasePrice: '',
    vendor: ''
  })

  const fetchAssets = async () => {
    if (!token) return
    try {
      setLoading(true)
      const { data } = await api.get('/api/assets', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssets(Array.isArray(data) ? data : data.assets || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch assets'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return

    try {
      setSubmitting(true)
      await api.post('/api/assets', {
        ...formData,
        purchasePrice: Number(formData.purchasePrice)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast({
        title: "Success",
        description: "Asset created successfully"
      })
      setOpen(false)
      setFormData({
        name: '',
        category: 'EQUIPMENT',
        purchaseDate: '',
        purchasePrice: '',
        vendor: ''
      })
      fetchAssets()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to create asset'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogMaintenance = async (id) => {
    try {
      await api.put(`/api/assets/${id}/maintenance`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast({
        title: "Success",
        description: "Maintenance logged successfully"
      })
      fetchAssets()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to log maintenance'
      })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
      case 'MAINTENANCE':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Maintenance</Badge>
      case 'RETIRED':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Retired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assets</h1>
          <p className="text-muted-foreground mt-2">Manage company assets, equipment, and maintenance schedules.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Asset Directory</CardTitle>
          <CardDescription>A complete list of all registered assets.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No assets found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => (
                      <TableRow key={asset._id || asset.id}>
                        <TableCell className="font-medium text-foreground">{asset.name}</TableCell>
                        <TableCell>{asset.category}</TableCell>
                        <TableCell>{asset.vendor}</TableCell>
                        <TableCell>
                          {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {asset.purchasePrice ? `?${asset.purchasePrice.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-foreground"
                            onClick={() => handleLogMaintenance(asset._id || asset.id)}
                            disabled={asset.status === 'RETIRED'}
                          >
                            <Wrench className="w-4 h-4" />
                            Log Maint.
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Enter the details of the new asset below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. MacBook Pro M2"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <CustomSelect
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="IT">IT</option>
                  <option value="OTHER">Other</option>
                </CustomSelect>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  name="vendor"
                  placeholder="e.g. Apple Inc."
                  value={formData.vendor}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">Purchase Price (?)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
