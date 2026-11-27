import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomSelect } from '@/components/ui/custom-select';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, UserPlus, Users, Package, Calendar, Trash2, Link2, Pencil, CheckCircle2, AlertTriangle, Loader2, FileSpreadsheet, Download, Clock } from 'lucide-react';
import { PT_PRESET_SLOTS, formatSlotRange } from '../../lib/ptSlots';

export default function PersonalTrainersHub() {
  const { toast } = useToast();
  const [trainers, setTrainers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [trainerForm, setTrainerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: 'Password123',
    baseSalary: '',
    ptCommissionPercentage: '',
  });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    memberId: '',
    trainerId: '',
    packageId: '',
    sessionsTotal: '12',
    fee: '',
    preferredSlotStart: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    createInvoice: true,
  });

  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reportTrainerId, setReportTrainerId] = useState('');
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  const [isPkgOpen, setIsPkgOpen] = useState(false);
  const [pkgForm, setPkgForm] = useState({ name: '', numberOfSessions: '12', price: '' });

  const [editingTrainer, setEditingTrainer] = useState(null);
  const [deletingTrainer, setDeletingTrainer] = useState(null);
  const [successPopup, setSuccessPopup] = useState(null);
  const [isCreatingTrainer, setIsCreatingTrainer] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreatingPkg, setIsCreatingPkg] = useState(false);

  const fetchAll = async () => {
    try {
      // Load trainers first so the table renders immediately without waiting for heavy queries
      api.get('/api/pt/trainers').then((res) => {
        setTrainers(res.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));

      Promise.allSettled([
        api.get('/api/pt/assignments'),
        api.get('/api/pt/packages'),
        api.get('/api/pt/sessions'),
      ]).then(([aRes, pRes, sRes]) => {
        if (aRes.status === 'fulfilled') setAssignments(aRes.value.data || []);
        if (pRes.status === 'fulfilled') setPackages(pRes.value.data || []);
        if (sRes.status === 'fulfilled') setSessions(sRes.value.data || []);
      });
    } catch {
      setLoading(false);
    }
  };

  const openAssignModal = async () => {
    setIsAssignOpen(true);
    if (members.length === 0) {
      api.get('/api/members?limit=500').then((res) => {
        setMembers(res.data?.data || res.data || []);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchMonthlyReport = async (m = reportMonth, tId = reportTrainerId) => {
    setLoadingReport(true);
    try {
      const params = new URLSearchParams({ month: m });
      if (tId) params.set('trainerId', tId);
      const res = await api.get(`/api/pt/reports/monthly?${params.toString()}`);
      setMonthlyReports(res.data?.reports || []);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load monthly PT report' });
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport(reportMonth, reportTrainerId);
  }, [reportMonth, reportTrainerId]);

  const handleUpdateSlot = async (assignmentId, slotStart) => {
    try {
      await api.put(`/api/pt/assignments/${assignmentId}/slot`, {
        preferredSlotStart: slotStart || null,
      });
      toast({ title: 'Updated', description: '1h 25m time slot updated' });
      fetchAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Slot Conflict',
        description: err.response?.data?.message || 'Failed to update slot',
      });
    }
  };

  const handleExportReportCsv = () => {
    const headers = ['Month', 'Trainer ID', 'Trainer Name', 'Assigned Clients', 'Days Checked In', 'Gym Hours', 'Completed Sessions (1h 25m)', 'Training Hours', 'Commission (INR)', 'Client Breakdown'];
    const rows = monthlyReports.map((r) => [
      reportMonth,
      r.employeeCode,
      r.trainerName,
      r.assignedClientsCount,
      r.daysPresent,
      r.totalWorkedHours,
      r.completedSessions,
      r.totalTrainingHours,
      r.commissionEarned,
      r.clientBreakdown.map((c) => `${c.memberName} (${c.memberCode}): ${c.sessionsCount}`).join(' | '),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pt-monthly-report-${reportMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateTrainer = async (e) => {
    e.preventDefault();
    if (!editingTrainer || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      await api.put(`/api/pt/trainers/${editingTrainer.id}`, {
        firstName: editingTrainer.firstName,
        lastName: editingTrainer.lastName,
        email: editingTrainer.email,
        mobile: editingTrainer.mobile,
        status: editingTrainer.status,
        baseSalary: parseFloat(editingTrainer.baseSalary) || 0,
        ptCommissionPercentage: parseFloat(editingTrainer.ptCommissionPercentage) || 0,
      });
      setEditingTrainer(null);
      setSuccessPopup({
        title: 'Trainer Updated',
        message: 'Personal Trainer details have been updated successfully.',
      });
      fetchAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update trainer',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDeleteTrainer = async () => {
    if (!deletingTrainer) return;
    const target = deletingTrainer;
    const previousTrainers = trainers;

    // Instant optimistic UI update
    setDeletingTrainer(null);
    setTrainers((prev) => prev.filter((t) => t.id !== target.id));
    setSuccessPopup({
      title: 'Trainer Deleted',
      message: `Personal Trainer "${target.firstName}" has been removed successfully.`,
    });

    try {
      await api.delete(`/api/pt/trainers/${target.id}`);
      fetchAll();
    } catch (err) {
      // Rollback if delete failed
      setTrainers(previousTrainers);
      setSuccessPopup(null);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete trainer',
      });
    }
  };

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    if (isCreatingTrainer) return;
    setIsCreatingTrainer(true);
    try {
      const res = await api.post('/api/pt/trainers', {
        ...trainerForm,
        baseSalary: parseFloat(trainerForm.baseSalary) || 0,
        ptCommissionPercentage: parseFloat(trainerForm.ptCommissionPercentage) || 0,
      });
      const created = res.data;
      setIsAddTrainerOpen(false);
      setSuccessPopup({
        title: 'Personal Trainer Created Successfully!',
        message: `${created?.firstName || trainerForm.firstName} (${created?.employeeId || 'Trainer'}) has been added. Login Email: ${trainerForm.email}`,
      });
      setTrainerForm({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: 'Password123',
        baseSalary: '',
        ptCommissionPercentage: '',
      });
      fetchAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add trainer',
      });
    } finally {
      setIsCreatingTrainer(false);
    }
  };

  const handlePackageSelect = (pkgId) => {
    const pkg = packages.find((p) => p.id === pkgId);
    setAssignForm((prev) => ({
      ...prev,
      packageId: pkgId,
      sessionsTotal: pkg ? String(pkg.numberOfSessions) : prev.sessionsTotal,
      fee: pkg ? String(pkg.price) : prev.fee,
    }));
  };

  const handleAssignTrainer = async (e) => {
    e.preventDefault();
    if (isAssigning) return;
    setIsAssigning(true);
    try {
      await api.post('/api/pt/assignments', {
        ...assignForm,
        sessionsTotal: parseInt(assignForm.sessionsTotal, 10) || 12,
        fee: parseFloat(assignForm.fee) || 0,
      });
      setIsAssignOpen(false);
      setSuccessPopup({
        title: 'Trainer Assigned Successfully!',
        message: 'The Personal Trainer has been linked to the member.',
      });
      fetchAll();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to assign trainer',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (isCreatingPkg) return;
    setIsCreatingPkg(true);
    try {
      await api.post('/api/pt/packages', {
        name: pkgForm.name,
        numberOfSessions: parseInt(pkgForm.numberOfSessions, 10),
        price: parseFloat(pkgForm.price),
      });
      toast({ title: 'Success', description: 'PT Package created!' });
      setIsPkgOpen(false);
      setPkgForm({ name: '', numberOfSessions: '12', price: '' });
      fetchAll();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create package' });
    } finally {
      setIsCreatingPkg(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this PT package?')) return;
    try {
      await api.delete(`/api/pt/packages/${id}`);
      toast({ title: 'Deleted', description: 'PT Package deleted' });
      fetchAll();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot delete package in use' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Personal Trainers &amp; Tracking</h1>
            <p className="text-sm text-muted-foreground">
              Add personal trainers, create PT packages, assign trainers to members &amp; track sessions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAssignModal} className="gap-2">
            <Link2 className="h-4 w-4" /> Assign Trainer to Member
          </Button>
          <Button onClick={() => setIsAddTrainerOpen(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <UserPlus className="h-4 w-4" /> Add Personal Trainer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Trainers</p>
            <p className="text-2xl font-bold">{trainers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active PT Assignments</p>
            <p className="text-2xl font-bold">{assignments.filter((a) => a.status === 'ACTIVE').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">PT Packages</p>
            <p className="text-2xl font-bold">{packages.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total PT Sessions</p>
            <p className="text-2xl font-bold">{sessions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trainers" className="w-full">
        <TabsList className="bg-card border flex-wrap h-auto">
          <TabsTrigger value="trainers" className="gap-1.5"><Users className="h-4 w-4" /> Trainers</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5"><Link2 className="h-4 w-4" /> Assigned Members</TabsTrigger>
          <TabsTrigger value="monthly-report" className="gap-1.5"><FileSpreadsheet className="h-4 w-4" /> Monthly Report (Payroll)</TabsTrigger>
          <TabsTrigger value="packages" className="gap-1.5"><Package className="h-4 w-4" /> PT Packages</TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5"><Calendar className="h-4 w-4" /> Sessions Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="trainers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Trainers Directory</CardTitle>
              <CardDescription>Track active clients, sessions completed, base salary &amp; commission</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Trainer Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Active Clients</TableHead>
                    <TableHead>Sessions (Done/Total)</TableHead>
                    <TableHead>Base Salary / Comm %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-6">Loading...</TableCell></TableRow>
                  ) : trainers.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No trainers yet. Click &quot;Add Personal Trainer&quot; above.</TableCell></TableRow>
                  ) : (
                    trainers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.employeeId}</TableCell>
                        <TableCell>{t.firstName} {t.lastName !== '-' ? t.lastName : ''}</TableCell>
                        <TableCell>
                          <div>{t.mobile}</div>
                          <div className="text-xs text-muted-foreground">{t.email}</div>
                        </TableCell>
                        <TableCell>{t.activeClients}</TableCell>
                        <TableCell>{t.completedSessions} / {t.totalSessions}</TableCell>
                        <TableCell>₹{t.baseSalary} / {t.ptCommissionPercentage}%</TableCell>
                        <TableCell><Badge>{t.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Edit Trainer" onClick={() => setEditingTrainer({ ...t })}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete Trainer" className="text-red-500" onClick={() => setDeletingTrainer(t)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Member ↔ Personal Trainer Assignments</CardTitle>
                <CardDescription>Track remaining sessions and expiry for each member</CardDescription>
              </div>
              <Button size="sm" onClick={openAssignModal}>+ Assign Trainer</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Daily Slot (1h 25m)</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Sessions Left</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No assignments yet</TableCell></TableRow>
                  ) : (
                    assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          {a.member?.firstName} {a.member?.lastName !== '-' ? a.member?.lastName : ''} ({a.member?.memberId})
                        </TableCell>
                        <TableCell>
                          {a.trainer ? `${a.trainer.firstName} (${a.trainer.employeeId})` : 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <CustomSelect
                            value={a.preferredSlotStart || ''}
                            onChange={(e) => handleUpdateSlot(a.id, e.target.value)}
                            className="flex h-8 w-44 rounded-md border border-border bg-card px-2 text-xs"
                          >
                            <option value="">Not Set</option>
                            {PT_PRESET_SLOTS.map((s) => (
                              <option key={s} value={s}>{formatSlotRange(s)}</option>
                            ))}
                          </CustomSelect>
                        </TableCell>
                        <TableCell>{a.package?.name}</TableCell>
                        <TableCell>{a.sessionsRemaining} / {a.sessionsTotal}</TableCell>
                        <TableCell>{new Date(a.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={a.status === 'ACTIVE' ? 'default' : 'secondary'}>{a.status}</Badge></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>PT Packages</CardTitle>
                <CardDescription>Define Personal Training session packs and pricing</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsPkgOpen(true)}>+ New Package</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Active Subscriptions</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No PT packages created yet</TableCell></TableRow>
                  ) : (
                    packages.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.numberOfSessions}</TableCell>
                        <TableCell>₹{Number(p.price).toFixed(2)}</TableCell>
                        <TableCell>{p._count?.memberPackages || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePackage(p.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent PT Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No PT sessions logged yet</TableCell></TableRow>
                  ) : (
                    sessions.slice(0, 50).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
                        <TableCell>{s.startTime} - {s.endTime}</TableCell>
                        <TableCell>{s.trainer?.firstName}</TableCell>
                        <TableCell>{s.member?.firstName}</TableCell>
                        <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly-report" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Monthly PT Report (Attendance, Sessions &amp; Payroll)</CardTitle>
                <CardDescription>
                  Track each PT&apos;s daily Check-In attendance and completed 1h 25m sessions for monthly payout
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="w-40"
                />
                <CustomSelect
                  value={reportTrainerId}
                  onChange={(e) => setReportTrainerId(e.target.value)}
                  className="flex h-10 w-48 rounded-md border border-border bg-card px-3 text-sm"
                >
                  <option value="">All Trainers</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName !== '-' ? t.lastName : ''} ({t.employeeId})
                    </option>
                  ))}
                </CustomSelect>
                <Button variant="outline" size="sm" onClick={handleExportReportCsv} className="gap-1.5">
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Active Clients</TableHead>
                    <TableHead>Days Checked In</TableHead>
                    <TableHead>Gym Hours</TableHead>
                    <TableHead>Sessions Done (1h 25m)</TableHead>
                    <TableHead>Training Hours</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Trained Members Breakdown</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingReport ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">Loading monthly report...</TableCell>
                    </TableRow>
                  ) : monthlyReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No trainer report data for {reportMonth}</TableCell>
                    </TableRow>
                  ) : (
                    monthlyReports.map((r) => (
                      <TableRow key={r.trainerId}>
                        <TableCell>
                          <div className="font-medium">{r.trainerName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{r.employeeCode}</div>
                        </TableCell>
                        <TableCell>{r.assignedClientsCount}</TableCell>
                        <TableCell className="font-semibold">{r.daysPresent}</TableCell>
                        <TableCell>{r.totalWorkedHours} hrs</TableCell>
                        <TableCell className="font-semibold text-emerald-500">{r.completedSessions}</TableCell>
                        <TableCell>{r.totalTrainingHours} hrs</TableCell>
                        <TableCell>₹{Number(r.commissionEarned || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-xs max-w-xs">
                          {r.clientBreakdown?.length ? (
                            <div className="space-y-1">
                              {r.clientBreakdown.map((c) => (
                                <div key={c.memberId}>
                                  <span className="font-medium">{c.memberName}</span> ({c.memberCode}):{' '}
                                  <span className="font-semibold">{c.sessionsCount}</span> sessions
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No sessions this month</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Personal Trainer Dialog */}
      <Dialog open={isAddTrainerOpen} onOpenChange={setIsAddTrainerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Personal Trainer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTrainer} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name *</Label>
                <Input required value={trainerForm.firstName} onChange={(e) => setTrainerForm({ ...trainerForm, firstName: e.target.value })} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={trainerForm.lastName} onChange={(e) => setTrainerForm({ ...trainerForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email (Login) *</Label>
                <Input type="email" required value={trainerForm.email} onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Mobile *</Label>
                <Input required value={trainerForm.mobile} onChange={(e) => setTrainerForm({ ...trainerForm, mobile: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Login Password</Label>
                <Input value={trainerForm.password} onChange={(e) => setTrainerForm({ ...trainerForm, password: e.target.value })} />
              </div>
              <div>
                <Label>Base Salary (₹)</Label>
                <Input type="number" value={trainerForm.baseSalary} onChange={(e) => setTrainerForm({ ...trainerForm, baseSalary: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label>Commission (%)</Label>
                <Input type="number" step="0.1" value={trainerForm.ptCommissionPercentage} onChange={(e) => setTrainerForm({ ...trainerForm, ptCommissionPercentage: e.target.value })} placeholder="0" />
              </div>
            </div>
            <Button type="submit" disabled={isCreatingTrainer} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
              {isCreatingTrainer ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Trainer...</> : 'Create Trainer'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Trainer to Member Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Personal Trainer to Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignTrainer} className="space-y-3">
            <div>
              <Label>Member *</Label>
              <CustomSelect className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm" value={assignForm.memberId} onChange={(e) => setAssignForm({ ...assignForm, memberId: e.target.value })} required>
                <option value="">Select Member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName !== '-' ? m.lastName : ''} ({m.memberId})</option>
                ))}
              </CustomSelect>
            </div>
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
              <CustomSelect className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm" value={assignForm.packageId} onChange={(e) => handlePackageSelect(e.target.value)}>
                <option value="">Custom Sessions / Fee</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.numberOfSessions} sessions - ₹{p.price})</option>
                ))}
              </CustomSelect>
            </div>
            <div>
              <Label>Daily Time Slot (1 hr 25 min)</Label>
              <CustomSelect
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
                value={assignForm.preferredSlotStart}
                onChange={(e) => setAssignForm({ ...assignForm, preferredSlotStart: e.target.value })}
              >
                <option value="">Assign Slot Later</option>
                {PT_PRESET_SLOTS.map((s) => (
                  <option key={s} value={s}>{formatSlotRange(s)}</option>
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
            <Button type="submit" disabled={isAssigning} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
              {isAssigning ? <><Loader2 className="h-4 w-4 animate-spin" /> Assigning Trainer...</> : 'Assign Trainer'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add PT Package Dialog */}
      <Dialog open={isPkgOpen} onOpenChange={setIsPkgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create PT Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePackage} className="space-y-3">
            <div>
              <Label>Package Name *</Label>
              <Input required value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="e.g. 12 Sessions Transformation" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Number of Sessions *</Label>
                <Input type="number" required value={pkgForm.numberOfSessions} onChange={(e) => setPkgForm({ ...pkgForm, numberOfSessions: e.target.value })} />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" step="0.01" required value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })} />
              </div>
            </div>
            <Button type="submit" disabled={isCreatingPkg} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
              {isCreatingPkg ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Package...</> : 'Create Package'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Personal Trainer Dialog */}
      <Dialog open={Boolean(editingTrainer)} onOpenChange={() => setEditingTrainer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Personal Trainer ({editingTrainer?.employeeId})</DialogTitle>
          </DialogHeader>
          {editingTrainer && (
            <form onSubmit={handleUpdateTrainer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name *</Label>
                  <Input required value={editingTrainer.firstName} onChange={(e) => setEditingTrainer({ ...editingTrainer, firstName: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={editingTrainer.lastName === '-' ? '' : editingTrainer.lastName} onChange={(e) => setEditingTrainer({ ...editingTrainer, lastName: e.target.value || '-' })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" required value={editingTrainer.email} onChange={(e) => setEditingTrainer({ ...editingTrainer, email: e.target.value })} />
                </div>
                <div>
                  <Label>Mobile *</Label>
                  <Input required value={editingTrainer.mobile} onChange={(e) => setEditingTrainer({ ...editingTrainer, mobile: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Base Salary (₹)</Label>
                  <Input type="number" value={editingTrainer.baseSalary} onChange={(e) => setEditingTrainer({ ...editingTrainer, baseSalary: e.target.value })} />
                </div>
                <div>
                  <Label>Commission (%)</Label>
                  <Input type="number" step="0.1" value={editingTrainer.ptCommissionPercentage} onChange={(e) => setEditingTrainer({ ...editingTrainer, ptCommissionPercentage: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <CustomSelect className="flex h-10 w-full rounded-md border border-border bg-card px-2 text-sm" value={editingTrainer.status} onChange={(e) => setEditingTrainer({ ...editingTrainer, status: e.target.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </CustomSelect>
                </div>
              </div>
              <Button type="submit" disabled={isSavingEdit} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                {isSavingEdit ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...</> : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Trainer Confirmation Popup */}
      <Dialog open={Boolean(deletingTrainer)} onOpenChange={() => setDeletingTrainer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" /> Delete Personal Trainer
            </DialogTitle>
          </DialogHeader>
          {deletingTrainer && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-semibold text-foreground">{deletingTrainer.firstName} {deletingTrainer.lastName !== '-' ? deletingTrainer.lastName : ''}</span> ({deletingTrainer.employeeId})? This will remove their trainer profile and login access.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingTrainer(null)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteTrainer}>
                  Delete Trainer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <Dialog open={Boolean(successPopup)} onOpenChange={() => setSuccessPopup(null)}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center text-center space-y-3 py-4">
            <div className="h-12 w-12 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold">{successPopup?.title}</h3>
            <p className="text-sm text-muted-foreground">{successPopup?.message}</p>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-2" onClick={() => setSuccessPopup(null)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
