import api from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Dumbbell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { useToast } from '@/hooks/use-toast';

// Import Tabs
import ProfileOverview from './profile-tabs/ProfileOverview';
import MedicalInfo from './profile-tabs/MedicalInfo';
import Measurements from './profile-tabs/Measurements';
import DocumentManager from './profile-tabs/DocumentManager';
import NotesSection from './profile-tabs/NotesSection';
import MembershipTab from './profile-tabs/MembershipTab';
import BillingTab from './profile-tabs/BillingTab';
import AttendanceTab from './profile-tabs/AttendanceTab';

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [member, setMember] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [ptPackages, setPtPackages] = useState([]);
  const [assignForm, setAssignForm] = useState({
    trainerId: '',
    packageId: '',
    sessionsTotal: '12',
    fee: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  const openAssignModal = async () => {
    setIsAssignOpen(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.get('/api/pt/trainers'),
        api.get('/api/pt/packages'),
      ]);
      setTrainers(tRes.data || []);
      setPtPackages(pRes.data || []);
    } catch {}
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/pt/assignments', {
        memberId: id,
        ...assignForm,
        sessionsTotal: parseInt(assignForm.sessionsTotal, 10) || 12,
        fee: parseFloat(assignForm.fee) || 0,
      });
      toast({ title: 'Success', description: 'Personal Trainer assigned!' });
      setIsAssignOpen(false);
      fetchMember();
      fetchTimeline();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to assign trainer', variant: 'destructive' });
    }
  };

  const fetchMember = async () => {
    try {
      const token = localStorage.getItem("token") || '';
      const res = await api.get(`/api/members/${id}`);
      if (!res.data) throw new Error("Failed to fetch");
      const data = res.data;
      setMember(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load member profile",
        variant: "destructive"
      });
    }
  };

  const fetchTimeline = async () => {
    try {
      const token = localStorage.getItem("token") || '';
      const res = await api.get(`/api/members/${id}/timeline`);
      if (!res.data) throw new Error("Failed to fetch");
      const data = res.data;
      setTimeline(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
    fetchTimeline();
  }, [id]);

  if (loading || !member) {
    return <div className="p-8 text-center">Loading Profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/members')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Member Profile</h1>
            <p className="text-muted-foreground">{member.memberId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAssignModal} className="bg-red-600 hover:bg-red-700 text-white">
            <Dumbbell className="mr-2 h-4 w-4" /> Assign Personal Trainer
          </Button>
          <Button variant="outline" onClick={() => navigate(`/members/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Quick Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 ring-4 ring-primary/10">
                <AvatarImage src={member.profilePicture} />
                <AvatarFallback className="text-4xl">{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{member.firstName} {member.lastName}</h2>
              <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'} className="mt-2">
                {member.status}
              </Badge>
              
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm bg-muted/30 p-2 rounded-md">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{member.mobile}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-3 text-sm bg-muted/30 p-2 rounded-md">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="truncate" title={member.email}>{member.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm bg-muted/30 p-2 rounded-md">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Joined: {new Date(member.joiningDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6 bg-transparent border-b rounded-none p-0">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="medical"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Medical & Vitals
              </TabsTrigger>
              <TabsTrigger 
                value="measurements"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Measurements
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger 
                value="membership"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Membership
              </TabsTrigger>
              <TabsTrigger 
                value="billing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Billing
              </TabsTrigger>
              <TabsTrigger 
                value="attendance"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Attendance
              </TabsTrigger>
              <TabsTrigger 
                value="timeline"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 outline-none">
              <ProfileOverview member={member} />
            </TabsContent>

            <TabsContent value="medical" className="mt-0 outline-none">
              <MedicalInfo member={member} />
            </TabsContent>

            <TabsContent value="measurements" className="mt-0 outline-none">
              <Measurements member={member} />
            </TabsContent>

            <TabsContent value="documents" className="mt-0 outline-none">
              <DocumentManager member={member} refreshMember={fetchMember} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0 outline-none">
              <NotesSection member={member} refreshMember={fetchMember} />
            </TabsContent>

            <TabsContent value="membership" className="mt-0 outline-none">
              <MembershipTab member={member} refreshMember={fetchMember} />
            </TabsContent>

            <TabsContent value="billing" className="mt-0 outline-none">
              <BillingTab member={member} />
            </TabsContent>

            <TabsContent value="attendance" className="mt-0 outline-none">
              <AttendanceTab member={member} />
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0 outline-none">
              <Card>
                <CardContent className="pt-6">
                  {timeline.length === 0 ? (
                    <p className="text-center text-muted-foreground">No timeline events recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {timeline.map((event) => (
                        <div key={event.id} className="flex gap-4 border-l-2 border-primary/20 pl-4 py-2">
                          <div className="-ml-[21px] mt-1 h-3 w-3 rounded-full bg-primary" />
                          <div>
                            <p className="font-semibold">{event.event}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <span className="text-xs text-muted-foreground mt-1 inline-block">
                              {new Date(event.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Personal Trainer to {member.firstName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-3">
            <div>
              <Label>Personal Trainer *</Label>
              <CustomSelect className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm" value={assignForm.trainerId} onChange={(e) => setAssignForm({ ...assignForm, trainerId: e.target.value })} required>
                <option value="">Select Trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName !== '-' ? t.lastName : ''} ({t.employeeId})</option>
                ))}
              </CustomSelect>
            </div>
            <div>
              <Label>PT Package (Optional)</Label>
              <CustomSelect
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
                value={assignForm.packageId}
                onChange={(e) => {
                  const pkg = ptPackages.find((p) => p.id === e.target.value);
                  setAssignForm((prev) => ({
                    ...prev,
                    packageId: e.target.value,
                    sessionsTotal: pkg ? String(pkg.numberOfSessions) : prev.sessionsTotal,
                    fee: pkg ? String(pkg.price) : prev.fee,
                  }));
                }}
              >
                <option value="">Custom Sessions / Fee</option>
                {ptPackages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.numberOfSessions} sessions - ₹{p.price})</option>
                ))}
              </CustomSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sessions</Label>
                <Input type="number" value={assignForm.sessionsTotal} onChange={(e) => setAssignForm({ ...assignForm, sessionsTotal: e.target.value })} required />
              </div>
              <div>
                <Label>PT Fee (₹)</Label>
                <Input type="number" step="0.01" value={assignForm.fee} onChange={(e) => setAssignForm({ ...assignForm, fee: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={assignForm.startDate} onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })} required />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input type="date" value={assignForm.expiryDate} onChange={(e) => setAssignForm({ ...assignForm, expiryDate: e.target.value })} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">Assign Trainer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberProfile;
