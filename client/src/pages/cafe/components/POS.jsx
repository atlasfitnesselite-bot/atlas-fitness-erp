import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, Search } from 'lucide-react';
import api from '../../../lib/api';

export default function POS() {
  const { toast } = useToast();

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('AMOUNT');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cafe/menu');
      setMenuItems(res.data?.items || res.data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load menu items.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((i) => i.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = category === 'ALL' || item.category === category;
      const matchesSearch =
        !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [menuItems, category, search]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const rawDiscount = parseFloat(discount) || 0;
    const discountAmount =
      rawDiscount > 0
        ? discountType === 'PERCENTAGE'
          ? (subtotal * rawDiscount) / 100
          : rawDiscount
        : 0;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const ratio = subtotal > 0 ? discountedSubtotal / subtotal : 0;

    let gstAmount = 0;
    cart.forEach((item) => {
      const itemTotal = Number(item.price) * item.quantity * ratio;
      gstAmount += (itemTotal * (item.gstRate ?? 0)) / 100;
    });

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const total = discountedSubtotal + gstAmount;
    return { subtotal, discountAmount, discountedSubtotal, gstAmount, cgst, sgst, total };
  }, [cart, discount, discountType]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        discount: parseFloat(discount) || 0,
        discountType,
        paymentMethod,
      };

      const res = await api.post('/api/cafe/orders', orderData);
      const createdOrder = res.data;

      if (paymentMethod === 'RAZORPAY' && createdOrder?.id && window.Razorpay) {
        const rzpRes = await api.post(`/api/cafe/orders/${createdOrder.id}/razorpay/create`);
        const rzp = new window.Razorpay({
          key: rzpRes.data.key,
          amount: rzpRes.data.order.amount,
          currency: rzpRes.data.order.currency,
          name: 'Atlas Fitness Cafe',
          description: `Order ${createdOrder.orderNumber}`,
          order_id: rzpRes.data.order.id,
          handler: async (response) => {
            await api.post(`/api/cafe/orders/${createdOrder.id}/razorpay/verify`, response);
            toast({ title: 'Paid', description: 'Razorpay payment verified!' });
          },
        });
        rzp.open();
      } else {
        toast({ title: 'Success', description: `Order ${createdOrder.orderNumber || ''} placed!` });
      }

      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount('');
      fetchMenu();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to place order.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="border-border min-h-[600px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Cafeteria Menu</CardTitle>
                <CardDescription>Select items to add to the bill (per-item GST supported).</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap pt-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={category === cat ? 'default' : 'outline'}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading menu...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="border-border overflow-hidden flex flex-col justify-between">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
                        <Badge variant="outline" className="font-semibold shrink-0">
                          ₹{Number(item.price).toFixed(2)}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {item.description || item.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 pb-2 mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={item.stock <= 5 ? 'destructive' : 'secondary'}>
                          Stock: {item.stock}
                        </Badge>
                        {item.gstRate > 0 && (
                          <span className="text-xs text-muted-foreground">GST {item.gstRate}%</span>
                        )}
                      </div>
                      <Button
                        onClick={() => addToCart(item)}
                        disabled={item.stock === 0 || !item.isAvailable}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        {item.stock === 0 ? 'Out of Stock' : 'Add to Bill'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="border-border sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Current Bill
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Customer Name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in / Member"
                />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit phone"
                />
              </div>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Cart is empty.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{Number(item.price).toFixed(2)} {item.gstRate ? `(+${item.gstRate}% GST)` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <Label className="text-xs">Discount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <CustomSelect
                  className="flex h-10 w-full rounded-md border border-border bg-card px-2 py-1 text-sm"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="AMOUNT">₹ Amount</option>
                  <option value="PERCENTAGE">% Percent</option>
                </CustomSelect>
              </div>
            </div>

            <div>
              <Label className="text-xs">Payment Method</Label>
              <CustomSelect
                className="flex h-10 w-full rounded-md border border-border bg-card px-2 py-1 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH">Cash (Instant Paid)</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="RAZORPAY">Razorpay Online</option>
              </CustomSelect>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>CGST + SGST:</span>
                <span>₹{totals.cgst.toFixed(2)} + ₹{totals.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Total:</span>
                <span>₹{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCheckout}
              disabled={cart.length === 0 || submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Placing Order...' : `Place Order (₹${totals.total.toFixed(2)})`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
