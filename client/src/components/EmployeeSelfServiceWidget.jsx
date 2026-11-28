import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, ClipboardList, CalendarRange, IndianRupee, Loader2, Plus } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function EmployeeSelfServiceWidget() {
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, lRes, ltRes, sRes] = await Promise.allSettled([
        api.get('/api/tasks/my'),
        api.get('/api/leave/requests'),
        api.get('/api/leave/types'),
        api.get('/api/payroll/slips/me'),
      ]);
      if (tRes.status === 'fulfilled') setTasks(Array.isArray(tRes.value.data) ? tRes.value.data : []);
      if (lRes.status === 'fulfilled') setLeaves(Array.isArray(lRes.value.data) ? lRes.value.data : []);
      if (ltRes.status === 'fulfilled') {
        const types = Array.isArray(ltRes.value.data) ? ltRes.value.data : [];
        setLeaveTypes(types);
        if (types.length > 0 && !leaveForm.leaveTypeId) {
          setLeaveForm((prev) => ({ ...prev, leaveTypeId: types[0].id }));
        }
      }
      if (sRes.status === 'fulfilled') setSlips(Array.isArray(sRes.value.data) ? sRes.value.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteTask = async (taskId) => {
    setCompletingId(taskId);
    try {
      await api.put(`/api/tasks/${taskId}/complete`, {});
      toast.success('Task marked as completed!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task');
    } finally {
      setCompletingId(null);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.leaveTypeId) {
      toast.error('Please select a leave type');
      return;
    }
    setSubmittingLeave(true);
    try {
      await api.post('/api/leave/requests', leaveForm);
      toast.success('Leave request submitted');
      setIsLeaveOpen(false);
      setLeaveForm((prev) => ({ ...prev, reason: '' }));
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const latestSlip = slips[0] || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* My Assigned Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" /> My Assigned Tasks
            </CardTitle>
            <CardDescription>{pendingTasks.length} pending tasks</CardDescription>
          </div>
          <Link to="/my-tasks" className="text-xs text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No tasks assigned yet.</p>
          ) : (
            tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className={`font-medium truncate ${t.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                    {t.title}
                  </p>
                  {t.dueDate && (
                    <p className="text-[11px] text-muted-foreground">
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {t.status === 'COMPLETED' ? (
                  <Badge className="bg-emerald-600 text-white shrink-0">Done</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={completingId === t.id}
                    onClick={() => handleCompleteTask(t.id)}
                    className="h-7 text-xs gap-1 shrink-0"
                  >
                    {completingId === t.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    )}
                    Done
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Leave Requests & Quick Apply */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-amber-500" /> Leave &amp; Approvals
            </CardTitle>
            <CardDescription>Apply leave &amp; track status</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setIsLeaveOpen(true)}>
            <Plus className="h-3 w-3" /> Apply
          </Button>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading leaves...</p>
          ) : leaves.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No leave requests submitted.</p>
          ) : (
            leaves.slice(0, 4).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{l.leaveType?.name || 'Leave'}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    l.status === 'APPROVED'
                      ? 'default'
                      : l.status === 'REJECTED'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className={l.status === 'APPROVED' ? 'bg-emerald-600 text-white' : ''}
                >
                  {l.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* My Salary Slip */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-500" /> My Salary Slip
            </CardTitle>
            <CardDescription>
              {latestSlip ? `${latestSlip.month}/${latestSlip.year}` : 'Monthly payroll summary'}
            </CardDescription>
          </div>
          <Link to="/payroll" className="text-xs text-primary hover:underline">
            Payroll
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading salary...</p>
          ) : !latestSlip ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No salary slips generated yet.
            </p>
          ) : (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Salary:</span>
                <span className="font-medium">₹{Number(latestSlip.baseSalary || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Working / Leave Days:</span>
                <span>{latestSlip.workingDays}d / {latestSlip.leaveDays}d</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Allowances + OT + Comm:</span>
                <span>
                  +₹
                  {(
                    Number(latestSlip.standardAllowances || 0) +
                    Number(latestSlip.overtimePay || 0) +
                    Number(latestSlip.ptCommission || 0) +
                    Number(latestSlip.bonuses || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Deductions &amp; LOP:</span>
                <span>
                  -₹
                  {(
                    Number(latestSlip.standardDeductions || 0) +
                    Number(latestSlip.latePenalties || 0) +
                    Number(latestSlip.otherPenalties || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-1">
                <span>Net Pay:</span>
                <span>₹{Number(latestSlip.netPay || 0).toFixed(2)}</span>
              </div>
              <div className="pt-1 flex justify-end">
                <Badge variant={latestSlip.status === 'PAID' ? 'default' : 'secondary'}>
                  {latestSlip.status}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Apply Leave Dialog */}
      <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-3 pt-2">
            <div>
              <Label>Leave Type *</Label>
              <CustomSelect
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
                value={leaveForm.leaveTypeId}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
                required
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.isPaid ? 'Paid' : 'Unpaid'})
                  </option>
                ))}
              </CustomSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From Date *</Label>
                <Input
                  type="date"
                  required
                  value={leaveForm.fromDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                />
              </div>
              <div>
                <Label>To Date *</Label>
                <Input
                  type="date"
                  required
                  value={leaveForm.toDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Reason *</Label>
              <Input
                required
                placeholder="Reason for leave..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={submittingLeave} className="w-full bg-red-600 hover:bg-red-700 text-white">
              {submittingLeave ? 'Submitting...' : 'Submit Leave Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
