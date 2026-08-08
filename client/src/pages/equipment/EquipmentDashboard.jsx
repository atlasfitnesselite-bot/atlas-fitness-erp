import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Plus, Activity, AlertTriangle, CheckCircle, 
  Wrench, ShieldAlert, Package, Calendar, MapPin, Tag
} from 'lucide-react';

export default function EquipmentDashboard() {
  const { token, hasRole } = useAuthStore();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFaultDialogOpen, setIsFaultDialogOpen] = useState(false);
  
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [faults, setFaults] = useState([]);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    equipmentId: '',
    category: 'GYM',
    brand: '',
    model: '',
    purchaseDate: '',
    purchasePrice: '',
    location: '',
    warrantyExpiry: '',
    lastServiceDate: '',
    nextServiceDate: '',
    notes: ''
  });
  
  const [faultData, setFaultData] = useState({
    description: '',
    severity: 'LOW'
  });

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      
      const response = await api.get('/api/equipment', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setEquipment(response.data);
    } catch (error) {
      toast.error('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [statusFilter, categoryFilter]);

  const fetchFaults = async (id) => {
    try {
      const response = await api.get(`/api/equipment/${id}/faults`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaults(response.data);
    } catch (error) {
      toast.error('Failed to fetch faults');
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.purchasePrice) payload.purchasePrice = parseFloat(payload.purchasePrice);
      else delete payload.purchasePrice;

      ['purchaseDate', 'warrantyExpiry', 'lastServiceDate', 'nextServiceDate'].forEach(key => {
        if (!payload[key]) delete payload[key];
        else payload[key] = new Date(payload[key]).toISOString();
      });

      await api.post('/api/equipment', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Equipment added successfully');
      setIsAddDialogOpen(false);
      fetchEquipment();
      setFormData({
        name: '', equipmentId: '', category: 'GYM', brand: '', model: '',
        purchaseDate: '', purchasePrice: '', location: '', warrantyExpiry: '', lastServiceDate: '', nextServiceDate: '', notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add equipment');
    }
  };

  const handleReportFault = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/equipment/${selectedEquipment.id}/faults`, faultData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Fault reported successfully');
      setIsFaultDialogOpen(false);
      fetchEquipment(); // Refresh list to update status
      if (isDetailDialogOpen) {
        fetchFaults(selectedEquipment.id);
      }
      setFaultData({ description: '', severity: 'LOW' });
    } catch (error) {
      toast.error('Failed to report fault');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/equipment/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Equipment status updated to ${newStatus}`);
      fetchEquipment();
      if (isDetailDialogOpen && selectedEquipment?.id === id) {
        setSelectedEquipment({ ...selectedEquipment, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleResolveFault = async (faultId) => {
    try {
      await api.put(`/api/equipment/faults/${faultId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Fault resolved');
      fetchFaults(selectedEquipment.id);
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to resolve fault');
    }
  };

  const openDetails = (item) => {
    setSelectedEquipment(item);
    setIsDetailDialogOpen(true);
    fetchFaults(item.id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-200">Active</Badge>;
      case 'MAINTENANCE': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-200">Maintenance</Badge>;
      case 'FAULTY': return <Badge className="bg-red-500/10 text-red-500 border-red-200">Faulty</Badge>;
      case 'RETIRED': return <Badge className="bg-background0/10 text-muted-foreground border-border">Retired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <Badge variant="destructive">Critical</Badge>;
      case 'HIGH': return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'MEDIUM': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'LOW': return <Badge className="bg-blue-500 hover:bg-blue-600">Low</Badge>;
      default: return <Badge>{severity}</Badge>;
    }
  };

  const totalEquip = equipment.length;
  const activeEquip = equipment.filter(e => e.status === 'ACTIVE').length;
  const maintEquip = equipment.filter(e => e.status === 'MAINTENANCE').length;
  const faultyEquip = equipment.filter(e => e.status === 'FAULTY').length;

  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.equipmentId && item.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">Equipment Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage gym equipment, track maintenance, and report faults.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-card text-white hover:bg-slate-800 dark:bg-card dark:text-foreground dark:hover:bg-slate-100">
              <Plus className="mr-2 h-4 w-4" /> Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
              <DialogDescription>Register new equipment to the facility inventory.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name *</Label>
                  <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Treadmill Pro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipmentId">Asset/Equipment ID</Label>
                  <Input id="equipmentId" value={formData.equipmentId} onChange={e => setFormData({...formData, equipmentId: e.target.value})} placeholder="e.g. TRD-001" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GYM">Gym</SelectItem>
                      <SelectItem value="CARDIO">Cardio</SelectItem>
                      <SelectItem value="STRENGTH">Strength</SelectItem>
                      <SelectItem value="CROSSFIT">Crossfit</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Life Fitness" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="e.g. T3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Floor 1 - Cardio Zone" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                  <Input id="purchasePrice" type="number" min="0" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                  <Input id="warrantyExpiry" type="date" value={formData.warrantyExpiry} onChange={e => setFormData({...formData, warrantyExpiry: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastServiceDate">Last Service Date</Label>
                  <Input id="lastServiceDate" type="date" value={formData.lastServiceDate} onChange={e => setFormData({...formData, lastServiceDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextServiceDate">Next Service Date</Label>
                  <Input id="nextServiceDate" type="date" value={formData.nextServiceDate} onChange={e => setFormData({...formData, nextServiceDate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any additional details..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Equipment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquip}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{activeEquip}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{maintEquip}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faulty</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{faultyEquip}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search equipment by name or ID..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="GYM">Gym</SelectItem>
              <SelectItem value="CARDIO">Cardio</SelectItem>
              <SelectItem value="STRENGTH">Strength</SelectItem>
              <SelectItem value="CROSSFIT">Crossfit</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="FAULTY">Faulty</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="flex justify-center p-12"><Activity className="animate-spin h-8 w-8 text-primary" /></div>
      ) : filteredEquipment.length === 0 ? (
        <div className="text-center p-12 border rounded-xl bg-card shadow-sm">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No equipment found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map(item => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow group flex flex-col" onClick={() => openDetails(item)}>
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">{item.name}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">{item.equipmentId || `EQ-${String(item.id).padStart(4, '0')}`}</CardDescription>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-4 space-y-3 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center"><Tag className="h-3 w-3 mr-2"/> Brand</span>
                  <span className="font-medium text-right">{item.brand || '-'} {item.model ? `/ ${item.model}` : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center"><MapPin className="h-3 w-3 mr-2"/> Location</span>
                  <span className="font-medium">{item.location || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center"><Package className="h-3 w-3 mr-2"/> Category</span>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:hover:bg-red-950/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEquipment(item);
                    setIsFaultDialogOpen(true);
                  }}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" /> Report Fault
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedEquipment && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start pr-8">
                  <div>
                    <DialogTitle className="text-2xl font-bold">{selectedEquipment.name}</DialogTitle>
                    <DialogDescription className="font-mono mt-1">{selectedEquipment.equipmentId || `EQ-${String(selectedEquipment.id).padStart(4, '0')}`}</DialogDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(selectedEquipment.status)}
                    {(hasRole('OWNER') || hasRole('MANAGER')) && (
                      <Select 
                        value={selectedEquipment.status} 
                        onValueChange={(val) => handleUpdateStatus(selectedEquipment.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs w-[130px]">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                          <SelectItem value="FAULTY">Faulty</SelectItem>
                          <SelectItem value="RETIRED">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </DialogHeader>
              
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Equipment Details</TabsTrigger>
                  <TabsTrigger value="faults">Fault Reports ({faults.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                      <p className="font-medium">{selectedEquipment.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                      <p className="font-medium">{selectedEquipment.location || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Brand & Model</p>
                      <p className="font-medium">{selectedEquipment.brand || '-'} / {selectedEquipment.model || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Warranty Expiry</p>
                      <p className="font-medium">{selectedEquipment.warrantyExpiry ? new Date(selectedEquipment.warrantyExpiry).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Purchase Date</p>
                      <p className="font-medium">
                        {selectedEquipment.purchaseDate ? new Date(selectedEquipment.purchaseDate).toLocaleDateString() : '-'} 
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Purchase Price</p>
                      <p className="font-medium">
                        {selectedEquipment.purchasePrice ? `₹${selectedEquipment.purchasePrice}` : '-'} 
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Service</p>
                      <p className="font-medium">
                        {selectedEquipment.lastServiceDate ? new Date(selectedEquipment.lastServiceDate).toLocaleDateString() : '-'} 
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Next Service</p>
                      <p className="font-medium">
                        {selectedEquipment.nextServiceDate ? new Date(selectedEquipment.nextServiceDate).toLocaleDateString() : '-'} 
                      </p>
                    </div>
                  </div>


                  {selectedEquipment.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                      <div className="text-sm bg-muted/30 p-4 rounded-lg border whitespace-pre-wrap">{selectedEquipment.notes}</div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="faults" className="space-y-4 pt-4">
                  {faults.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg bg-muted/10">
                      <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">No fault reports have been recorded for this equipment.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {faults.map(fault => (
                        <div key={fault.id} className="border rounded-lg p-4 bg-card shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(fault.severity)}
                              <span className="text-xs text-muted-foreground font-mono">{new Date(fault.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground dark:text-slate-200">{fault.description}</p>
                            <p className="text-xs text-muted-foreground">Reported by: {fault.reportedBy?.name || 'Unknown'}</p>
                            
                            {fault.status === 'RESOLVED' && (
                              <div className="inline-flex items-center mt-2 px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 rounded text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" /> Resolved on {new Date(fault.resolvedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {(hasRole('OWNER') || hasRole('MANAGER')) && fault.status !== 'RESOLVED' && (
                            <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0" onClick={() => handleResolveFault(fault.id)}>
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Fault Dialog */}
      <Dialog open={isFaultDialogOpen} onOpenChange={setIsFaultDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Equipment Fault</DialogTitle>
            <DialogDescription>
              Reporting an issue for {selectedEquipment?.name} ({selectedEquipment?.equipmentId || (selectedEquipment ? `EQ-${String(selectedEquipment.id).padStart(4, '0')}` : '')})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReportFault} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={faultData.severity} onValueChange={v => setFaultData({...faultData, severity: v})}>
                <SelectTrigger><SelectValue placeholder="Select Severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - Usable but needs attention</SelectItem>
                  <SelectItem value="MEDIUM">Medium - Affects usage</SelectItem>
                  <SelectItem value="HIGH">High - Unusable</SelectItem>
                  <SelectItem value="CRITICAL">Critical - Safety risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Issue Description *</Label>
              <textarea 
                id="description" 
                required 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={faultData.description} 
                onChange={e => setFaultData({...faultData, description: e.target.value})} 
                placeholder="Describe what is broken or malfunctioning..." 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFaultDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive">Submit Report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
