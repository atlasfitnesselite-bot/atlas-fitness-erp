import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Search, Users, IndianRupee, Clock, TrendingUp, CheckCircle2, 
  Trash2, Edit, Activity
} from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionsDashboard() {
  const { token } = useAuthStore();
  
  // State
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  // Forms state
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    durationMonths: 1,
    price: '',
    features: ''
  });
  
  const [assignForm, setAssignForm] = useState({
    memberId: '',
    planId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    paymentAmount: '',
    paymentMethod: 'UPI'
  });

  // Using global api instance from @/lib/api (handles auth automatically)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, membersRes] = await Promise.all([
        api.get('/api/subscriptions/plans'),
        api.get('/api/subscriptions'),
        api.get('/api/members')
      ]);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : plansRes.data?.data || []);
      setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : subsRes.data?.data || []);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : membersRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to load subscription data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...planForm,
        durationMonths: parseInt(planForm.durationMonths),
        price: parseFloat(planForm.price),
        features: planForm.features.split('\n').filter(f => f.trim())
      };
      
      await api.post('/api/subscriptions/plans', payload);
      toast.success('Membership plan created successfully');
      setIsPlanDialogOpen(false);
      fetchData();
      setPlanForm({ name: '', description: '', durationMonths: 1, price: '', features: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.delete(`/api/subscriptions/plans/${id}`);
      toast.success('Plan deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...assignForm,
        paymentAmount: parseFloat(assignForm.paymentAmount)
      };
      await api.post('/api/subscriptions/assign', payload);
      toast.success('Plan assigned successfully');
      setIsAssignDialogOpen(false);
      fetchData();
      setAssignForm({
        memberId: '',
        planId: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        paymentAmount: '',
        paymentMethod: 'UPI'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign plan');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>;
      case 'EXPIRED': return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Expired</Badge>;
      case 'CANCELLED': return <Badge className="bg-background0/10 text-muted-foreground hover:bg-background0/20">Cancelled</Badge>;
      case 'PENDING': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSubs = subscriptions.filter(sub => 
    sub.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage membership plans and active subscriptions.</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Members</CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue This Month</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{subscriptions.reduce((acc, sub) => acc + (sub.paymentAmount || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'ACTIVE' && new Date(s.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within next 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Sign-ups</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger value="active" className="data-[state=active]:bg-card">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-card">Membership Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 outline-none">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Member Subscriptions</CardTitle>
                <CardDescription>View and manage all member subscriptions</CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search members..." 
                    className="pl-9 w-[250px] bg-background/50" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-card hover:bg-slate-800">
                      <Plus className="h-4 w-4 mr-2" /> Assign Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Assign Membership Plan</DialogTitle>
                      <DialogDescription>
                        Enroll a member into a new subscription plan.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignPlan} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Member</Label>
                        <Select 
                          value={assignForm.memberId} 
                          onValueChange={(val) => setAssignForm({...assignForm, memberId: val})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a member" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Array.isArray(members) ? members : []).map(m => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.firstName} {m.lastName} ({m.memberId})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Plan</Label>
                        <Select 
                          value={assignForm.planId} 
                          onValueChange={(val) => {
                            const plan = plans.find(p => p.id.toString() === val);
                            setAssignForm({
                              ...assignForm, 
                              planId: val,
                              paymentAmount: plan ? plan.price.toString() : ''
                            })
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>{p.name} - ₹{p.price}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input 
                            type="date" 
                            value={assignForm.startDate}
                            onChange={(e) => setAssignForm({...assignForm, startDate: e.target.value})}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount (₹)</Label>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            value={assignForm.paymentAmount}
                            onChange={(e) => setAssignForm({...assignForm, paymentAmount: e.target.value})}
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select 
                          value={assignForm.paymentMethod} 
                          onValueChange={(val) => setAssignForm({...assignForm, paymentMethod: val})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CARD">Card</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-card hover:bg-slate-800">Assign & Collect Payment</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-background/50">
                  <TableRow>
                    <TableHead className="pl-6">Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubs.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-background/50">
                        <TableCell className="pl-6 font-medium">
                          <div className="flex flex-col">
                            <span>{sub.member?.firstName ? `${sub.member.firstName} ${sub.member.lastName}` : 'Unknown Member'}</span>
                            <span className="text-xs text-muted-foreground">{sub.member?.mobile}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{sub.plan?.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Expires: {new Date(sub.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-600">
                            <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                            {format(new Date(sub.startDate), 'MMM d, yyyy')} - {format(new Date(sub.endDate), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="font-medium">
                          ₹{sub.paymentAmount?.toLocaleString() || sub.plan?.price?.toLocaleString() || '0'}
                          <div className="text-[10px] text-muted-foreground mt-0.5 uppercase">{sub.paymentMethod}</div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4 outline-none">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Available Plans</h2>
              <p className="text-sm text-muted-foreground">Manage your gym's membership packages</p>
            </div>
            
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-card hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" /> Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Membership Plan</DialogTitle>
                  <DialogDescription>
                    Add a new subscription package to your offerings.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePlan} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input 
                      placeholder="e.g. Pro Annual" 
                      value={planForm.name}
                      onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      placeholder="Brief description of the plan" 
                      value={planForm.description}
                      onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (Months)</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={planForm.durationMonths}
                        onChange={(e) => setPlanForm({...planForm, durationMonths: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={planForm.price}
                        onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Features (One per line)</Label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="24/7 Access&#10;Free Personal Training session&#10;Locker included"
                      value={planForm.features}
                      onChange={(e) => setPlanForm({...planForm, features: e.target.value})}
                    />
                  </div>

                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsPlanDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-card hover:bg-slate-800">Save Plan</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map(plan => (
              <Card key={plan.id} className="relative overflow-hidden group border-border transition-all hover:shadow-md">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-800 to-slate-600" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-background">{plan.durationMonths} Months</Badge>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-1.5 h-10 line-clamp-2">{plan.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tracking-tight text-foreground">₹{plan.price}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ₹{Math.round(plan.price / plan.durationMonths)}/mo
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground">Features included:</div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {plan.features?.length > 0 ? (
                        plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-emerald-500 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground italic">No specific features listed.</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-between bg-background/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    {subscriptions.filter(s => s.planId === plan.id && s.status === 'ACTIVE').length} Active
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-card" onClick={() => handleDeletePlan(plan.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
