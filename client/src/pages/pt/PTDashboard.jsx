import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CustomSelect } from '@/components/ui/custom-select';
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  CalendarDays,
  Loader2,
  IndianRupee,
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PT_PRESET_SLOTS, formatSlotRange } from '../../lib/ptSlots';

export default function PTDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [clockLoading, setClockLoading] = useState(false);
  const [togglingMemberId, setTogglingMemberId] = useState(null);
  const [updatingSlotId, setUpdatingSlotId] = useState(null);

  const fetchDashboardData = async (selectedMonth = month) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/pt/trainer/dashboard?month=${selectedMonth}`);
      setDashboardData(res.data?.data || res.data);
    } catch (error) {
      console.error('Error fetching PT dashboard:', error);
      toast.error(error.response?.data?.message || 'Failed to load PT dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(month);
  }, [month]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      await api.post('/api/attendance/me/clock-in', {});
      toast.success('Checked in successfully for today');
      await fetchDashboardData(month);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      await api.post('/api/attendance/me/clock-out', {});
      toast.success('Checked out successfully');
      await fetchDashboardData(month);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleToggleTodayDone = async (client) => {
    const nextDone = !client.todayDone;
    setTogglingMemberId(client.memberId);
    try {
      await api.post('/api/pt/trainer/today-done', {
        memberId: client.memberId,
        done: nextDone,
        startTime: client.slotStart || undefined,
      });
      toast.success(
        nextDone
          ? `Marked Today Done for ${client.memberName} (1h 25m)`
          : `Unmarked Today Done for ${client.memberName}`,
      );
      await fetchDashboardData(month);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update session');
    } finally {
      setTogglingMemberId(null);
    }
  };

  const handleSlotChange = async (assignmentId, slotStart) => {
    setUpdatingSlotId(assignmentId);
    try {
      await api.put(`/api/pt/assignments/${assignmentId}/slot`, {
        preferredSlotStart: slotStart || null,
      });
      toast.success('Time slot updated (1h 25m)');
      await fetchDashboardData(month);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Slot conflict or update failed');
    } finally {
      setUpdatingSlotId(null);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Activity className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const {
    trainer,
    todayAttendance,
    assignedClients = [],
    monthlyReport,
    commissionEarned = 0,
  } = dashboardData || {};

  const hasClockedIn = Boolean(todayAttendance?.clockIn);
  const hasClockedOut = Boolean(todayAttendance?.clockOut);
  const doneTodayCount = assignedClients.filter((c) => c.todayDone).length;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header + Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Personal Trainer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {trainer ? `${trainer.name} (${trainer.employeeId})` : 'Daily Check-In, 1h 25m Slots & Monthly Report'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {/* Today's Check-In / Check-Out Card */}
      <Card className="border-primary/20">
        <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Today&apos;s PT Attendance (Check-In / Check-Out)</h2>
              {hasClockedOut ? (
                <Badge variant="secondary">Checked Out</Badge>
              ) : hasClockedIn ? (
                <Badge className="bg-emerald-600 text-white">Checked In</Badge>
              ) : (
                <Badge variant="outline">Not Checked In</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {hasClockedIn
                ? `In: ${new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Click Check In when you arrive at the gym'}
              {hasClockedOut &&
                ` • Out: ${new Date(todayAttendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${todayAttendance.workingHours || 0} hrs)`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClockIn}
              disabled={clockLoading || hasClockedIn}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {clockLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Check In
            </Button>
            <Button
              variant="outline"
              onClick={handleClockOut}
              disabled={clockLoading || !hasClockedIn || hasClockedOut}
              className="gap-2"
            >
              {clockLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Check Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedClients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {doneTodayCount} / {assignedClients.length} done today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Checked In</CardTitle>
            <CalendarDays className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyReport?.daysPresent || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyReport?.totalWorkedHours || 0} total gym hrs ({month})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed PT Sessions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyReport?.completedSessions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyReport?.totalTrainingHours || 0} hrs (1h 25m / session)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commission Earned</CardTitle>
            <IndianRupee className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Number(commissionEarned || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Month: {month}</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Clients + 1h 25m Time Slot + Today Done Checkbox */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Members &amp; Daily 1h 25m Slots</CardTitle>
          <CardDescription>
            Each member gets a 1 hour 25 minute daily slot. Tick &quot;Today Done&quot; after completing today&apos;s training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time Slot (1h 25m)</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Package &amp; Sessions</TableHead>
                <TableHead>Assign / Change Slot</TableHead>
                <TableHead className="text-right">Today Done</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No active members assigned to you yet. Ask Admin/Manager to assign members in Personal Trainers Hub.
                  </TableCell>
                </TableRow>
              ) : (
                assignedClients.map((client) => (
                  <TableRow key={client.assignmentId}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {client.slotStart ? (
                        <Badge variant="outline" className="font-mono">
                          {formatSlotRange(client.slotStart, client.slotEnd)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.memberName}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        ID: {client.memberCode} {client.mobile ? `• ${client.mobile}` : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{client.packageName}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.sessionsRemaining} / {client.sessionsTotal} left
                      </div>
                    </TableCell>
                    <TableCell className="w-48">
                      <CustomSelect
                        value={client.slotStart || ''}
                        disabled={updatingSlotId === client.assignmentId}
                        onChange={(e) => handleSlotChange(client.assignmentId, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-border bg-card px-2 text-xs"
                      >
                        <option value="">-- Select 1h 25m Slot --</option>
                        {PT_PRESET_SLOTS.map((s) => (
                          <option key={s} value={s}>
                            {formatSlotRange(s)}
                          </option>
                        ))}
                      </CustomSelect>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={client.todayDone ? 'default' : 'outline'}
                        disabled={togglingMemberId === client.memberId}
                        onClick={() => handleToggleTodayDone(client)}
                        className={
                          client.todayDone
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
                            : 'gap-1.5'
                        }
                      >
                        {togglingMemberId === client.memberId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <input
                            type="checkbox"
                            readOnly
                            checked={client.todayDone}
                            className="h-4 w-4 accent-emerald-600 pointer-events-none"
                          />
                        )}
                        {client.todayDone ? 'Today Done' : 'Mark Done'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Report Breakdown (Per Client) */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Training Report ({month})</CardTitle>
          <CardDescription>
            Summary of all members trained by you this month (shared with Admin/Owner for payroll)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Sessions Done</TableHead>
                <TableHead>Total Duration</TableHead>
                <TableHead>Dates Trained</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!monthlyReport?.clientBreakdown?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No completed sessions recorded for {month}
                  </TableCell>
                </TableRow>
              ) : (
                monthlyReport.clientBreakdown.map((c) => (
                  <TableRow key={c.memberId}>
                    <TableCell>
                      <div className="font-medium">{c.memberName}</div>
                      <div className="text-xs text-muted-foreground font-mono">ID: {c.memberCode}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{c.sessionsCount}</TableCell>
                    <TableCell>
                      {Math.floor(c.totalMinutes / 60)}h {c.totalMinutes % 60}m
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md">
                      {c.dates.join(', ')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
