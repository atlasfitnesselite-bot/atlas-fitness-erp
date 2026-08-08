import { CustomSelect } from '@/components/ui/custom-select';
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { IndianRupee, FileText, AlertCircle, Search } from 'lucide-react';

export default function BillingDashboard() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Payment Form
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/billing/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(res.data?.invoices || res.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/billing/payments`, {
        invoiceId: selectedInvoice._id || selectedInvoice.id,
        amount: parseFloat(amount),
        method: paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: "Success",
        description: "Payment collected successfully"
      });
      setIsPaymentOpen(false);
      fetchInvoices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setAmount(invoice.amount?.toString() || '');
    setIsPaymentOpen(true);
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status || 'UNKNOWN'}</Badge>;
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + (i.amount || 0), 0);

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || 
    i.memberName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing Dashboard</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and financial overview</p>
        </div>
        <Button className="bg-card hover:bg-slate-800 gap-2">
          <FileText className="h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting collection</p>
          </CardContent>
        </Card>
        <Card className="border-red-100 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">₹{totalOverdue.toFixed(2)}</div>
            <p className="text-xs text-red-600/80">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>View and manage recent billing transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices or members..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice._id || invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber || 'N/A'}</TableCell>
                      <TableCell>{invoice.memberName || 'Unknown'}</TableCell>
                      <TableCell>{invoice.date || invoice.createdAt ? new Date(invoice.date || invoice.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>Rs. {invoice.amount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        {invoice.status !== 'PAID' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openPaymentModal(invoice)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Collect Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <form onSubmit={handleCollectPayment} className="space-y-4 pt-4">
              <div className="rounded-lg bg-background p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Invoice:</span>
                  <span className="font-medium">{selectedInvoice.invoiceNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-medium">{selectedInvoice.memberName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Due:</span>
                  <span className="font-bold text-red-600">Rs. {selectedInvoice.amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount to Collect</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <CustomSelect 
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI / Digital Wallet</option>
                </CustomSelect>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                Confirm Payment
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
