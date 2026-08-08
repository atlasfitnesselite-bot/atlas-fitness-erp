import { CustomSelect } from '@/components/ui/custom-select';
import React, { useState, useEffect } from "react";
import api from '../../lib/api';
import { useAuthStore } from "@/store/useAuthStore";
import { Plus, IndianRupee, Calendar, FileText, LayoutList, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesDashboard() {
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        api.get("/api/expenses", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        api.get("/api/expenses/categories", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
      ]);

      setExpenses(expensesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: error.response?.data?.message || error.message || "Failed to load expenses data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!amount || !description || !date || !category) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newExpense = {
        amount: Number(amount),
        description,
        date,
        categoryId: category,
      };

      await api.post("/api/expenses", newExpense, { headers: { Authorization: `Bearer ${token}` } });
      
      toast({
        title: "Expense Recorded",
        description: "Your expense has been added successfully.",
      });
      
      // Reset form
      setAmount("");
      setDescription("");
      setDate("");
      setCategory("");
      setIsModalOpen(false);
      
      // Refresh list
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to record expense",
        description: error.response?.data?.message || error.message || "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "₹0.00";
    return `₹${num.toFixed(2)}`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Manage and track your company expenses.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateExpense}>
                <DialogHeader>
                  <DialogTitle>Record New Expense</DialogTitle>
                  <DialogDescription>
                    Add a new expense record to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <div className="col-span-3 relative">
                      <LayoutList className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <CustomSelect
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="" disabled>Select category</option>
                        {categories.map((c, i) => {
                          const catId = typeof c === 'object' ? (c.id || c._id) : c;
                          const catName = typeof c === 'object' ? (c.name || c.id || `Category ${i}`) : c;
                          return (
                            <option key={i} value={catId}>
                              {catName}
                            </option>
                          );
                        })}
                      </CustomSelect>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <div className="col-span-3 relative">
                      <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-9"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <div className="col-span-3 relative">
                      <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="description"
                        placeholder="Dinner with client"
                        className="pl-9"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <div className="col-span-3 relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-9"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Expense"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            A list of all recent company expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense, idx) => (
                      <TableRow key={expense.id || idx}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {expense.category?.name || expense.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
