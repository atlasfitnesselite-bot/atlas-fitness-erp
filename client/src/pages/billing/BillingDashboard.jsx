import { CustomSelect } from '@/components/ui/custom-select';
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  IndianRupee,
  FileText,
  AlertCircle,
  Search,
  Download,
  Mail,
  Eye,
  Trash2,
  Plus,
  CreditCard,
  Pencil,
  Printer,
  Share2,
  RefreshCw,
} from 'lucide-react';

const getMemberFullName = (inv) => {
  if (inv?.member) {
    return `${inv.member.firstName || ''} ${inv.member.lastName || ''}`.trim() || 'Unknown';
  }
  return inv?.memberName || 'Unknown';
};

const getEffectiveTotal = (inv) => {
  if (!inv) return 0;
  return inv.totalAmount > 0 ? inv.totalAmount : inv.amount || 0;
};

export default function BillingDashboard() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [ptPackages, setPtPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Collect Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amount, setAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Create Invoice Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    billType: 'MEMBERSHIP',
    memberId: '',
    planId: '',
    ptPackageId: '',
    amount: '',
    gstRate: '5',
    discount: '0',
    discountType: 'AMOUNT',
    lateFee: '0',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    paymentMethod: 'CASH',
    memberGstNumber: '',
    memberPanNumber: '',
    memberAddress: '',
    notes: '',
  });

  // Details Modal
  const [detailsInvoice, setDetailsInvoice] = useState(null);

  // Edit Modal
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [syncingOld, setSyncingOld] = useState(false);

  const handleSyncOldDb = async () => {
    try {
      setSyncingOld(true);
      const res = await api.post('/api/billing/sync-old-db');
      const sum = res.data?.summary;
      toast({
        title: 'Old DB Synced',
        description: sum
          ? `Added ${sum.newMembers} members, ${sum.newInvoices} invoices, updated ${sum.updatedInvoices} invoices.`
          : res.data?.message || 'Sync complete',
      });
      fetchAll();
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error.response?.data?.message || 'Could not sync old database',
        variant: 'destructive',
      });
    } finally {
      setSyncingOld(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [invRes, memRes, planRes, ptPkgRes] = await Promise.allSettled([
        api.get('/api/billing/invoices'),
        api.get('/api/members?limit=500'),
        api.get('/api/subscriptions/plans'),
        api.get('/api/pt/packages'),
      ]);

      if (invRes.status === 'fulfilled') {
        setInvoices(invRes.value.data?.invoices || invRes.value.data || []);
      }
      if (memRes.status === 'fulfilled') {
        const list = memRes.value.data?.data || memRes.value.data?.members || memRes.value.data || [];
        setMembers(Array.isArray(list) ? list : []);
      }
      if (planRes.status === 'fulfilled') {
        const list = planRes.value.data?.plans || planRes.value.data?.data || planRes.value.data || [];
        const sorted = Array.isArray(list)
          ? [...list].sort((a, b) => (a.durationInMonths ?? 999) - (b.durationInMonths ?? 999) || (a.price ?? 0) - (b.price ?? 0))
          : [];
        setPlans(sorted);
      }
      if (ptPkgRes.status === 'fulfilled') {
        const list = ptPkgRes.value.data?.data || ptPkgRes.value.data || [];
        setPtPackages(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load billing data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const previewTotals = useMemo(() => {
    const base = parseFloat(form.amount) || 0;
    const gstRate = form.gstRate === '' ? (form.billType === 'PT' ? 0 : 5) : parseFloat(form.gstRate) || 0;
    const discount = parseFloat(form.discount) || 0;
    const lateFee = parseFloat(form.lateFee) || 0;
    const discountVal =
      discount > 0
        ? form.discountType === 'PERCENTAGE'
          ? (base * discount) / 100
          : discount
        : 0;
    const taxable = Math.max(0, base - discountVal);
    const gstAmount = (taxable * gstRate) / 100;
    const total = taxable + gstAmount + lateFee;
    return { taxable, gstAmount, cgst: gstAmount / 2, sgst: gstAmount / 2, total };
  }, [form]);

  const handleBillTypeChange = (billType) => {
    setForm((prev) => ({
      ...prev,
      billType,
      planId: billType === 'PT' ? '' : prev.planId,
      ptPackageId: billType === 'MEMBERSHIP' ? '' : prev.ptPackageId,
      gstRate: billType === 'PT' ? '0' : '5',
      notes: billType === 'PT' ? (prev.notes || 'Personal Training Fee (No GST)') : '',
    }));
  };

  const handlePtPackageChange = (ptPackageId) => {
    const pkg = ptPackages.find((p) => p.id === ptPackageId);
    setForm((prev) => ({
      ...prev,
      ptPackageId,
      amount: pkg ? String(pkg.price) : prev.amount,
      gstRate: '0',
      notes: pkg ? `Personal Training: ${pkg.name}` : prev.notes,
    }));
  };

  const handlePlanChange = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    setForm((prev) => ({
      ...prev,
      planId,
      amount: plan ? String(plan.price) : prev.amount,
      gstRate: '5',
    }));
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.amount) {
      toast({ title: 'Validation', description: 'Select a member and amount', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      await api.post('/api/billing/invoices', {
        memberId: form.memberId,
        planId: form.billType === 'MEMBERSHIP' ? form.planId || undefined : undefined,
        amount: parseFloat(form.amount),
        gstRate: form.gstRate === '' ? (form.billType === 'PT' ? 0 : 5) : parseFloat(form.gstRate),
        discount: parseFloat(form.discount) || 0,
        discountType: form.discountType,
        lateFee: parseFloat(form.lateFee) || 0,
        dueDate: form.dueDate,
        status: form.status,
        paymentMethod: form.status === 'PAID' ? form.paymentMethod : undefined,
        memberGstNumber: form.memberGstNumber || undefined,
        memberPanNumber: form.memberPanNumber || undefined,
        memberAddress: form.memberAddress || undefined,
        notes:
          form.notes ||
          (form.billType === 'PT' ? 'Personal Training Fee (No GST)' : undefined),
      });
      toast({ title: 'Success', description: 'Invoice generated successfully' });
      setIsCreateOpen(false);
      setForm({
        billType: 'MEMBERSHIP',
        memberId: '',
        planId: '',
        ptPackageId: '',
        amount: '',
        gstRate: '5',
        discount: '0',
        discountType: 'AMOUNT',
        lateFee: '0',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        paymentMethod: 'CASH',
        memberGstNumber: '',
        memberPanNumber: '',
        memberAddress: '',
        notes: '',
      });
      fetchAll();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/billing/payments', {
        invoiceId: selectedInvoice.id,
        amount: parseFloat(amount),
        paymentMethod,
        transactionReference: transactionRef || undefined,
      });
      toast({ title: 'Success', description: 'Payment recorded successfully' });
      setIsPaymentOpen(false);
      setTransactionRef('');
      fetchAll();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process payment',
        variant: 'destructive',
      });
    }
  };

  const handleRazorpayPay = async (invoice) => {
    try {
      const { data } = await api.post('/api/billing/razorpay/create', { invoiceId: invoice.id });
      if (!window.Razorpay) {
        toast({
          title: 'Razorpay SDK not loaded',
          description: 'Please include Razorpay checkout script or use manual payment collection.',
          variant: 'destructive',
        });
        return;
      }
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Atlas Fitness',
        description: `Invoice ${invoice.invoiceNumber || ''}`,
        order_id: data.order.id,
        handler: async (response) => {
          await api.post('/api/billing/razorpay/verify', {
            invoiceId: invoice.id,
            ...response,
          });
          toast({ title: 'Success', description: 'Razorpay payment verified!' });
          fetchAll();
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({
        title: 'Razorpay Error',
        description: error.response?.data?.message || 'Could not initiate Razorpay order',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      const res = await api.get(`/api/billing/invoices/${invoice.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoice.invoiceNumber || invoice.id.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Error', description: 'Failed to download PDF', variant: 'destructive' });
    }
  };

  const handleSendEmail = async (invoice) => {
    try {
      const res = await api.post(`/api/billing/invoices/${invoice.id}/send-email`);
      toast({ title: 'Email Sent', description: res.data?.message || 'Invoice emailed to member' });
    } catch (error) {
      toast({
        title: 'Email Failed',
        description: error.response?.data?.message || 'Could not send invoice email',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber || invoice.id}?`)) return;
    try {
      await api.delete(`/api/billing/invoices/${invoice.id}`);
      toast({ title: 'Deleted', description: 'Invoice deleted successfully' });
      fetchAll();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete invoice',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (invoice) => {
    setEditingInvoice({
      ...invoice,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      gstRate: invoice.gstRate ?? 18,
      discount: invoice.discount ?? 0,
      discountType: invoice.discountType || 'AMOUNT',
      lateFee: invoice.lateFee ?? 0,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingInvoice) return;
    try {
      setSavingEdit(true);
      await api.put(`/api/billing/invoices/${editingInvoice.id}`, {
        amount: parseFloat(editingInvoice.amount),
        gstRate: parseFloat(editingInvoice.gstRate),
        discount: parseFloat(editingInvoice.discount) || 0,
        discountType: editingInvoice.discountType,
        lateFee: parseFloat(editingInvoice.lateFee) || 0,
        dueDate: editingInvoice.dueDate,
        status: editingInvoice.status,
        memberGstNumber: editingInvoice.memberGstNumber || undefined,
        memberPanNumber: editingInvoice.memberPanNumber || undefined,
        notes: editingInvoice.notes || undefined,
      });
      toast({ title: 'Updated', description: 'Invoice updated successfully' });
      setEditingInvoice(null);
      fetchAll();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update invoice',
        variant: 'destructive',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleShareInvoice = async (inv) => {
    const text = `Atlas Fitness Invoice ${inv.invoiceNumber || inv.id}\nMember: ${getMemberFullName(inv)}\nTotal: ₹${getEffectiveTotal(inv).toFixed(2)}\nStatus: ${inv.status}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Invoice ${inv.invoiceNumber || ''}`, text });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard?.writeText(text);
    toast({ title: 'Copied', description: 'Invoice summary copied to clipboard' });
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    const total = getEffectiveTotal(invoice);
    const remaining = Math.max(0, total - (invoice.paidAmount || 0));
    setAmount(remaining.toFixed(2));
    setIsPaymentOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Partial</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status || 'UNKNOWN'}</Badge>;
    }
  };

  const totalRevenue = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalPending = invoices
    .filter((i) => i.status === 'PENDING' || i.status === 'PARTIAL')
    .reduce((sum, i) => sum + Math.max(0, getEffectiveTotal(i) - (i.paidAmount || 0)), 0);
  const totalOverdue = invoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + Math.max(0, getEffectiveTotal(i) - (i.paidAmount || 0)), 0);

  const filteredInvoices = invoices.filter((i) => {
    const matchesStatus = statusFilter === 'ALL' || i.status?.toUpperCase() === statusFilter;
    const memberName = getMemberFullName(i).toLowerCase();
    const memberCode = i.member?.memberId?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      i.invoiceNumber?.toLowerCase().includes(q) ||
      memberName.includes(q) ||
      memberCode.includes(q) ||
      i.member?.mobile?.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoices &amp; Bills</h1>
          <p className="text-muted-foreground">GST invoices, partial &amp; Razorpay payments, PDF &amp; email receipts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncOldDb} disabled={syncingOld} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncingOld ? 'animate-spin' : ''}`} />
            {syncingOld ? 'Syncing...' : 'Sync Old DB'}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Generate Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Actual paid amounts across all invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pending &amp; partial dues</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalOverdue.toFixed(2)}</div>
            <p className="text-xs text-red-500/80">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>View, download PDF, email, or collect payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice #, member name, ID, or phone..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PAID', 'PARTIAL', 'PENDING', 'OVERDUE'].map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={statusFilter === st ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Total (incl. GST)</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const total = getEffectiveTotal(invoice);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{getMemberFullName(invoice)}</div>
                          {invoice.member?.memberId && (
                            <div className="text-xs text-muted-foreground font-mono">ID: {invoice.member.memberId}</div>
                          )}
                        </TableCell>
                        <TableCell>{invoice.plan?.name || '-'}</TableCell>
                        <TableCell>₹{total.toFixed(2)}</TableCell>
                        <TableCell>₹{(invoice.paidAmount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                              onClick={() => setDetailsInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Invoice"
                              onClick={() => openEditModal(invoice)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Download PDF"
                              onClick={() => handleDownloadPdf(invoice)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Send Email"
                              onClick={() => handleSendEmail(invoice)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            {invoice.status !== 'PAID' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPaymentModal(invoice)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Collect
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="Pay via Razorpay"
                                  onClick={() => handleRazorpayPay(invoice)}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => handleDeleteInvoice(invoice)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Collect Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <form onSubmit={handleCollectPayment} className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice:</span>
                  <span className="font-medium">{selectedInvoice.invoiceNumber || selectedInvoice.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-medium">{getMemberFullName(selectedInvoice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance Due:</span>
                  <span className="font-bold text-red-600">
                    ₹{Math.max(0, getEffectiveTotal(selectedInvoice) - (selectedInvoice.paidAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount to Collect (supports partial payment)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <CustomSelect
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="NETBANKING">NetBanking</option>
                </CustomSelect>
              </div>

              <div className="space-y-2">
                <Label>Transaction Reference (Optional)</Label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UPI Ref / Receipt #"
                />
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                Confirm Payment
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate GST Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Bill Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={form.billType === 'MEMBERSHIP' ? 'default' : 'outline'}
                  onClick={() => handleBillTypeChange('MEMBERSHIP')}
                  className={form.billType === 'MEMBERSHIP' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                >
                  Membership (5% GST)
                </Button>
                <Button
                  type="button"
                  variant={form.billType === 'PT' ? 'default' : 'outline'}
                  onClick={() => handleBillTypeChange('PT')}
                  className={form.billType === 'PT' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                >
                  Personal Training (No GST)
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Member *</Label>
                <CustomSelect
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  value={form.memberId}
                  onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName !== '-' ? m.lastName : ''} ({m.memberId})
                    </option>
                  ))}
                </CustomSelect>
              </div>
              {form.billType === 'MEMBERSHIP' ? (
                <div className="space-y-2">
                  <Label>Membership Plan (Optional)</Label>
                  <CustomSelect
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                    value={form.planId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                  >
                    <option value="">Custom / No Plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>PT Package / Custom Amount</Label>
                  <CustomSelect
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                    value={form.ptPackageId}
                    onChange={(e) => handlePtPackageChange(e.target.value)}
                  >
                    <option value="">Custom PT Fee</option>
                    {ptPackages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.numberOfSessions} sessions - ₹{p.price})
                      </option>
                    ))}
                  </CustomSelect>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Base Amount (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>GST Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.gstRate}
                  onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Discount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Discount Type</Label>
                <CustomSelect
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  <option value="AMOUNT">₹ Amount</option>
                  <option value="PERCENTAGE">% Percent</option>
                </CustomSelect>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Late Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.lateFee}
                  onChange={(e) => setForm({ ...form, lateFee: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Initial Status</Label>
                <CustomSelect
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </CustomSelect>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Member GSTIN (B2B Optional)</Label>
                <Input
                  value={form.memberGstNumber}
                  onChange={(e) => setForm({ ...form, memberGstNumber: e.target.value })}
                  placeholder="e.g. 36AABCU9603R1ZM"
                />
              </div>
              <div className="space-y-1">
                <Label>Member PAN (Optional)</Label>
                <Input
                  value={form.memberPanNumber}
                  onChange={(e) => setForm({ ...form, memberPanNumber: e.target.value })}
                  placeholder="e.g. ABCDE1234F"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Taxable Amount:</span>
                <span>₹{previewTotals.taxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>CGST + SGST:</span>
                <span>₹{previewTotals.cgst.toFixed(2)} + ₹{previewTotals.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Grand Total:</span>
                <span>₹{previewTotals.total.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" disabled={creating} className="w-full bg-red-600 hover:bg-red-700 text-white">
              {creating ? 'Creating...' : 'Create Invoice'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={Boolean(detailsInvoice)} onOpenChange={() => setDetailsInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Invoice {detailsInvoice?.invoiceNumber || detailsInvoice?.id?.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          {detailsInvoice && (
            <div className="space-y-3 text-sm pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member:</span>
                <span className="font-medium">{getMemberFullName(detailsInvoice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Amount:</span>
                <span>₹{Number(detailsInvoice.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CGST / SGST ({detailsInvoice.gstRate ?? 5}%):</span>
                <span>
                  ₹{Number(detailsInvoice.cgst || 0).toFixed(2)} + ₹{Number(detailsInvoice.sgst || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span>
                  {detailsInvoice.discount || 0} {detailsInvoice.discountType === 'PERCENTAGE' ? '%' : '₹'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{getEffectiveTotal(detailsInvoice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Paid Amount:</span>
                <span>₹{Number(detailsInvoice.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex gap-2 pt-3 flex-wrap">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleDownloadPdf(detailsInvoice)}>
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSendEmail(detailsInvoice)}>
                  <Mail className="h-4 w-4" /> Email
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleShareInvoice(detailsInvoice)}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={Boolean(editingInvoice)} onOpenChange={() => setEditingInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Invoice {editingInvoice?.invoiceNumber || ''}</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Base Amount (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingInvoice.amount}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>GST Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingInvoice.gstRate}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, gstRate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingInvoice.discount}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, discount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount Type</Label>
                  <CustomSelect
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
                    value={editingInvoice.discountType}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, discountType: e.target.value })}
                  >
                    <option value="AMOUNT">₹ Amount</option>
                    <option value="PERCENTAGE">% Percent</option>
                  </CustomSelect>
                </div>
                <div>
                  <Label>Late Fee (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingInvoice.lateFee}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, lateFee: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editingInvoice.dueDate}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <CustomSelect
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
                  value={editingInvoice.status}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </CustomSelect>
              </div>
              <Button type="submit" disabled={savingEdit} className="w-full bg-red-600 hover:bg-red-700 text-white">
                {savingEdit ? 'Saving...' : 'Save Invoice Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
