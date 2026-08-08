import { CustomSelect } from '@/components/ui/custom-select';
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Plus, UserPlus, Clock, CheckCircle2 } from 'lucide-react';

export default function MembershipPlans() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Forms state
  const [newPlan, setNewPlan] = useState({ name: '', description: '', price: '', durationMonths: '' });
  const [assignData, setAssignData] = useState({ memberId: '', planId: '' });

  useEffect(() => {
    fetchPlans();
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const membersData = res.data?.data || res.data || [];
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/subscriptions/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(res.data?.plans || res.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch membership plans",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/subscriptions/plans', newPlan, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: "Success",
        description: "Membership plan created successfully"
      });
      setIsCreateOpen(false);
      setNewPlan({ name: '', description: '', price: '', durationMonths: '' });
      fetchPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive"
      });
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    try {
      const selectedPlan = plans.find(p => (p._id || p.id) === assignData.planId);
      
      const startDate = new Date();
      const endDate = new Date();
      if (selectedPlan && selectedPlan.durationMonths) {
        endDate.setMonth(endDate.getMonth() + parseInt(selectedPlan.durationMonths, 10));
      } else if (selectedPlan && selectedPlan.durationInMonths) {
        endDate.setMonth(endDate.getMonth() + parseInt(selectedPlan.durationInMonths, 10));
      } else {
        endDate.setMonth(endDate.getMonth() + 1); // fallback
      }

      const payload = {
        ...assignData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'ACTIVE'
      };

      await api.post('/api/subscriptions/assign', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: "Success",
        description: "Plan assigned successfully"
      });
      setIsAssignOpen(false);
      setAssignData({ memberId: '', planId: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign plan",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Membership Plans</h1>
          <p className="text-muted-foreground">Manage gym memberships and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Assign to Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Plan to Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignPlan} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Member</Label>
                  <CustomSelect 
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                    value={assignData.memberId}
                    onChange={e => setAssignData({...assignData, memberId: e.target.value})}
                    required
                  >
                    <option value="">Select a member...</option>
                    {members.map(m => (
                      <option key={m.id || m._id} value={m.id || m._id}>
                        {m.firstName} {m.lastName} ({m.memberId})
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                <div className="space-y-2">
                  <Label>Select Plan</Label>
                  <CustomSelect 
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                    value={assignData.planId}
                    onChange={e => setAssignData({...assignData, planId: e.target.value})}
                    required
                  >
                    <option value="">Select a plan...</option>
                    {plans.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name} - ${p.price}</option>
                    ))}
                  </CustomSelect>
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Assign Plan</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-card hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlan} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input 
                    placeholder="e.g. Pro Platinum" 
                    value={newPlan.name}
                    onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Full access to all facilities" 
                    value={newPlan.description}
                    onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (?)</Label>
                    <Input 
                      type="number" 
                      placeholder="99.99" 
                      value={newPlan.price}
                      onChange={e => setNewPlan({...newPlan, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (Months)</Label>
                    <Input 
                      type="number" 
                      placeholder="12" 
                      value={newPlan.durationMonths}
                      onChange={e => setNewPlan({...newPlan, durationMonths: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">Create Plan</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-red-600" />
            Active Plans
          </CardTitle>
          <CardDescription>Available membership tiers and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No membership plans found. Create one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan._id || plan.id} className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4 flex items-baseline text-3xl font-bold text-foreground">
                      ${plan.price}
                      <span className="ml-1 text-sm font-medium text-muted-foreground">/ {plan.durationMonths} mo</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-6">{plan.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="mr-2 h-4 w-4 text-red-500" />
                        {plan.durationMonths} Months Duration
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-red-500" />
                        Full Gym Access
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
