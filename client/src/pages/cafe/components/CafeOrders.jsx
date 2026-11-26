import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomSelect } from '@/components/ui/custom-select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, CreditCard, Printer } from 'lucide-react';

export default function CafeOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [payOrder, setPayOrder] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cafe/orders');
      setOrders(Array.isArray(res.data) ? res.data : res.data?.orders || []);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load cafe orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/cafe/orders/${payOrder.id}/pay`, {
        amount: parseFloat(payAmount),
        paymentMethod: payMethod,
      });
      toast({ title: 'Success', description: 'Payment recorded for order' });
      setPayOrder(null);
      fetchOrders();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record payment',
      });
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = paymentFilter === 'ALL' || (o.paymentStatus || 'PENDING') === paymentFilter;
    const matchesSearch =
      !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone?.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Cafeteria Orders &amp; Billing</CardTitle>
        <CardDescription>All cafe orders with GST breakdown, payment status, and receipts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order #, customer, phone..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={paymentFilter === st ? 'default' : 'outline'}
                onClick={() => setPaymentFilter(st)}
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
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No orders found</TableCell>
                </TableRow>
              ) : (
                filtered.map((ord) => (
                  <TableRow key={ord.id}>
                    <TableCell className="font-medium">{ord.orderNumber}</TableCell>
                    <TableCell>
                      <div>{ord.customerName || 'Walk-in'}</div>
                      {ord.customerPhone && (
                        <div className="text-xs text-muted-foreground">{ord.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell>{ord.items?.length || 0}</TableCell>
                    <TableCell>₹{Number(ord.gstAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>₹{Number(ord.totalAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>₹{Number(ord.paidAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={ord.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                        className={ord.paymentStatus === 'PAID' ? 'bg-green-600 text-white' : ''}
                      >
                        {ord.paymentStatus || 'PENDING'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDetailsOrder(ord)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ord.paymentStatus !== 'PAID' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPayOrder(ord);
                              setPayAmount(Math.max(0, ord.totalAmount - (ord.paidAmount || 0)).toFixed(2));
                            }}
                          >
                            <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={Boolean(detailsOrder)} onOpenChange={() => setDetailsOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order {detailsOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {detailsOrder && (
            <div className="space-y-3 text-sm">
              <div className="space-y-1 border-b pb-2">
                {detailsOrder.items?.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.productName || it.item?.name} × {it.quantity}</span>
                    <span>₹{(Number(it.price) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₹{Number(detailsOrder.subtotal || detailsOrder.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CGST + SGST:</span>
                <span>₹{Number(detailsOrder.cgst || 0).toFixed(2)} + ₹{Number(detailsOrder.sgst || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total:</span>
                <span>₹{Number(detailsOrder.totalAmount).toFixed(2)}</span>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(payOrder)} onOpenChange={() => setPayOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Cafe Payment ({payOrder?.orderNumber})</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCollectPayment} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <CustomSelect
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </CustomSelect>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">Confirm Payment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
